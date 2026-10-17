import React, { useState } from 'react';
import { Download, History, Moon, Sun, Share2, Menu, X, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenHistory,
  historyCount,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShareApp = async () => {
    const shareData = {
      title: 'KAYDO TIKTOK DOWNLOADER',
      text: 'Téléchargez vos vidéos et photos TikTok en HD sans filigrane avec KAYDO !',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // Ignorer si annulé par l'utilisateur
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      } catch {
        // Fallback
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-neutral-950/80 dark:bg-neutral-950/80 border-b border-neutral-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Wordmark / Brand Logo */}
          <a
            href="/"
            className="flex items-center gap-3 text-lg sm:text-xl font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-violet-600 flex items-center justify-center shadow-lg shadow-rose-600/25 group-hover:scale-105 transition-transform">
              <Download className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="leading-tight font-extrabold tracking-wider bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
                KAYDO
              </span>
              <span className="text-[10px] tracking-widest uppercase font-bold text-rose-500 -mt-1">
                TIKTOK DOWNLOADER
              </span>
            </div>
          </a>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <a
              href="#telecharger"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Télécharger
            </a>
            <a
              href="#formats"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Formats
            </a>
            <a
              href="#comment-ca-marche"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Comment ça marche
            </a>
            <a
              href="#faq"
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              FAQ
            </a>
          </nav>

          {/* Zone 3: Actions & Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Bouton Partager */}
            <button
              onClick={handleShareApp}
              title="Partager l'application"
              className="relative p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/60 rounded-lg transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {copiedShare && (
                <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[11px] bg-neutral-900 border border-neutral-700 text-rose-400 px-2 py-0.5 rounded shadow whitespace-nowrap">
                  Lien copié !
                </span>
              )}
            </button>

            {/* Bouton Historique */}
            <button
              onClick={onOpenHistory}
              title="Historique des téléchargements"
              className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-all"
            >
              <History className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Historique</span>
              {historyCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded text-[10px] font-mono font-bold">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Sélecteur Thème */}
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Passer au mode clair' : 'Passer au mode sombre'}
              className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800/60 rounded-lg transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-300" />
              )}
            </button>

            {/* Menu burger mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu mobile déroulant */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-neutral-800/60 flex flex-col gap-3 text-sm font-medium text-neutral-300">
            <a
              href="#telecharger"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white"
            >
              Télécharger
            </a>
            <a
              href="#formats"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white"
            >
              Formats reconnus
            </a>
            <a
              href="#comment-ca-marche"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white"
            >
              Comment ça marche
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-neutral-900 hover:text-white"
            >
              Questions fréquentes
            </a>
          </div>
        )}
      </div>
    </header>
  );
};
