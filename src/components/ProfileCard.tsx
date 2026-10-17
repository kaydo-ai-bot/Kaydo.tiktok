import React from 'react';
import {
  User,
  CheckCircle,
  ExternalLink,
  Film,
  Heart,
  Eye,
  Download,
  AlertCircle,
  Users,
  ShieldCheck,
  Play
} from 'lucide-react';
import { TikTokProfileData, TikTokProfilePost } from '../types/tiktok';

interface ProfileCardProps {
  data: TikTokProfileData;
  onSelectPost: (postUrl: string) => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ data, onSelectPost }) => {
  const author = data.author;

  const formatCount = (num: number = 0) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toLocaleString('fr-FR');
  };

  const formatDuration = (secs: number = 0) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8 bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Barre d'information supérieure */}
      <div className="px-5 py-3.5 bg-neutral-950 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          <span className="font-bold text-sky-400 uppercase tracking-wider text-[11px]">
            Profil TikTok Public Détecté
          </span>
          <span className="text-neutral-500">·</span>
          <span className="text-neutral-400">Ce lien renvoie vers un compte utilisateur</span>
        </div>

        <a
          href={data.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-neutral-400 hover:text-sky-400 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Voir le profil TikTok</span>
        </a>
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* En-tête profil */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <img
            src={author.avatar || 'https://www.tiktok.com/favicon.ico'}
            alt={author.nickname}
            className="w-20 h-20 rounded-full border-2 border-neutral-700 object-cover bg-neutral-800 shadow-lg shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="%23666"><rect width="100%" height="100%" fill="%23222"/><text x="50%" y="55%" font-size="32" fill="%23aaa" dominant-baseline="middle" text-anchor="middle">@</text></svg>';
            }}
          />

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-bold text-white truncate">
                {author.nickname}
              </h3>
              {author.verified && (
                <CheckCircle className="w-5 h-5 text-sky-400 fill-sky-400/20 shrink-0" />
              )}
            </div>

            <div className="text-sm text-neutral-400 font-mono mt-0.5">
              @{author.uniqueId}
            </div>

            {author.signature && (
              <p className="text-xs sm:text-sm text-neutral-300 mt-2 line-clamp-3 max-w-xl">
                {author.signature}
              </p>
            )}

            {/* Statistiques publiques */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5 mt-4 pt-4 border-t border-neutral-800 text-xs">
              <div>
                <span className="font-bold text-white text-sm font-mono mr-1">
                  {formatCount(author.followerCount)}
                </span>
                <span className="text-neutral-500">Abonnés</span>
              </div>
              <div>
                <span className="font-bold text-white text-sm font-mono mr-1">
                  {formatCount(author.followingCount)}
                </span>
                <span className="text-neutral-500">Abonnements</span>
              </div>
              <div>
                <span className="font-bold text-white text-sm font-mono mr-1">
                  {formatCount(author.heartCount)}
                </span>
                <span className="text-neutral-500">J'aime</span>
              </div>
              <div>
                <span className="font-bold text-white text-sm font-mono mr-1">
                  {formatCount(author.videoCount)}
                </span>
                <span className="text-neutral-500">Publications</span>
              </div>
            </div>
          </div>
        </div>

        {/* Note de politique et sécurité */}
        <div className="p-3.5 bg-neutral-950 border border-neutral-800 rounded-xl flex items-start gap-3 text-xs text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-neutral-200">Sélection individuelle des vidéos :</strong> Conformément aux règles de protection et pour éviter toute saturation abusive, KAYDO ne télécharge pas l'intégralité d'un compte en masse. Choisissez ci-dessous la publication que vous souhaitez analyser et télécharger.
          </div>
        </div>

        {/* Liste des publications accessibles */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Publications disponibles ({data.posts.length})</span>
            <span className="text-neutral-500 text-xs lowercase font-normal">
              Cliquez pour analyser et télécharger
            </span>
          </h4>

          {data.posts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
              {data.posts.map((post) => (
                <div
                  key={post.id}
                  className="group relative bg-neutral-950 border border-neutral-800 hover:border-sky-500/50 rounded-xl overflow-hidden flex flex-col justify-between transition-all"
                >
                  <div className="relative aspect-[9/16] bg-black overflow-hidden">
                    <img
                      src={post.cover}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                    {/* Badge type et durée */}
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 backdrop-blur-sm rounded text-[10px] font-mono text-white flex items-center gap-1">
                      {post.duration ? formatDuration(post.duration) : 'Vidéo'}
                    </div>

                    {/* Vues */}
                    {post.playCount !== undefined && post.playCount > 0 && (
                      <div className="absolute bottom-2 left-2 text-[10px] text-white flex items-center gap-1 font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded">
                        <Eye className="w-3 h-3 text-neutral-300" />
                        <span>{formatCount(post.playCount)}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 flex flex-col justify-between flex-1">
                    <p className="text-xs text-neutral-200 line-clamp-2 leading-snug mb-2 font-medium">
                      {post.title || 'Vidéo sans titre'}
                    </p>

                    <button
                      onClick={() => onSelectPost(post.webVideoUrl)}
                      className="w-full py-1.5 px-2 bg-neutral-800 hover:bg-sky-600 text-neutral-200 hover:text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Analyser & Télécharger</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-xl text-center">
              <Film className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                Les vidéos de ce profil n'ont pas pu être listées directement (le compte peut être privé ou restreint). Vous pouvez copier le lien d'une vidéo spécifique directement depuis l'application TikTok pour la télécharger.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
