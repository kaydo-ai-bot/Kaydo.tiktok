import React, { useState, useEffect } from 'react';
import { Search, Clipboard, X, Sparkles, CheckCircle2, Film, Images, User, HelpCircle } from 'lucide-react';

interface UrlInputProps {
  url: string;
  onChangeUrl: (val: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  url,
  onChangeUrl,
  onAnalyze,
  isLoading,
}) => {
  const [pasteNotice, setPasteNotice] = useState(false);

  // Détection en direct du type de lien pour informer l'utilisateur
  const detectQuickType = (input: string) => {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return null;
    if (trimmed.includes('/photo/')) {
      return { label: 'Diaporama Photos', icon: Images, color: 'text-violet-400' };
    }
    if (trimmed.includes('/video/')) {
      return { label: 'Vidéo TikTok', icon: Film, color: 'text-rose-400' };
    }
    if (trimmed.includes('vm.tiktok.com') || trimmed.includes('vt.tiktok.com') || trimmed.includes('/t/')) {
      return { label: 'Lien court (redirection auto)', icon: Sparkles, color: 'text-amber-400' };
    }
    if (trimmed.includes('/@') && !trimmed.includes('/video/') && !trimmed.includes('/photo/')) {
      return { label: 'Profil créateur', icon: User, color: 'text-sky-400' };
    }
    if (trimmed.includes('tiktok.com')) {
      return { label: 'Lien TikTok détecté', icon: CheckCircle2, color: 'text-emerald-400' };
    }
    return null;
  };

  const detected = detectQuickType(url);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChangeUrl(text.trim());
        setPasteNotice(true);
        setTimeout(() => setPasteNotice(false), 2000);
      }
    } catch (err) {
      // Permission refusée ou non disponible
      console.warn('Impossible d\'accéder au presse-papiers:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && url.trim()) {
      onAnalyze();
    }
  };

  // Exemples de test réalistes
  const sampleLinks = [
    {
      label: 'Exemple Vidéo',
      url: 'https://www.tiktok.com/@tiktok/video/7187423871239857413',
    },
    {
      label: 'Exemple Diaporama',
      url: 'https://www.tiktok.com/@tiktok/photo/7289123847192384712',
    },
    {
      label: 'Exemple Profil',
      url: 'https://www.tiktok.com/@tiktok',
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Zone du formulaire */}
      <div className="relative group">
        {/* Glow halo */}
        <div className="absolute -inset-1 bg-gradient-to-r from-rose-600/30 via-violet-600/30 to-rose-600/30 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300 pointer-events-none" />

        <div className="relative bg-neutral-900/90 border border-neutral-700/80 rounded-2xl p-2 sm:p-2.5 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Champ d'entrée */}
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              value={url}
              onChange={(e) => onChangeUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Collez ici le lien TikTok (vidéo, photo, carrousel, profil...)"
              className="w-full bg-transparent text-white placeholder-neutral-500 text-sm sm:text-base px-3.5 py-3 pr-20 outline-none rounded-xl disabled:opacity-50"
            />

            {/* Boutons internes au champ: Vider et Coller */}
            <div className="absolute right-2 flex items-center gap-1">
              {url && (
                <button
                  type="button"
                  onClick={() => onChangeUrl('')}
                  title="Effacer le lien"
                  className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={handlePaste}
                title="Coller depuis le presse-papiers"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-neutral-300 bg-neutral-800/80 hover:bg-neutral-700/90 border border-neutral-700/60 rounded-lg transition-colors"
              >
                <Clipboard className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden xs:inline">Coller</span>
              </button>
            </div>
          </div>

          {/* Bouton Analyser le lien */}
          <button
            type="button"
            onClick={onAnalyze}
            disabled={isLoading || !url.trim()}
            className="flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-rose-600 via-rose-500 to-violet-600 hover:from-rose-500 hover:to-violet-500 rounded-xl shadow-lg shadow-rose-600/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 shrink-0"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Analyse...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Analyser le lien</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Barre d'état sous l'input : type détecté ou notice de collage */}
      <div className="mt-3 flex items-center justify-between text-xs px-2 min-h-6">
        <div className="flex items-center gap-2">
          {detected ? (
            <div className={`flex items-center gap-1.5 ${detected.color} font-medium`}>
              <detected.icon className="w-3.5 h-3.5" />
              <span>{detected.label}</span>
            </div>
          ) : (
            <span className="text-neutral-500">
              Compatible avec : vidéos, photos/diaporamas, profils et liens courts.
            </span>
          )}

          {pasteNotice && (
            <span className="text-emerald-400 font-medium">✓ Lien collé depuis le presse-papiers</span>
          )}
        </div>

        {/* Liens de démo rapides */}
        <div className="hidden sm:flex items-center gap-2 text-neutral-400">
          <span className="text-neutral-600">Essayer :</span>
          {sampleLinks.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChangeUrl(sample.url)}
              className="hover:text-rose-400 underline underline-offset-2 transition-colors"
            >
              {sample.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
