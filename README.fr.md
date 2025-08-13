# 🔗 Application de Partage JSON

Une application web fullstack moderne construite avec Next.js 15 pour créer, éditer et partager des documents JSON avec authentification sécurisée et fonctionnalités de collaboration en temps réel.

> 🇬🇧 **English version available**: [README.md](README.md)

## ✨ Stack Technique

- **Framework** : Next.js 15 avec App Router
- **Authentification** : Clerk
- **Base de données** : PostgreSQL
- **ORM** : Prisma
- **Styles** : TailwindCSS 4
- **Langage** : TypeScript
- **Déploiement** : Prêt pour Vercel

## 🚀 Fonctionnalités

- **🔐 Authentification utilisateur** - Connexion/inscription sécurisée avec Clerk
- **📝 Éditeur JSON** - Créer et éditer des documents JSON avec validation
- **💾 Sauvegarde automatique** - Les documents sont sauvegardés dans la base de données PostgreSQL
- **📋 Gestion des documents** - Voir, éditer et supprimer vos documents
- **🔗 Partage public** - Partager des liens en lecture seule via des slugs uniques
- **📱 Design responsive** - Fonctionne sur ordinateur et mobile
- **⚡ Type-safe** - Support complet TypeScript

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- Base de données PostgreSQL
- Compte Clerk

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-depot>
   cd json-share-app
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.example .env.local
   ```
   
   Remplir vos variables d'environnement :
   ```env
   # Base de données
   DATABASE_URL="postgresql://username:password@localhost:5432/json_share_app"
   
   # Authentification Clerk
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   
   # URLs Clerk
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   
   # URL de l'application
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Configurer la base de données**
   ```bash
   # Générer le client Prisma
   npm run db:generate
   
   # Pousser le schéma vers la base de données
   npm run db:push
   ```

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

   Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📁 Structure du projet

```
json-share-app/
├── src/
│   ├── app/                    # Pages Next.js App Router
│   │   ├── api/               # Routes API
│   │   ├── dashboard/         # Page tableau de bord
│   │   ├── edit/[id]/        # Page d'édition de document
│   │   ├── new/              # Page nouveau document
│   │   ├── share/[slug]/     # Page de partage public
│   │   ├── layout.tsx        # Layout racine
│   │   └── page.tsx          # Page d'accueil
│   ├── components/           # Composants réutilisables
│   │   ├── DocumentList.tsx  # Composant liste de documents
│   │   ├── JsonEditor.tsx    # Composant éditeur JSON
│   │   └── Navigation.tsx    # Composant de navigation
│   ├── lib/                  # Fonctions utilitaires
│   │   ├── actions.ts        # Actions serveur
│   │   ├── db.ts            # Connexion base de données
│   │   ├── utils.ts         # Fonctions utilitaires
│   │   └── validations.ts   # Schémas Zod
│   ├── types/               # Types TypeScript
│   └── middleware.ts        # Middleware Clerk
├── prisma/
│   └── schema.prisma        # Schéma de base de données
├── .env.example            # Modèle de variables d'environnement
└── README.md              # Ce fichier
```

## 🗄️ Schéma de base de données

### User (Utilisateur)
- `id` (String, Clé primaire) - ID utilisateur Clerk
- `email` (String, Unique)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### JsonDocument (Document JSON)
- `id` (String, Clé primaire, CUID)
- `title` (String)
- `content` (String) - Contenu JSON
- `slug` (String, Unique) - Pour le partage public
- `userId` (String, Clé étrangère)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## 🔌 Routes API

- `GET /api/documents` - Obtenir les documents de l'utilisateur
- `POST /api/documents` - Créer un nouveau document
- `GET /api/documents/[id]` - Obtenir un document spécifique
- `PUT /api/documents/[id]` - Mettre à jour un document
- `DELETE /api/documents/[id]` - Supprimer un document

## 🚀 Déploiement

### Déploiement Vercel

1. **Pousser vers GitHub**
   ```bash
   git add .
   git commit -m "Commit initial"
   git push origin main
   ```

2. **Déployer sur Vercel**
   - Connecter votre dépôt GitHub à Vercel
   - Ajouter les variables d'environnement dans le tableau de bord Vercel
   - Déployer

3. **Configurer la base de données de production**
   - Utiliser un service PostgreSQL (Neon, Supabase, etc.)
   - Mettre à jour `DATABASE_URL` dans les variables d'environnement Vercel
   - Exécuter les migrations de base de données

## 📜 Scripts

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire pour la production
- `npm run start` - Démarrer le serveur de production
- `npm run lint` - Exécuter ESLint
- `npm run db:generate` - Générer le client Prisma
- `npm run db:push` - Pousser le schéma vers la base de données
- `npm run db:migrate` - Exécuter les migrations de base de données
- `npm run db:studio` - Ouvrir Prisma Studio

## 🤝 Contribution

1. Forker le dépôt
2. Créer une branche de fonctionnalité
3. Faire vos modifications
4. Ajouter des tests si applicable
5. Soumettre une pull request

## 📄 Licence

Licence MIT - voir le fichier LICENSE pour les détails

---

**Construit avec ❤️ en utilisant Next.js 15, React 19, Prisma, et Clerk**
