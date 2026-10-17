/**
 * Serveur backend pour KAYDO TIKTOK DOWNLOADER
 * Gère l'analyse des liens TikTok, les redirections, le proxy de streaming et l'archivage ZIP.
 */

import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Anti-abuse: simple in-memory rate limiter
const ipRequests = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 40;

function rateLimitMiddleware(req: Request, res: Response, next: () => void) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const entry = ipRequests.get(ip);

  if (!entry || now > entry.resetTime) {
    ipRequests.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return res.status(429).json({
      error: 'Trop de requêtes. Veuillez patienter une minute avant de réessayer.',
    });
  }

  entry.count++;
  next();
}

app.use('/api', rateLimitMiddleware);

// Validation SSRF stricte pour TikTok
const ALLOWED_TIKTOK_DOMAINS = [
  'tiktok.com',
  'www.tiktok.com',
  'vm.tiktok.com',
  'vt.tiktok.com',
  'm.tiktok.com',
  't.tiktok.com',
  'v.douyin.com',
];

function isSafeTikTokUrl(inputUrl: string): boolean {
  try {
    const parsed = new URL(inputUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    return ALLOWED_TIKTOK_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

// Media CDN whitelist for safe proxy streaming
const ALLOWED_MEDIA_DOMAINS = [
  'tikwm.com',
  'tiktokcdn.com',
  'tiktokcdn-us.com',
  'tiktokv.com',
  'tiktokv.us',
  'akamaized.net',
  'ibytedtos.com',
  'byteoversea.com',
  'byteimg.com',
  'bytegecko.com',
  'tiktok.com',
  'musical.ly',
];

function isSafeMediaUrl(mediaUrl: string): boolean {
  try {
    const parsed = new URL(mediaUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    // Do not allow local/private networks
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.')
    ) {
      return false;
    }
    return ALLOWED_MEDIA_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/**
 * Résout les redirections pour obtenir l'URL finale (vm.tiktok.com -> www.tiktok.com/@user/video/...)
 */
async function resolveTikTokUrl(rawUrl: string): Promise<string> {
  let currentUrl = rawUrl.trim();
  
  // Normalise les liens sans schéma
  if (!currentUrl.startsWith('http://') && !currentUrl.startsWith('https://')) {
    currentUrl = 'https://' + currentUrl;
  }

  if (!isSafeTikTokUrl(currentUrl)) {
    throw new Error("L'URL fournie n'est pas un lien TikTok valide.");
  }

  try {
    const response = await fetch(currentUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    const finalUrl = response.url;
    if (isSafeTikTokUrl(finalUrl)) {
      return finalUrl;
    }
    return currentUrl;
  } catch (err) {
    // Si la résolution échoue, retourner l'URL d'origine si valide
    return currentUrl;
  }
}

/**
 * Route santé
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'KAYDO TIKTOK DOWNLOADER',
    version: '1.0.0',
    time: new Date().toISOString(),
  });
});

/**
 * Route d'analyse du lien TikTok
 */
app.post('/api/tiktok/analyze', async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({
      error: 'Veuillez fournir un lien TikTok valide.',
    });
  }

  const trimmedUrl = url.trim();

  // Test de base de l'URL
  if (!isSafeTikTokUrl(trimmedUrl) && !trimmedUrl.includes('tiktok.com')) {
    return res.status(400).json({
      error: 'Ce lien ne provient pas de TikTok. Assurez-vous de coller un lien commençant par tiktok.com, vm.tiktok.com ou vt.tiktok.com.',
    });
  }

  try {
    // 1. Résoudre les redirections
    const resolvedUrl = await resolveTikTokUrl(trimmedUrl);
    const parsedResolved = new URL(resolvedUrl);
    const pathname = parsedResolved.pathname;

    // 2. Détection: Lien Profil
    // Ex: /@username ou /@username/
    const profileMatch = pathname.match(/^\/@([a-zA-Z0-9_.-]+)\/?$/);
    const isProfile = Boolean(profileMatch) && !pathname.includes('/video/') && !pathname.includes('/photo/');

    if (isProfile && profileMatch) {
      const username = profileMatch[1];
      try {
        // Interroger l'API pour récupérer les données publiques du profil
        const userApiUrl = `https://www.tikwm.com/api/user/info?unique_id=${encodeURIComponent(username)}`;
        const userRes = await fetch(userApiUrl, {
          headers: { 'User-Agent': USER_AGENT },
        });

        const userData = await userRes.json();

        // Récupérer les publications récentes publiques si possible
        let posts: any[] = [];
        try {
          const postsApiUrl = `https://www.tikwm.com/api/user/posts?unique_id=${encodeURIComponent(username)}&count=12`;
          const postsRes = await fetch(postsApiUrl, {
            headers: { 'User-Agent': USER_AGENT },
          });
          const postsData = await postsRes.json();
          if (postsData.code === 0 && postsData.data?.videos) {
            posts = postsData.data.videos.map((v: any) => ({
              id: v.video_id || v.id,
              title: v.title || 'Vidéo sans titre',
              cover: v.cover || v.origin_cover || '',
              duration: v.duration || 0,
              playCount: v.play_count || 0,
              diggCount: v.digg_count || 0,
              videoUrl: v.play || v.wmplay || '',
              webVideoUrl: `https://www.tiktok.com/@${username}/video/${v.video_id || v.id}`,
              type: v.images && v.images.length > 0 ? 'photo_carousel' : 'video',
            }));
          }
        } catch {
          // Si la liste des posts échoue, on continue avec les infos de profil
        }

        if (userData.code === 0 && userData.data?.user) {
          const u = userData.data.user;
          const stats = userData.data.stats || {};
          return res.json({
            type: 'profile',
            id: u.id,
            author: {
              id: u.id,
              uniqueId: u.uniqueId || username,
              nickname: u.nickname || username,
              avatar: u.avatarLarger || u.avatarMedium || u.avatarThumb || '',
              signature: u.signature || '',
              verified: Boolean(u.verified),
              followingCount: stats.followingCount || 0,
              followerCount: stats.followerCount || 0,
              heartCount: stats.heartCount || 0,
              videoCount: stats.videoCount || posts.length,
            },
            posts,
            totalPosts: stats.videoCount || posts.length,
            originalUrl: trimmedUrl,
          });
        }

        // Si l'API TikWM n'a pas pu renvoyer le profil
        try {
          const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=https://www.tiktok.com/@${encodeURIComponent(username)}`, {
            headers: { 'User-Agent': USER_AGENT }
          });
          if (oembedRes.ok) {
            const oembedData = await oembedRes.json();
            return res.json({
              type: 'profile',
              author: {
                uniqueId: username,
                nickname: oembedData.author_name || username,
                avatar: '',
                signature: 'Profil public TikTok',
                verified: false,
                videoCount: 0,
              },
              posts: [],
              totalPosts: 0,
              originalUrl: trimmedUrl,
            });
          }
        } catch {}

        return res.json({
          type: 'profile',
          author: {
            uniqueId: username,
            nickname: username,
            avatar: '',
            signature: 'Profil public TikTok',
            verified: false,
          },
          posts: [],
          totalPosts: 0,
          originalUrl: trimmedUrl,
        });
      } catch (err: any) {
        // Fallback vers l'API oEmbed officielle de TikTok
        try {
          const oembedRes = await fetch(`https://www.tiktok.com/oembed?url=https://www.tiktok.com/@${encodeURIComponent(username)}`, {
            headers: { 'User-Agent': USER_AGENT }
          });
          if (oembedRes.ok) {
            const oembedData = await oembedRes.json();
            return res.json({
              type: 'profile',
              author: {
                uniqueId: username,
                nickname: oembedData.author_name || username,
                avatar: '',
                signature: 'Profil public TikTok',
                verified: false,
              },
              posts: [],
              totalPosts: 0,
              originalUrl: trimmedUrl,
            });
          }
        } catch {}

        return res.json({
          type: 'profile',
          author: {
            uniqueId: username,
            nickname: username,
            avatar: '',
            signature: 'Profil public TikTok',
            verified: false,
          },
          posts: [],
          totalPosts: 0,
          originalUrl: trimmedUrl,
        });
      }
    }

    // 3. Détection: Lien Musique / Audio TikTok
    if (pathname.includes('/music/')) {
      return res.json({
        type: 'unsupported',
        reason: "Ce lien renvoie vers une page de son/musique TikTok générale plutôt qu'une publication précise. Pour télécharger l'audio d'une vidéo, veuillez coller le lien direct de la vidéo contenant cette musique.",
        originalUrl: trimmedUrl,
        resolvedUrl,
        detectedType: 'music_page',
      });
    }

    // 4. Détection: Vidéo ou Diaporama Photo (Carousel)
    // Utiliser l'API TikWM avec hd=1
    const tikwmUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(trimmedUrl)}&hd=1`;
    const response = await fetch(tikwmUrl, {
      headers: {
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new Error(`Le serveur de récupération a répondu avec le statut ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 0 || !data.data) {
      const msg = data.msg || 'Contenu introuvable';
      if (msg.toLowerCase().includes('private') || msg.toLowerCase().includes('privé')) {
        return res.status(403).json({
          error: 'Cette publication TikTok est privée ou son auteur a restreint son accès.',
        });
      }
      if (msg.toLowerCase().includes('deleted') || msg.toLowerCase().includes('supprimé')) {
        return res.status(404).json({
          error: 'Cette vidéo TikTok a été supprimée par son créateur ou par la plateforme.',
        });
      }
      return res.status(404).json({
        error: `Impossible d'analyser ce contenu TikTok (${msg}). Vérifiez que la vidéo est publique et accessible.`,
      });
    }

    const item = data.data;

    // A. Est-ce un diaporama de photos (Carrousel) ?
    const isCarousel = Array.isArray(item.images) && item.images.length > 0;

    const author = {
      id: item.author?.id,
      uniqueId: item.author?.unique_id || 'tiktok_user',
      nickname: item.author?.nickname || 'Créateur TikTok',
      avatar: item.author?.avatar || '',
      verified: Boolean(item.author?.is_verified),
    };

    const stats = {
      plays: item.play_count || 0,
      likes: item.digg_count || 0,
      comments: item.comment_count || 0,
      shares: item.share_count || 0,
      downloads: item.download_count || 0,
    };

    const music = item.music_info
      ? {
          id: item.music_info.id,
          title: item.music_info.title || 'Son original',
          author: item.music_info.author || author.nickname,
          playUrl: item.music || item.music_info.play,
          cover: item.music_info.cover,
          duration: item.music_info.duration,
        }
      : item.music
      ? {
          title: 'Son original',
          author: author.nickname,
          playUrl: item.music,
        }
      : undefined;

    if (isCarousel) {
      // Nettoyage et formatage des images
      const images: string[] = item.images.map((img: string) => {
        if (img.startsWith('//')) return 'https:' + img;
        return img;
      });

      return res.json({
        id: item.id || String(Date.now()),
        type: 'photo_carousel',
        title: item.title || 'Diaporama photos TikTok',
        cover: item.cover || item.origin_cover || images[0] || '',
        images,
        imageCount: images.length,
        createdAt: item.create_time,
        author,
        stats,
        music,
        originalUrl: trimmedUrl,
      });
    }

    // B. C'est une vidéo standard
    // Normaliser les liens de téléchargement
    const fixUrl = (u?: string) => {
      if (!u) return undefined;
      if (u.startsWith('//')) return 'https:' + u;
      return u;
    };

    const noWatermark = fixUrl(item.play) || '';
    const noWatermarkHd = fixUrl(item.hdplay) || noWatermark;
    const musicUrl = fixUrl(item.music);

    if (!noWatermark) {
      return res.status(404).json({
        error: "Aucun flux vidéo sans filigrane n'a pu être extrait pour cette publication.",
      });
    }

    return res.json({
      id: item.id || String(Date.now()),
      type: 'video',
      title: item.title || 'Vidéo TikTok',
      cover: fixUrl(item.cover) || '',
      originCover: fixUrl(item.origin_cover),
      duration: item.duration || 0,
      createdAt: item.create_time,
      author,
      stats,
      music,
      downloadUrls: {
        noWatermark,
        noWatermarkHd,
        music: musicUrl,
      },
      originalUrl: trimmedUrl,
    });
  } catch (error: any) {
    console.error('Erreur lors de l\'analyse TikTok:', error.message);
    return res.status(500).json({
      error: `Une erreur est survenue lors de l'analyse du lien TikTok : ${error.message || 'Erreur inconnue'}. Veuillez vérifier le lien et réessayer.`,
    });
  }
});

