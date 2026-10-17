import React, { useState } from 'react';
import {
  Download,
  Play,
  Pause,
  Music,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  CheckCircle,
  ExternalLink,
  Copy,
  Check,
  Image as ImageIcon,
  Clock,
  Sparkles,
  Volume2
} from 'lucide-react';
import { TikTokVideoData } from '../types/tiktok';
import { downloadMediaWithProgress } from '../services/api';

interface VideoCardProps {
  data: TikTokVideoData;
  onDownloaded?: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({ data, onDownloaded }) => {
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string>('');
  const [downloadedLabel, setDownloadedLabel] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioRef] = useState<HTMLAudioElement | null>(
    data.music?.playUrl ? new Audio(data.music.playUrl) : null
  );
  const [showFullTitle, setShowFullTitle] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Formatage des grands nombres (12400 -> 12.4k)
  const formatCount = (num: number = 0) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString('fr-FR');
  };

  // Formatage de la durée (secondes -> mm:ss)
  const formatDuration = (secs: number = 0) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Formatage de la date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return null;
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Gestion de la lecture de l'extrait audio
  const toggleAudio = () => {
    if (!audioRef) return;
    if (isPlayingAudio) {
      audioRef.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.play().then(() => {
        setIsPlayingAudio(true);
      }).catch(err => {
        console.warn('Lecture audio bloquée:', err);
      });
      audioRef.onended = () => setIsPlayingAudio(false);
    }
  };

  // Déclenchement d'un téléchargement
  const handleDownload = async (
    targetUrl: string,
    label: string,
    ext: 'mp4' | 'mp3' | 'jpg'
  ) => {
    if (downloadProgress !== null) return; // Téléchargement déjà en cours

    const cleanTitle = (data.title || `tiktok_${data.id}`)
      .replace(/[^a-zA-Z0-9_\-\u00C0-\u017F]/g, '_')
      .slice(0, 45);
    const filename = `kaydo_tiktok_${data.author.uniqueId}_${cleanTitle}`;

    setDownloadProgress(0);
    setDownloadStatus(`Téléchargement de ${label}...`);

    try {
      await downloadMediaWithProgress(
        targetUrl,
        filename,
        ext,
        (percent, loaded, total) => {
          setDownloadProgress(percent);
          if (total > 0) {
            const mbLoaded = (loaded / (1024 * 1024)).toFixed(1);
            const mbTotal = (total / (1024 * 1024)).toFixed(1);
            setDownloadStatus(`${percent}% (${mbLoaded} Mo / ${mbTotal} Mo)`);
          } else {
            setDownloadStatus(`${percent}%`);
          }
        }
      );

      setDownloadedLabel(label);
      if (onDownloaded) onDownloaded();
      setTimeout(() => {
        setDownloadProgress(null);
        setDownloadStatus('');
      }, 1500);
    } catch (err: any) {
      alert(`Erreur de téléchargement : ${err.message}`);
      setDownloadProgress(null);
      setDownloadStatus('');
    }
  };

  const copyDirectLink = () => {
    navigator.clipboard.writeText(data.originalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl transition-all">
      {/* Barre supérieure: Type de contenu & lien d'origine */}
      <div className="px-5 py-3.5 bg-neutral-950 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="font-bold text-rose-400 uppercase tracking-wider text-[11px]">
            Vidéo TikTok HD Détectée
          </span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-400 font-mono">ID: {data.id}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={copyDirectLink}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Lien copié' : 'Copier lien original'}</span>
          </button>
          <a
            href={data.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-neutral-400 hover:text-rose-400 transition-colors ml-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ouvrir sur TikTok</span>
          </a>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Colonne Gauche : Lecteur / Aperçu Vidéo */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[290px] aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-xl group">
              {data.downloadUrls.noWatermark ? (
                <video
                  src={data.downloadUrls.noWatermark}
                  poster={data.cover || data.originCover}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={data.cover || data.originCover}
                    alt={data.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold px-3 py-1.5 bg-black/60 rounded-full backdrop-blur-sm">
                      Aperçu disponible
                    </span>
                  </div>
                </div>
              )}

              {/* Badge durée */}
              {data.duration > 0 && (
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/75 backdrop-blur-md rounded-md text-[11px] font-mono text-white flex items-center gap-1 pointer-events-none">
                  <Clock className="w-3 h-3 text-rose-400" />
                  <span>{formatDuration(data.duration)}</span>
                </div>
              )}
            </div>

            {/* Téléchargement miniature */}
            {data.cover && (
              <button
                onClick={() => handleDownload(data.cover, 'Miniature HD', 'jpg')}
                className="mt-3 flex items-center gap-1.5 text-xs text-neutral-400 hover:text-rose-400 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Télécharger la miniature (Cover HD)</span>
              </button>
            )}
          </div>

          {/* Colonne Droite : Métadonnées et Options de Téléchargement */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
            <div>
              {/* Créateur */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-neutral-800">
                <img
                  src={data.author.avatar || 'https://www.tiktok.com/favicon.ico'}
                  alt={data.author.nickname}
                  className="w-12 h-12 rounded-full border border-neutral-700 object-cover bg-neutral-800 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="%23666"><rect width="100%" height="100%" fill="%23222"/><text x="50%" y="55%" font-size="20" fill="%23aaa" dominant-baseline="middle" text-anchor="middle">@</text></svg>';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-base font-bold text-white truncate">
                      {data.author.nickname}
                    </h4>
                    {data.author.verified && (
                      <CheckCircle className="w-4 h-4 text-sky-400 fill-sky-400/20 shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-neutral-400 font-mono">
                    @{data.author.uniqueId}
                    {data.createdAt && (
                      <span className="text-neutral-500 ml-2 font-sans">
                        · {formatDate(data.createdAt)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Titre / Légende */}
              <div className="mt-4">
                <p className={`text-sm text-neutral-200 leading-relaxed ${!showFullTitle ? 'line-clamp-3' : ''}`}>
                  {data.title || 'Vidéo TikTok sans description.'}
                </p>
                {data.title && data.title.length > 120 && (
                  <button
                    onClick={() => setShowFullTitle(!showFullTitle)}
                    className="text-xs text-rose-400 hover:text-rose-300 mt-1 font-medium"
                  >
                    {showFullTitle ? 'Voir moins' : 'Voir plus'}
                  </button>
                )}
              </div>

              {/* Statistiques d'engagement */}
              <div className="grid grid-cols-4 gap-2 py-3 mt-4 bg-neutral-950/60 rounded-xl border border-neutral-800/80 text-center">
                <div className="flex flex-col items-center">
                  <Eye className="w-3.5 h-3.5 text-neutral-400 mb-1" />
                  <span className="text-xs font-bold text-white font-mono">
                    {formatCount(data.stats.plays)}
                  </span>
                  <span className="text-[10px] text-neutral-500">Vues</span>
                </div>
                <div className="flex flex-col items-center">
                  <Heart className="w-3.5 h-3.5 text-rose-500 mb-1" />
                  <span className="text-xs font-bold text-white font-mono">
                    {formatCount(data.stats.likes)}
                  </span>
                  <span className="text-[10px] text-neutral-500">J'aime</span>
                </div>
                <div className="flex flex-col items-center">
                  <MessageCircle className="w-3.5 h-3.5 text-sky-400 mb-1" />
                  <span className="text-xs font-bold text-white font-mono">
                    {formatCount(data.stats.comments)}
                  </span>
                  <span className="text-[10px] text-neutral-500">Comms</span>
                </div>
                <div className="flex flex-col items-center">
                  <Share2 className="w-3.5 h-3.5 text-violet-400 mb-1" />
                  <span className="text-xs font-bold text-white font-mono">
                    {formatCount(data.stats.shares)}
                  </span>
                  <span className="text-[10px] text-neutral-500">Partages</span>
                </div>
              </div>

              {/* Piste Audio / Musique */}
              {data.music && (
                <div className="mt-4 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      onClick={toggleAudio}
                      title={isPlayingAudio ? 'Mettre en pause' : 'Écouter un extrait'}
                      className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center text-rose-400 shrink-0 transition-colors"
                    >
                      {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                        <Music className="w-3 h-3 text-neutral-400 shrink-0" />
                        <span className="truncate">{data.music.title}</span>
                      </div>
                      <div className="text-[11px] text-neutral-400 truncate">
                        {data.music.author}
                      </div>
                    </div>
                  </div>

                  {data.downloadUrls.music && (
                    <button
                      onClick={() => handleDownload(data.downloadUrls.music!, 'Audio MP3', 'mp3')}
                      disabled={downloadProgress !== null}
                      className="px-2.5 py-1 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg shrink-0 flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3 text-rose-400" />
                      <span>MP3</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Barre de progression réelle */}
            {downloadProgress !== null && (
              <div className="p-4 bg-neutral-950 border border-rose-500/40 rounded-xl">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-rose-400 font-bold flex items-center gap-1.5">
                    <Download className="w-3.5 h-3.5 animate-bounce" />
                    {downloadStatus}
                  </span>
                  <span className="text-white font-mono font-bold">{downloadProgress}%</span>
                </div>
                <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-rose-500 via-rose-400 to-violet-500 h-full rounded-full transition-all duration-150"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Notification de succès */}
            {downloadedLabel && downloadProgress === null && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  <strong>{downloadedLabel}</strong> a été téléchargé avec succès dans vos téléchargements !
                </span>
              </div>
            )}

            {/* BOUTONS DE TÉLÉCHARGEMENT PRINCIPAUX (100% SANS FILIGRANE) */}
            <div className="space-y-2.5 pt-2">
              {/* Bouton Principal: MP4 Sans filigrane */}
              <button
                onClick={() =>
                  handleDownload(
                    data.downloadUrls.noWatermarkHd || data.downloadUrls.noWatermark,
                    'Vidéo sans filigrane',
                    'mp4'
                  )
                }
                disabled={downloadProgress !== null}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 via-rose-500 to-violet-600 hover:from-rose-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2.5 transition-all duration-200 disabled:opacity-50"
              >
                <Download className="w-5 h-5" />
                <span>Télécharger la Vidéo MP4 (Sans filigrane)</span>
              </button>

              {/* Grille des boutons secondaires */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Option 2: Audio MP3 */}
                <button
                  onClick={() => {
                    const audioUrl = data.downloadUrls.music || data.downloadUrls.noWatermark;
                    handleDownload(audioUrl, 'Audio MP3', 'mp3');
                  }}
                  disabled={downloadProgress !== null}
                  className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700/90 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700/60 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Music className="w-4 h-4 text-violet-400" />
                  <span>Extraire l'Audio (MP3)</span>
                </button>

                {/* Option 3: Miniature HD */}
                {data.cover && (
                  <button
                    onClick={() => handleDownload(data.cover, 'Miniature HD', 'jpg')}
                    disabled={downloadProgress !== null}
                    className="py-2.5 px-3 bg-neutral-800 hover:bg-neutral-700/90 text-neutral-200 text-xs font-semibold rounded-xl border border-neutral-700/60 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <ImageIcon className="w-4 h-4 text-rose-400" />
                    <span>Miniature HD (Cover)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
