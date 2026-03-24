# Realx Platform

## Overview

Realx is a modern real estate platform built with a scalable full-stack architecture using Next.js. It supports property listings, user management, and optimized media delivery.

---

## Tech Stack

* **Framework:** Next.js
* **Database:** PostgreSQL (via Supabase)
* **ORM:** Prisma
* **Caching:** Upstash Redis
* **Media Storage:** Cloudinary
* **Deployment:** Vercel
* **Security & DNS:** Cloudflare

---

## Requirements

Make sure you have the following installed:

* Node.js (v18 or later)
* npm or yarn
* Git

---

## 📁 Project Structure

```bash
realx-platform/
│
├── app/                # Next.js app directory (routes, pages, layouts)
├── components/         # Reusable UI components
├── lib/                # Utility functions (API clients, helpers)
├── prisma/             # Prisma schema and migrations
│   └── schema.prisma
├── public/             # Static assets (images, icons)
├── styles/             # Global styles (CSS/Tailwind)
├── types/              # TypeScript types/interfaces
│
├── .env                # Environment variables (not committed)
├── .gitignore
├── package.json
├── README.md
```

### Folder Explanation

* **app/** → Handles routing, pages, layouts (Next.js App Router)
* **components/** → Shared UI components (buttons, cards, etc.)
* **lib/** → API logic, database clients, helper functions
* **prisma/** → Database schema and migration files
* **public/** → Static files accessible in browser
* **styles/** → CSS or Tailwind styling
* **types/** → Type definitions for better code structure

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/your-repo.git
```

2. Navigate into the project folder:

```bash
cd your-repo
```

3. Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the root directory and add the following:

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Database (Prisma)
DATABASE_URL=your_postgresql_connection_string

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Database Setup (Prisma)

Run the following commands:

```bash
npx prisma generate
npx prisma migrate dev
```

---

## Running the Project

Start the development server:

```bash
npm run dev
```

The app will be available at:

```
http://localhost:3000
```

---

## 🚀 Deployment Flow

1. **Code Development**

   * Developers write code locally
   * Changes are committed and pushed to GitHub

2. **Automatic Deployment**

   * Vercel is connected to the GitHub repository
   * Every push triggers an automatic build and deployment

3. **Build Process**

   * Vercel installs dependencies
   * Runs build command (`npm run build`)
   * Prepares the Next.js application

4. **Environment Variables**

   * Vercel uses environment variables configured in its dashboard:

     * Supabase keys
     * Redis credentials
     * Cloudinary credentials

5. **Live Application**

   * The app is deployed and accessible via:

     ```
     https://your-project.vercel.app
     ```

6. **Domain & Security**

   * Custom domain is connected via Cloudflare
   * Cloudflare provides:

     * SSL (HTTPS)
     * WAF protection
     * DNS routing

7. **Backend Services**

   * Supabase handles database operations
   * Upstash Redis handles caching and rate limiting
   * Cloudinary handles image storage and delivery

---

## Deployment

To deploy manually:

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

---

## Notes

* Do not commit `.env` files to version control
* Keep all secret keys secure
* Ensure Supabase RLS policies are configured before production

---

## Contributors

All contributors should:

* Pull latest changes before starting work
* Create meaningful commit messages
* Test features before pushing

---