/**
 * Route proxy de téléchargement sécurisé
 * Permet d'éviter les blocages CORS et les restrictions de Referer de TikTok
 */
app.get('/api/tiktok/download', async (req: Request, res: Response) => {
  const mediaUrl = req.query.url as string;
  const rawFilename = (req.query.filename as string) || 'kaydo_tiktok_media';
  const fileExt = (req.query.ext as string) || 'mp4';

  if (!mediaUrl) {
    return res.status(400).send('Paramètre URL manquant.');
  }

  if (!isSafeMediaUrl(mediaUrl)) {
    return res.status(403).send('Domaine de média non autorisé pour des raisons de sécurité.');
  }

  // Nettoyage du nom de fichier
  const safeFilename = rawFilename
    .replace(/[^a-zA-Z0-9_\-\u00C0-\u017F]/g, '_')
    .slice(0, 80);
  const finalFilename = `${safeFilename}.${fileExt}`;

  try {
    const upstreamRes = await fetch(mediaUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': 'https://www.tiktok.com/',
      },
    });

    if (!upstreamRes.ok) {
      return res.status(upstreamRes.status).send(`Erreur du serveur média source: ${upstreamRes.statusText}`);
    }

    const contentType =
      upstreamRes.headers.get('content-type') ||
      (fileExt === 'mp3' ? 'audio/mpeg' : fileExt === 'jpg' ? 'image/jpeg' : 'video/mp4');

    const contentLength = upstreamRes.headers.get('content-length');

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(finalFilename)}"`);
    res.setHeader('Content-Type', contentType);
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }
    res.setHeader('Cache-Control', 'public, max-age=3600');

    // Streaming du flux vers le client
    if (upstreamRes.body) {
      const reader = upstreamRes.body.getReader();
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            res.end();
            break;
          }
          res.write(Buffer.from(value));
        }
      };
      await pump();
    } else {
      const arrayBuffer = await upstreamRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    }
  } catch (err: any) {
    console.error('Erreur proxy download:', err);
    if (!res.headersSent) {
      res.status(500).send(`Erreur lors du téléchargement : ${err.message}`);
    }
  }
});

