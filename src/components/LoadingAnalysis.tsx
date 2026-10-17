import React, { useEffect, useState } from 'react';
import { Sparkles, Shield, Film, CheckCircle2 } from 'lucide-react';

export const LoadingAnalysis: React.FC = () => {
  const [step, setStep] = useState(0);

  const steps = [
    { title: "Résolution du lien & vérification de sécurité", desc: "Suivi des redirections autorisées..." },
    { title: "Détection du type de publication", desc: "Identification : vidéo, diaporama photos ou profil..." },
    { title: "Extraction des flux haute définition", desc: "Préparation des fichiers téléchargeables sans filigrane..." }
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 800);
    const timer2 = setTimeout(() => setStep(2), 1700);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto my-8 p-6 bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-xl backdrop-blur-sm">
      <div className="flex flex-col items-center text-center">
        {/* Pulsing neon icon */}
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-violet-600 flex items-center justify-center animate-pulse shadow-lg shadow-rose-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -inset-2 bg-rose-500/20 rounded-2xl blur-md -z-10 animate-ping opacity-30" />
        </div>

        <h3 className="text-lg font-bold text-white mb-1">
          Analyse du contenu TikTok en cours
        </h3>
        <p className="text-xs text-neutral-400 mb-6">
          Veuillez patienter pendant la récupération des métadonnées officielles.
        </p>

        {/* Steps */}
        <div className="w-full space-y-3 text-left">
          {steps.map((s, idx) => {
            const isDone = step > idx;
            const isCurrent = step === idx;

            return (
              <div
                key={idx}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-neutral-800/80 border-rose-500/50 shadow-sm'
                    : isDone
                    ? 'bg-neutral-900/40 border-neutral-800 text-neutral-400'
                    : 'bg-neutral-900/20 border-neutral-850 text-neutral-600'
                }`}
              >
                <div className="mt-0.5">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 border-2 border-rose-500/30 border-t-rose-500 rounded-full animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-neutral-700" />
                  )}
                </div>
                <div className="flex-1">
                  <div className={`text-xs font-semibold ${isCurrent ? 'text-white' : isDone ? 'text-neutral-300' : 'text-neutral-500'}`}>
                    {s.title}
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    {s.desc}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
