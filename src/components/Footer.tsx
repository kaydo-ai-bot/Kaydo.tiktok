import React from 'react';
import { Download, ShieldCheck, Heart, Trash2 } from 'lucide-react';
import { clearLocalHistory } from '../services/api';

interface FooterProps {
  onResetData: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onResetData }) => {
  return (
    <footer className="w-full border-t border-neutral-800/80 bg-neutral-950 mt-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-violet-600 flex items-center justify-center shadow-md">
                <Download className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                KAYDO TIKTOK DOWNLOADER
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
              La solution rapide, sans filigrane et moderne pour sauvegarder vos vidéos, carrousels photos et audios TikTok en haute résolution.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Aucune donnée utilisateur ou vidéo stockée sur le serveur.</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs text-neutral-400">
              <li>
                <a href="#telecharger" className="hover:text-white transition-colors">
                  Télécharger une vidéo
                </a>
              </li>
              <li>
                <a href="#formats" className="hover:text-white transition-colors">
                  Formats pris en charge
                </a>
              </li>
              <li>
                <a href="#comment-ca-marche" className="hover:text-white transition-colors">
                  Comment ça marche
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">
                  Foire aux questions (FAQ)
                </a>
              </li>
            </ul>
          </div>

          {/* Confidentialité & Données locales */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-300 mb-3">
              Confidentialité
            </h4>
            <p className="text-xs text-neutral-400 mb-3 leading-relaxed">
              L'historique et vos préférences sont conservés exclusivement sur votre appareil.
            </p>
            <button
              onClick={onResetData}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Effacer mes données locales</span>
            </button>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500 text-center sm:text-left">
          <div>
            © {new Date().getFullYear()} KAYDO TIKTOK DOWNLOADER. Tous droits réservés.
          </div>
          <div className="max-w-xl text-neutral-500">
            Avertissement : KAYDO n'est ni affilié, ni certifié, ni soutenu par TikTok ou ByteDance Ltd. Les marques citées appartiennent à leurs propriétaires respectifs.
          </div>
        </div>
      </div>
    </footer>
  );
};