/**
 * Route pour regrouper toutes les images d'un carrousel dans une archive ZIP
 */
app.post('/api/tiktok/zip', async (req: Request, res: Response) => {
  const { images, title, id } = req.body;

  if (!Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ error: 'Aucune image spécifiée pour l\'archive ZIP.' });
  }

  if (images.length > 50) {
    return res.status(400).json({ error: 'Trop d\'images à zipper (limite: 50).' });
  }

  // Vérifier la sécurité de chaque URL d'image
  for (const imgUrl of images) {
    if (!isSafeMediaUrl(imgUrl)) {
      return res.status(403).json({ error: 'Une ou plusieurs URLs d\'images sont non autorisées.' });
    }
  }

  try {
    const zip = new JSZip();
    const folder = zip.folder('kaydo_photos') || zip;

    // Télécharger chaque image en parallèle
    const downloadPromises = images.map(async (imgUrl: string, index: number) => {
      try {
        const resp = await fetch(imgUrl, {
          headers: {
            'User-Agent': USER_AGENT,
            'Referer': 'https://www.tiktok.com/',
          },
        });
        if (resp.ok) {
          const buffer = await resp.arrayBuffer();
          const padIndex = String(index + 1).padStart(2, '0');
          folder.file(`photo_${padIndex}.jpg`, buffer);
        }
      } catch (err) {
        console.warn(`Échec téléchargement image ${index + 1}:`, err);
      }
    });

    await Promise.all(downloadPromises);

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const safeTitle = (title || `photos_${id || Date.now()}`)
      .replace(/[^a-zA-Z0-9_\-\u00C0-\u017F]/g, '_')
      .slice(0, 50);

    const zipFilename = `kaydo_tiktok_${safeTitle}.zip`;

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(zipFilename)}"`);
    res.setHeader('Content-Length', zipBuffer.length.toString());
    res.send(zipBuffer);
  } catch (err: any) {
    console.error('Erreur génération ZIP:', err);
    res.status(500).json({ error: `Impossible de générer l'archive ZIP : ${err.message}` });
  }
});

// Vite middleware en dev ou fichiers statiques en prod
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`🚀 KAYDO TIKTOK DOWNLOADER backend opérationnel sur le port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Erreur démarrage serveur:', err);
  process.exit(1);
});
