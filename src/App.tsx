/**
 * Application KAYDO TIKTOK DOWNLOADER
 * Téléchargeur de vidéos, carrousels photos et audios TikTok sans filigrane
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UrlInput } from './components/UrlInput';
import { LoadingAnalysis } from './components/LoadingAnalysis';
import { VideoCard } from './components/VideoCard';
import { CarouselCard } from './components/CarouselCard';
import { ProfileCard } from './components/ProfileCard';
import { UnsupportedCard } from './components/UnsupportedCard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { GuideSection } from './components/GuideSection';
import { Footer } from './components/Footer';
import {
  analyzeTikTokUrl,
  getLocalHistory,
  saveToLocalHistory,
  removeFromLocalHistory,
  clearLocalHistory,
  getStoredTheme,
  setStoredTheme
} from './services/api';
import { HistoryItem, TikTokAnalysisResult } from './types/tiktok';
import { AlertTriangle, Sparkles, CheckCircle2, Shield, Zap } from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<TikTokAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Initialisation du thème et de l'historique local
  useEffect(() => {
    const savedTheme = getStoredTheme();
    setTheme(savedTheme);
    setStoredTheme(savedTheme);
    setHistoryItems(getLocalHistory());
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
  };

  // Analyse du lien TikTok
  const handleAnalyze = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl || url).trim();
    if (!targetUrl) return;

    if (overrideUrl) {
      setUrl(overrideUrl);
    }

    setIsLoading(true);
    setErrorMessage(null);
    setAnalysisResult(null);

    // Faire défiler vers la zone de résultat
    const targetElement = document.getElementById('result-area');
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }

    try {
      const result = await analyzeTikTokUrl(targetUrl);
      setAnalysisResult(result);

      // Si c'est une vidéo ou un carrousel valide, l'ajouter à l'historique
      if (result.type === 'video') {
        const item: HistoryItem = {
          id: result.id,
          contentType: 'video',
          title: result.title,
          authorName: result.author.nickname,
          authorUsername: result.author.uniqueId,
          authorAvatar: result.author.avatar,
          thumbnail: result.cover,
          date: Date.now(),
          originalUrl: result.originalUrl,
        };
        const updated = saveToLocalHistory(item);
        setHistoryItems(updated);
      } else if (result.type === 'photo_carousel') {
        const item: HistoryItem = {
          id: result.id,
          contentType: 'photo_carousel',
          title: result.title,
          authorName: result.author.nickname,
          authorUsername: result.author.uniqueId,
          authorAvatar: result.author.avatar,
          thumbnail: result.cover || result.images[0],
          date: Date.now(),
          originalUrl: result.originalUrl,
          mediaCount: result.images.length,
        };
        const updated = saveToLocalHistory(item);
        setHistoryItems(updated);
      }
    } catch (err: any) {
      console.error('Erreur analyse:', err);
      setErrorMessage(
        err.message || 'Impossible d\'analyser ce lien. Vérifiez qu\'il s\'agit d\'une publication TikTok publique.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Suppression d'un élément d'historique
  const handleRemoveHistoryItem = (id: string) => {
    const updated = removeFromLocalHistory(id);
    setHistoryItems(updated);
  };

  // Effacer tout l'historique
  const handleClearHistory = () => {
    clearLocalHistory();
    setHistoryItems([]);
  };

  // Réinitialiser toutes les données locales
  const handleResetAllData = () => {
    if (window.confirm('Voulez-vous réinitialiser votre historique et vos préférences locales ?')) {
      clearLocalHistory();
      setHistoryItems([]);
      setAnalysisResult(null);
      setUrl('');
      setErrorMessage(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 selection:bg-rose-500 selection:text-white">
      {/* Barre de navigation supérieure */}
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyItems.length}
      />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section id="telecharger" className="relative pt-12 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Subtle gradient background mesh */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-rose-600/10 via-violet-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Feature badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-semibold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Sans filigrane</span>
              <span className="text-neutral-600">·</span>
              <span>Haute Définition</span>
              <span className="text-neutral-600">·</span>
              <span className="text-violet-400">Gratuit & Illimité</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
              Téléchargez vos vidéos TikTok{' '}
              <span className="bg-gradient-to-r from-rose-500 via-rose-400 to-violet-500 bg-clip-text text-transparent">
                sans filigrane
              </span>
            </h1>

            {/* Subtitle */}
            <p className="max-w-2xl mx-auto text-neutral-400 text-sm sm:text-base leading-relaxed">
              Collez simplement le lien d'une vidéo, d'un carrousel de photos, d'une musique ou d'un profil public pour extraire le fichier original en haute définition.
            </p>

            {/* URL Input Box */}
            <div className="pt-4">
              <UrlInput
                url={url}
                onChangeUrl={setUrl}
                onAnalyze={() => handleAnalyze()}
                isLoading={isLoading}
              />
            </div>
          </div>
        </section>

        {/* ZONE DE RÉSULTATS & CHARGEMENT */}
        <div id="result-area" className="px-4 sm:px-6 max-w-5xl mx-auto">
          {/* Message d'erreur clair en français */}
          {errorMessage && (
            <div className="w-full max-w-3xl mx-auto my-6 p-4 sm:p-5 bg-red-950/60 border border-red-500/40 rounded-2xl flex items-start gap-3.5 text-red-200 text-sm shadow-xl animate-in fade-in duration-200">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="font-bold text-white">Impossible de récupérer ce contenu</h4>
                <p className="text-xs sm:text-sm text-red-300 leading-relaxed">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}

          {/* Animation pendant l'analyse */}
          {isLoading && <LoadingAnalysis />}

          {/* Affichage du résultat selon le type de contenu */}
          {!isLoading && analysisResult && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
              {analysisResult.type === 'video' && (
                <VideoCard
                  data={analysisResult}
                  onDownloaded={() => {
                    // Actualiser la liste de l'historique
                    setHistoryItems(getLocalHistory());
                  }}
                />
              )}

              {analysisResult.type === 'photo_carousel' && (
                <CarouselCard
                  data={analysisResult}
                  onDownloaded={() => {
                    setHistoryItems(getLocalHistory());
                  }}
                />
              )}

              {analysisResult.type === 'profile' && (
                <ProfileCard
                  data={analysisResult}
                  onSelectPost={(postUrl) => {
                    handleAnalyze(postUrl);
                  }}
                />
              )}

              {analysisResult.type === 'unsupported' && (
                <UnsupportedCard
                  data={analysisResult}
                  onTryAnother={() => {
                    setUrl('');
                    setAnalysisResult(null);
                  }}
                />
              )}
            </div>
          )}
        </div>

        {/* SECTION GUIDE, FORMATS ET FAQ */}
        <GuideSection />
      </main>

      {/* FOOTER */}
      <Footer onResetData={handleResetAllData} />

      {/* DRAWER D'HISTORIQUE LOCAL */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        items={historyItems}
        onRemoveItem={handleRemoveHistoryItem}
        onClearAll={handleClearHistory}
        onSelectUrl={(selectedUrl) => {
          handleAnalyze(selectedUrl);
        }}
      />
    </div>
  );
}
