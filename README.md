# 🎨 NoteFlow - Your New Home for Writing

A beautiful, modern note-taking application built with Next.js 15, Convex, and Clerk.

![NoteFlow](https://img.shields.io/badge/Status-Ready-success)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Convex](https://img.shields.io/badge/Convex-Backend-blue)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple)

## ✨ Features

### ✅ Fully Implemented
- **🎨 Purple/Lavender Theme** - Beautiful, calming color scheme
- **📝 Note Management** - Create, edit, delete notes with auto-save
- **🏠 Dashboard** - Clean sidebar navigation with folder organization
- **👤 User Authentication** - Secure login/register with Clerk
- **⚡ Real-time Sync** - Instant updates across all devices via Convex
- **📌 Pin Notes** - Keep important notes at the top
- **🗂️ Folder Organization** - Organize notes into folders (UI ready)
- **📊 Writing Stats** - Track your writing progress
- **🎯 Auto-save** - Never lose your work (saves every 500ms)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- Convex account (sign up at [convex.dev](https://convex.dev))
- Clerk account (sign up at [clerk.com](https://clerk.com))

### Installation

1. **Clone and install dependencies**
   ```bash
   cd noteflow
   npm install
   ```

2. **Set up Convex**
   ```bash
   npx convex dev
   ```
   Copy the deployment URL to `.env.local`

3. **Set up Clerk**
   - Create application at [clerk.com](https://clerk.com)
   - Copy API keys to `.env.local`
   - Disable email verification for development (see [CLERK_SETUP.md](CLERK_SETUP.md))

4. **Configure environment variables**
   ```env
   # .env.local
   CONVEX_DEPLOYMENT=dev:your-deployment
   NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...

   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/workspace
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/workspace
   ```

5. **Start development servers**
   ```bash
   # Terminal 1: Convex
   npx convex dev

   # Terminal 2: Next.js
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
noteflow/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   └── providers.tsx      # Convex + Clerk providers
├── modules/               # Feature-based modules
│   ├── auth/             # Authentication
│   ├── dashboard/        # Sidebar, navigation
│   ├── notes/            # Note management
│   ├── folders/          # Folder organization
│   ├── tags/             # Tag system
│   └── shared/           # Shared utilities
├── components/           # shadcn/ui components
├── convex/              # Convex backend
│   ├── schema.ts        # Database schema
│   ├── notes.ts         # Note functions
│   ├── folders.ts       # Folder functions
│   └── users.ts         # User functions
└── lib/                 # Utilities

```

## 🎯 Usage

### Creating a Note
1. Click "New story" in the sidebar
2. Start typing - auto-saves every 500ms
3. Give it a title or leave as "Untitled"

### Organizing Notes
1. Create folders using the "+" button
2. Drag notes into folders (coming soon)
3. Use tags for flexible organization (coming soon)

### Finding Notes
- Browse all notes in "All stories"
- Filter by folder
- Search (coming soon)
- Pin important notes to keep them visible

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Backend**: Convex (real-time database)
- **Authentication**: Clerk
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod

## 📚 Documentation

- [SETUP.md](SETUP.md) - Detailed setup instructions
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) - Architecture guide
- [FEATURES_COMPLETE.md](FEATURES_COMPLETE.md) - Feature implementation details
- [CLERK_SETUP.md](CLERK_SETUP.md) - Clerk configuration guide
- [FIXES_APPLIED.md](FIXES_APPLIED.md) - Troubleshooting guide

## 🎨 Design

NoteFlow features a calming purple/lavender color scheme inspired by modern writing apps. The design emphasizes:
- Clean, distraction-free editing
- Intuitive navigation
- Real-time feedback
- Responsive layout

## 🔐 Security

- Secure authentication via Clerk
- Protected API routes
- User-scoped data (all queries filtered by user ID)
- Environment variable protection

## 📈 Performance

- Server-side rendering with Next.js
- Optimistic updates for instant feedback
- Debounced auto-save to reduce network calls
- Efficient real-time subscriptions via Convex

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

## 📝 License

MIT License - feel free to use this project as inspiration for your own work.

## 🎉 Acknowledgments

- Design inspiration from Shosho and Notion
- Built with amazing tools: Next.js, Convex, Clerk, shadcn/ui

---

**Happy Writing! 📝✨**
