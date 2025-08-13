# 🔗 JSON Share App

A modern fullstack web application built with Next.js 15 for creating, editing, and sharing JSON documents with secure authentication and real-time collaboration features.

> 🇫🇷 **Version française disponible** : [README.fr.md](README.fr.md)

## ✨ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Authentication**: Clerk
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: TailwindCSS 4
- **Language**: TypeScript
- **Deployment**: Vercel-ready

## Features

- 🔐 **User Authentication** - Secure sign-up/login with Clerk
- 📝 **JSON Editor** - Create and edit JSON documents with validation
- 💾 **Auto-save** - Documents are saved to PostgreSQL database
- 📋 **Document Management** - View, edit, and delete your documents
- 🔗 **Public Sharing** - Share read-only links via unique slugs
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚡ **Type-safe** - Full TypeScript support

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Clerk account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd json-share-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/json_share_app"
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   
   # Clerk URLs
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
   
   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
json-share-app/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Dashboard page
│   │   ├── edit/[id]/        # Edit document page
│   │   ├── new/              # New document page
│   │   ├── share/[slug]/     # Public share page
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   ├── components/           # Reusable components
│   │   ├── DocumentList.tsx  # Document list component
│   │   ├── JsonEditor.tsx    # JSON editor component
│   │   └── Navigation.tsx    # Navigation component
│   ├── lib/                  # Utility functions
│   │   ├── actions.ts        # Server actions
│   │   ├── db.ts            # Database connection
│   │   ├── utils.ts         # Utility functions
│   │   └── validations.ts   # Zod schemas
│   ├── types/               # TypeScript types
│   └── middleware.ts        # Clerk middleware
├── prisma/
│   └── schema.prisma        # Database schema
├── .env.example            # Environment variables template
└── README.md              # This file
```

## Database Schema

### User
- `id` (String, Primary Key) - Clerk user ID
- `email` (String, Unique)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

### JsonDocument
- `id` (String, Primary Key, CUID)
- `title` (String)
- `content` (String) - JSON content
- `slug` (String, Unique) - For public sharing
- `userId` (String, Foreign Key)
- `createdAt` (DateTime)
- `updatedAt` (DateTime)

## API Routes

- `GET /api/documents` - Get user's documents
- `POST /api/documents` - Create new document
- `GET /api/documents/[id]` - Get specific document
- `PUT /api/documents/[id]` - Update document
- `DELETE /api/documents/[id]` - Delete document

## Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Add environment variables in Vercel dashboard
   - Deploy

3. **Set up production database**
   - Use a PostgreSQL service (Neon, Supabase, etc.)
   - Update `DATABASE_URL` in Vercel environment variables
   - Run database migrations

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
