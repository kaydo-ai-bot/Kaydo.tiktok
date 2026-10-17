import React from 'react';
import { AlertCircle, HelpCircle, ExternalLink, ArrowRight, Music, Lock, Trash2 } from 'lucide-react';
import { TikTokUnsupportedData } from '../types/tiktok';

interface UnsupportedCardProps {
  data: TikTokUnsupportedData;
  onTryAnother: () => void;
}

export const UnsupportedCard: React.FC<UnsupportedCardProps> = ({ data, onTryAnother }) => {
  return (
    <div className="w-full max-w-2xl mx-auto my-8 bg-neutral-900 border border-amber-500/30 rounded-2xl p-6 sm:p-7 shadow-2xl">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-3 flex-1">
          <h3 className="text-base sm:text-lg font-bold text-white">
            Contenu non pris en charge ou inaccessible
          </h3>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {data.reason || "Ce lien ne peut pas être téléchargé directement."}
          </p>

          {data.resolvedUrl && data.resolvedUrl !== data.originalUrl && (
            <div className="text-[11px] text-neutral-500 font-mono bg-neutral-950 p-2 rounded-lg border border-neutral-800 break-all">
              URL résolue : {data.resolvedUrl}
            </div>
          )}

          {/* Conseils d'aide */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 text-xs text-neutral-400">
            <span className="font-semibold text-neutral-200 block">Que pouvez-vous faire ?</span>
            <ul className="list-disc pl-4 space-y-1">
              <li>Assurez-vous que la vidéo est <strong>publique</strong> et n'est pas limitée aux amis.</li>
              <li>Vérifiez que la vidéo n'a pas été <strong>supprimée</strong> ou mise en privé par son auteur.</li>
              <li>Pour télécharger une musique, collez le lien direct de la vidéo où le son est joué.</li>
            </ul>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={onTryAnother}
              className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <span>Essayer un autre lien</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
