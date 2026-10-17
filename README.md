# KAYDO TIKTOK DOWNLOADER

Une application web complète, moderne et responsive permettant de télécharger les contenus TikTok (vidéos sans filigrane, carrousels de photos, audios MP3 et profils publics).

---

## 🚀 Fonctionnalités Principales

- **Vidéos TikTok HD sans filigrane** : Extraction du flux vidéo haute définition brut au format MP4.
- **Carrousels & Diaporamas Photos** : Détection des publications contenant plusieurs photos, affichage en galerie / grille, téléchargement individuel ou en archive ZIP (`.zip`).
- **Profils Utilisateurs** : Détection intelligente des liens de profil avec affichage des statistiques publiques (abonnés, vidéos) et sélection individuelle des publications à analyser et télécharger.
- **Extraction Audio MP3** : Téléchargement de la piste sonore originale en 320 kbps.
- **Résolution automatique des liens courts** : Prise en charge des liens `vm.tiktok.com`, `vt.tiktok.com` et liens de partage.
- **Proxy de streaming sécurisé** : Évite les blocages CORS et les restrictions de referer imposées par les serveurs de médias TikTok.
- **Suivi réel de progression** : Barre de progression en temps réel avec pourcentage et volume téléchargé (Mo).
- **Historique local et confidentialité** : Sauvegarde dans le `localStorage` de votre navigateur. Aucune donnée personnelle ni média n'est stocké sur le serveur.
- **Interface 100% en français** : Messages d'erreurs clairs et compréhensibles.
- **Thème sombre élégant** avec touches de rouge TikTok (`#FE2C55`) et violet (`#8B5CF6`).

---

## 🛠️ Architecture Technique

- **Frontend** : React 19, TypeScript, Tailwind CSS v4, Lucide React icons, Motion.
- **Backend** : Node.js, Express, TSX, JSZip.
- **Moteur d'analyse** : Résolution des redirections HTTP autorisées, interrogation de l'API de métadonnées TikWM / TikTok oEmbed, et validation stricte SSRF.

---

## 📦 Installation et Lancement Local

### Prérequis
- Node.js (version 18+ recommandée)
- npm ou yarn

### 1. Cloner le projet et installer les dépendances
```bash
npm install
```

### 2. Configuration des variables d'environnement
Copiez `.env.example` en `.env` :
```bash
cp .env.example .env
```

Variables disponibles :
- `PORT` : Port d'écoute du serveur (par défaut `3000`).
- `NODE_ENV` : `development` ou `production`.

### 3. Démarrage en mode développement
```bash
npm run dev
```
L'application sera accessible sur `http://localhost:3000`.

### 4. Compilation et exécution en production
```bash
npm run build
npm start
```

---

## 🔒 Sécurité et Respect des Politiques

1. **Validation SSRF** : Seuls les domaines officiels de TikTok (`tiktok.com`, `vm.tiktok.com`, etc.) et les domaines de CDN autorisés sont traités. Les requêtes vers `localhost` ou des adresses IP privées sont bloquées.
2. **Protection Anti-Abus** : Limitation du taux de requêtes (Rate Limiter en mémoire) pour prévenir la surcharge du serveur.
3. **Respect de la vie privée** : Les publications privées ou restreintes par leurs auteurs ne sont pas accessibles et ne peuvent pas être contournées.
4. **Pas de téléchargement de masse abusif** : Pour les profils, les vidéos sont analysées et téléchargées une par une sur sélection de l'utilisateur.

---

## 📄 Licence
Ce projet est développé à des fins personnelles et éducatives dans le respect des droits de propriété intellectuelle des créateurs.
KAYDO n'est pas affilié à TikTok ou ByteDance Ltd.
