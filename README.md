
## Hi there 👋
# Realx-world Platform

## Overview

Realx-world is a modern real estate platform built with a scalable full-stack architecture using Next.js. It supports property listings, user management, and optimized media delivery.

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

## Deployment

The project is deployed using Vercel.

To deploy:

1. Push code to GitHub
2. Connect the repository to Vercel
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



