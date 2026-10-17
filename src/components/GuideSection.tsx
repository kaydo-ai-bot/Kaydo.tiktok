import React, { useState } from 'react';
import {
  Film,
  Images,
  User,
  Music,
  Download,
  Copy,
  Smartphone,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const GuideSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const formats = [
    {
      title: 'Vidéos TikTok HD',
      icon: Film,
      color: 'from-rose-500 to-rose-600',
      description: 'Téléchargez les vidéos au format MP4 haute résolution sans le filigrane officiel TikTok ni logo superposé.',
      tag: 'MP4 HD'
    },
    {
      title: 'Diaporamas & Photos',
      icon: Images,
      color: 'from-violet-500 to-indigo-600',
      description: 'Détection intelligente des carrousels photos. Téléchargez chaque image en pleine définition ou l\'ensemble dans une archive ZIP.',
      tag: 'JPG & ZIP'
    },
    {
      title: 'Profils Utilisateurs',
      icon: User,
      color: 'from-sky-500 to-blue-600',
      description: 'Collez le lien d\'un profil pour explorer ses vidéos publiques accessibles et sélectionner individuellement celle que vous souhaitez.',
      tag: 'Profils'
    },
    {
      title: 'Pistes Audio & Musique',
      icon: Music,
      color: 'from-amber-500 to-orange-600',
      description: 'Extrayez directement la bande son originale au format audio MP3 haute fidélité pour vos propres montages ou playlists.',
      tag: 'MP3 320kbps'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Copiez le lien TikTok',
      desc: 'Dans l\'application TikTok ou sur le site web, cliquez sur « Partager » puis « Copier le lien ».'
    },
    {
      step: '02',
      title: 'Collez dans KAYDO',
      desc: 'Collez le lien dans la barre de recherche ci-dessus et cliquez sur le bouton « Analyser le lien ».'
    },
    {
      step: '03',
      title: 'Téléchargez votre fichier',
      desc: 'Choisissez votre format : vidéo MP4 sans filigrane, photos HD, archive ZIP ou audio MP3.'
    }
  ];

  const faqs = [
    {
      q: 'KAYDO TIKTOK DOWNLOADER est-il gratuit ?',
      a: 'Oui, l\'application est totalement gratuite, sans abonnement et sans limite de téléchargement pour vos contenus personnels.'
    },
    {
      q: 'Les vidéos sont-elles réellement sans filigrane (No Watermark) ?',
      a: 'Absolument. Dès que la vidéo source le permet, KAYDO extrait le flux vidéo brut d\'origine haute résolution sans aucun filigrane TikTok superposé.'
    },
    {
      q: 'Comment télécharger sur iPhone ou iPad (iOS) ?',
      a: 'Sur Safari ou Google Chrome pour iOS, collez le lien et cliquez sur « Télécharger MP4 HD ». iOS vous demandera confirmation : validez et retrouvez la vidéo directement dans votre application « Fichiers » ou « Photos ».'
    },
    {
      q: 'Comment enregistrer les carrousels de photos TikTok ?',
      a: 'KAYDO détecte immédiatement les publications contenant plusieurs photos. Vous pouvez soit télécharger les photos une par une, soit cliquer sur « Tout télécharger en ZIP » pour obtenir un fichier compressé prêt à dézipper.'
    },
    {
      q: 'Pourquoi une vidéo privée ne peut-elle pas être téléchargée ?',
      a: 'KAYDO respecte strictement les autorisations de TikTok et la vie privée des créateurs. Les comptes privés, vidéos limitées aux amis ou publications supprimées ne peuvent pas être consultées sans autorisation.'
    }
  ];

  return (
    <section className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 space-y-20">
      {/* 1. SECTION FORMATS PRIS EN CHARGE */}
      <div id="formats" className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-500">
            Compatibilité Complète
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Reconnaissance intelligente de tous les liens TikTok
          </h2>
          <p className="text-neutral-400 text-sm mt-2">
            Notre moteur analyse automatiquement le type de lien pour vous proposer les meilleures options de conversion.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {formats.map((fmt, idx) => (
            <div
              key={idx}
              className="p-5 bg-neutral-900/60 border border-neutral-800 rounded-2xl hover:border-neutral-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${fmt.color} flex items-center justify-center text-white shadow-md mb-4`}>
                  <fmt.icon className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white">{fmt.title}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded font-semibold">
                    {fmt.tag}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {fmt.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. COMMENT ÇA MARCHE */}
      <div id="comment-ca-marche" className="space-y-8">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
            Simplicité & Rapidité
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Comment télécharger en 3 étapes ?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((st, idx) => (
            <div
              key={idx}
              className="relative p-6 bg-neutral-900/40 border border-neutral-800 rounded-2xl flex flex-col"
            >
              <div className="text-3xl font-black font-mono bg-gradient-to-br from-rose-500 to-violet-500 bg-clip-text text-transparent mb-3">
                {st.step}
              </div>
              <h3 className="text-base font-bold text-white mb-2">{st.title}</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. FAQ ACCORDION */}
      <div id="faq" className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-sky-400">
            Foire aux questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Questions fréquentes
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-4 font-semibold text-sm text-neutral-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-neutral-400 leading-relaxed border-t border-neutral-850 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
