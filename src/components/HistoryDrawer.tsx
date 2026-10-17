import React, { useState } from 'react';
import {
  History,
  Trash2,
  X,
  ExternalLink,
  Download,
  Film,
  Images,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { HistoryItem } from '../types/tiktok';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onRemoveItem: (id: string) => void;
  onClearAll: () => void;
  onSelectUrl: (url: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onRemoveItem,
  onClearAll,
  onSelectUrl,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (id: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-md bg-neutral-900 border-l border-neutral-800 h-full flex flex-col shadow-2xl z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-rose-500" />
            <h3 className="text-base font-bold text-white">
              Historique local ({items.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 px-4">
              <History className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-neutral-300">
                Aucun historique récent
              </p>
              <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
                Vos contenus analysés et téléchargés apparaîtront ici pour un accès rapide. Ces données sont stockées uniquement sur votre appareil.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-3 bg-neutral-950 border border-neutral-800/80 rounded-xl flex gap-3 group hover:border-neutral-700 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-20 bg-neutral-900 rounded-lg overflow-hidden shrink-0 border border-neutral-800">
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-6 h-6 text-neutral-600" />
                    </div>
                  )}
                  <div className="absolute top-1 left-1 p-0.5 bg-black/70 rounded text-[9px] text-white">
                    {item.contentType === 'photo_carousel' ? (
                      <Images className="w-3 h-3 text-violet-400" />
                    ) : (
                      <Film className="w-3 h-3 text-rose-400" />
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-white truncate">
                      {item.title || 'Contenu TikTok'}
                    </h5>
                    <div className="text-[11px] text-neutral-400 font-mono truncate mt-0.5">
                      @{item.authorUsername}
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1">
                      {formatDate(item.date)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-neutral-900">
                    <button
                      onClick={() => {
                        onSelectUrl(item.originalUrl);
                        onClose();
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Ré-analyser</span>
                    </button>

                    <button
                      onClick={() => handleCopy(item.id, item.originalUrl)}
                      className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copié</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copier</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="ml-auto text-neutral-500 hover:text-red-400 p-1 transition-colors"
                      title="Supprimer cet élément"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Clear All */}
        {items.length > 0 && (
          <div className="p-4 border-t border-neutral-800 bg-neutral-950">
            {confirmClear ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400 font-medium">Confirmer l'effacement ?</span>
                <button
                  onClick={() => {
                    onClearAll();
                    setConfirmClear(false);
                  }}
                  className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Oui, vider
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
                  className="px-2 py-1 text-neutral-400 text-xs hover:text-white"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="w-full py-2 px-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-neutral-400" />
                <span>Effacer tout l'historique local</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
