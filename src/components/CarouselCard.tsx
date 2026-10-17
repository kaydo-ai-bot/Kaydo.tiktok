import React, { useState } from 'react';
import {
  Download,
  Archive,
  ChevronLeft,
  ChevronRight,
  Grid,
  Image as ImageIcon,
  Music,
  CheckCircle,
  ExternalLink,
  Copy,
  Check,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Maximize2
} from 'lucide-react';
import { TikTokPhotoCarouselData } from '../types/tiktok';
import { downloadMediaWithProgress, downloadCarouselAsZip } from '../services/api';

interface CarouselCardProps {
  data: TikTokPhotoCarouselData;
  onDownloaded?: () => void;
}

export const CarouselCard: React.FC<CarouselCardProps> = ({ data, onDownloaded }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider');
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState<number | null>(null);
  const [downloadingIndex, setDownloadingIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const images = data.images || [];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Téléchargement d'une seule image
  const handleDownloadSingleImage = async (imgUrl: string, index: number) => {
    setDownloadingIndex(index);
    const cleanTitle = (data.title || `photos_${data.id}`).replace(/[^a-zA-Z0-9_\-\u00C0-\u017F]/g, '_').slice(0, 35);
    const filename = `kaydo_tiktok_${data.author.uniqueId}_photo_${index + 1}_${cleanTitle}`;

    try {
      await downloadMediaWithProgress(imgUrl, filename, 'jpg');
      setSuccessMessage(`Photo ${index + 1} téléchargée avec succès !`);
      if (onDownloaded) onDownloaded();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      alert(`Erreur : ${err.message}`);
    } finally {
      setDownloadingIndex(null);
    }
  };

  // Téléchargement de toutes les images en archive ZIP
  const handleDownloadAllZip = async () => {
    if (isZipping || images.length === 0) return;
    setIsZipping(true);
    setZipProgress(15);

    try {
      await downloadCarouselAsZip(images, data.title, data.id, (percent) => {
        setZipProgress(percent);
      });
      setSuccessMessage(`Archive ZIP (${images.length} photos) téléchargée avec succès !`);
      if (onDownloaded) onDownloaded();
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      alert(`Erreur lors de la création du ZIP : ${err.message}`);
    } finally {
      setIsZipping(false);
      setZipProgress(null);
    }
  };

  const copyDirectLink = () => {
    navigator.clipboard.writeText(data.originalUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Barre supérieure d'information */}
      <div className="px-5 py-3.5 bg-neutral-950 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
          <span className="font-bold text-violet-400 uppercase tracking-wider text-[11px]">
            Diaporama Photos TikTok ({images.length} images)
          </span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-400 font-mono">ID: {data.id}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Bascule mode vue */}
          <div className="flex items-center bg-neutral-900 rounded-lg p-0.5 border border-neutral-800">
            <button
              onClick={() => setViewMode('slider')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                viewMode === 'slider' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Diaporama
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              Grille ({images.length})
            </button>
          </div>

          <button
            onClick={copyDirectLink}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors ml-2"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'Copié' : 'Copier lien'}</span>
          </button>
          <a
            href={data.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-neutral-400 hover:text-violet-400 transition-colors ml-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* En-tête auteur & Titre */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <img
              src={data.author.avatar || 'https://www.tiktok.com/favicon.ico'}
              alt={data.author.nickname}
              className="w-12 h-12 rounded-full border border-neutral-700 object-cover bg-neutral-800"
            />
            <div>
              <h4 className="text-base font-bold text-white">
                {data.author.nickname}
              </h4>
              <div className="text-xs text-neutral-400 font-mono">
                @{data.author.uniqueId}
              </div>
            </div>
          </div>

          {/* Action principale globale : Télécharger tout en ZIP */}
          <button
            onClick={handleDownloadAllZip}
            disabled={isZipping || images.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-lg shadow-violet-600/25 transition-all disabled:opacity-50 shrink-0"
          >
            {isZipping ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Création ZIP ({zipProgress}%)...</span>
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                <span>Télécharger tout en ZIP ({images.length})</span>
              </>
            )}
          </button>
        </div>

        {/* Titre / Description */}
        {data.title && (
          <p className="text-sm text-neutral-200 leading-relaxed">
            {data.title}
          </p>
        )}

        {/* Message de succès */}
        {successMessage && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* MODE 1 : VUE DIAPORAMA / SLIDER */}
        {viewMode === 'slider' && images.length > 0 && (
          <div className="space-y-4">
            <div className="relative w-full max-w-lg mx-auto aspect-[4/5] sm:aspect-square bg-black rounded-2xl overflow-hidden border border-neutral-800 shadow-xl group">
              <img
                src={images[currentIndex]}
                alt={`Photo ${currentIndex + 1}`}
                className="w-full h-full object-contain"
              />

              {/* Bouton précédent */}
              {images.length > 1 && (
                <button
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Bouton suivant */}
              {images.length > 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full backdrop-blur-sm transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {/* Compteur de slide */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 backdrop-blur-md text-white text-xs font-mono rounded-full font-bold">
                {currentIndex + 1} / {images.length}
              </div>

              {/* Bouton Télécharger cette photo flottant */}
              <div className="absolute top-3 right-3">
                <button
                  onClick={() => handleDownloadSingleImage(images[currentIndex], currentIndex)}
                  disabled={downloadingIndex === currentIndex}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-800 text-white text-xs font-semibold rounded-lg backdrop-blur-md border border-neutral-700/80 shadow transition-colors"
                >
                  {downloadingIndex === currentIndex ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5 text-violet-400" />
                  )}
                  <span>Télécharger photo HD</span>
                </button>
              </div>
            </div>

            {/* Ruban de miniatures pour navigation rapide */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 max-w-lg mx-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                      currentIndex === idx
                        ? 'border-violet-500 scale-105 shadow-md shadow-violet-500/20'
                        : 'border-neutral-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`miniature ${idx}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 text-[9px] bg-black/70 px-1 rounded text-white font-mono">
                      {idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODE 2 : VUE GRILLE DE TOUTES LES PHOTOS */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="group relative bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden aspect-square flex flex-col justify-end"
              >
                <img
                  src={img}
                  alt={`Photo ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity p-2.5 flex items-end justify-between">
                  <span className="text-[11px] font-mono text-white font-bold bg-black/60 px-1.5 py-0.5 rounded">
                    #{idx + 1}
                  </span>
                  <button
                    onClick={() => handleDownloadSingleImage(img, idx)}
                    disabled={downloadingIndex === idx}
                    title="Télécharger cette photo HD"
                    className="p-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg shadow transition-colors"
                  >
                    {downloadingIndex === idx ? (
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Musique de fond associée au carrousel */}
        {data.music && (
          <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-violet-950/60 border border-violet-800/40 flex items-center justify-center text-violet-400 shrink-0">
                <Music className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {data.music.title}
                </div>
                <div className="text-[11px] text-neutral-400 truncate">
                  {data.music.author}
                </div>
              </div>
            </div>

            {data.music.playUrl && (
              <button
                onClick={() =>
                  downloadMediaWithProgress(
                    data.music!.playUrl,
                    `kaydo_audio_${data.author.uniqueId}`,
                    'mp3'
                  )
                }
                className="px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded-lg shrink-0 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-violet-400" />
                <span>Télécharger l'audio</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
