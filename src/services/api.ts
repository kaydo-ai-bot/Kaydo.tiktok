/**
 * Services API et stockage local pour KAYDO TIKTOK DOWNLOADER
 */

import { HistoryItem, TikTokAnalysisResult } from '../types/tiktok';

const HISTORY_STORAGE_KEY = 'kaydo_tiktok_history_v1';
const THEME_STORAGE_KEY = 'kaydo_theme_preference';

/**
 * Analyse une URL TikTok en appelant le backend
 */
export async function analyzeTikTokUrl(url: string): Promise<TikTokAnalysisResult> {
  const response = await fetch('/api/tiktok/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Erreur lors de l\'analyse du lien TikTok.');
  }

  return data as TikTokAnalysisResult;
}

/**
 * Construit l'URL proxy de téléchargement sécurisé
 */
export function getProxyDownloadUrl(mediaUrl: string, filename: string, ext: string): string {
  const params = new URLSearchParams({
    url: mediaUrl,
    filename,
    ext,
  });
  return `/api/tiktok/download?${params.toString()}`;
}

/**
 * Télécharge un fichier média avec suivi réel de la progression
 */
export async function downloadMediaWithProgress(
  mediaUrl: string,
  filename: string,
  ext: string,
  onProgress?: (percent: number, loaded: number, total: number) => void
): Promise<void> {
  const downloadUrl = getProxyDownloadUrl(mediaUrl, filename, ext);

  try {
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new Error(`Erreur lors du téléchargement (${response.status}) : ${response.statusText}`);
    }

    const contentLength = response.headers.get('content-length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

    if (!response.body || totalBytes === 0) {
      // Téléchargement direct standard si le corps n'est pas lisible
      if (onProgress) onProgress(50, 0, 0);
      const blob = await response.blob();
      if (onProgress) onProgress(100, blob.size, blob.size);
      triggerBlobDownload(blob, `${filename}.${ext}`);
      return;
    }

    const reader = response.body.getReader();
    let loadedBytes = 0;
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      if (value) {
        chunks.push(value);
        loadedBytes += value.length;
        if (totalBytes > 0 && onProgress) {
          const percent = Math.min(100, Math.round((loadedBytes / totalBytes) * 100));
          onProgress(percent, loadedBytes, totalBytes);
        }
      }
    }

    // Fusion des chunks en un seul Blob
    const mimeType =
      ext === 'mp3' ? 'audio/mpeg' : ext === 'jpg' ? 'image/jpeg' : 'video/mp4';
    const blob = new Blob(chunks as unknown as BlobPart[], { type: mimeType });

    if (onProgress) onProgress(100, loadedBytes, loadedBytes);
    triggerBlobDownload(blob, `${filename}.${ext}`);
  } catch (err: any) {
    console.error('Erreur downloadMediaWithProgress:', err);
    // Fallback: déclencher le lien direct dans le navigateur
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${filename}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

/**
 * Télécharge toutes les images d'un diaporama sous forme d'archive ZIP
 */
export async function downloadCarouselAsZip(
  images: string[],
  title: string,
  id: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  if (onProgress) onProgress(20);

  const response = await fetch('/api/tiktok/zip', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ images, title, id }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Échec de la création de l\'archive ZIP.');
  }

  if (onProgress) onProgress(75);
  const blob = await response.blob();
  if (onProgress) onProgress(100);

  const safeTitle = (title || `photos_${id}`)
    .replace(/[^a-zA-Z0-9_\-\u00C0-\u017F]/g, '_')
    .slice(0, 50);

  triggerBlobDownload(blob, `kaydo_tiktok_${safeTitle}.zip`);
}

/**
 * Déclenche le téléchargement d'un Blob côté client
 */
function triggerBlobDownload(blob: Blob, filename: string) {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
}

// -------------------------------------------------------------
// HISTORIQUE LOCAL (localStorage)
// -------------------------------------------------------------

export function getLocalHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Impossible de lire l\'historique local:', err);
    return [];
  }
}

export function saveToLocalHistory(item: HistoryItem): HistoryItem[] {
  try {
    const current = getLocalHistory();
    // Évite les doublons avec le même id
    const filtered = current.filter((h) => h.id !== item.id);
    const updated = [item, ...filtered].slice(0, 30); // Conserve les 30 derniers
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn('Impossible de sauvegarder dans l\'historique local:', err);
    return [];
  }
}

export function removeFromLocalHistory(id: string): HistoryItem[] {
  try {
    const current = getLocalHistory();
    const updated = current.filter((h) => h.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    return [];
  }
}

export function clearLocalHistory(): void {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (err) {
    console.warn('Impossible d\'effacer l\'historique local:', err);
  }
}

// -------------------------------------------------------------
// THÈME SOMBRE / CLAIR
// -------------------------------------------------------------

export function getStoredTheme(): 'dark' | 'light' {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return 'dark'; // Thème sombre par défaut
  } catch {
    return 'dark';
  }
}

export function setStoredTheme(theme: 'dark' | 'light'): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  } catch {}
}
