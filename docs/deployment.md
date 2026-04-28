# RealX World — Deployment Guide

## Required Environment Variables

Set all of these in Vercel → Project → Settings → Environment Variables.

| Variable | Description | Where to get it |
|---|---|---|
| `NEXTAUTH_SECRET` | JWT signing secret (min 32 chars) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Full public URL of the app | e.g. `https://realxworld.com` |
| `DATABASE_URL` | Supabase pooler URL (port 5432) | Supabase → Project → Database → Connection string → Session mode |
| `DIRECT_URL` | Supabase direct URL (port 5432) | Same page — "Direct connection" |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | Upstash Console → Database → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST token | Same page |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Cloudinary Console → Dashboard |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Cloudinary Console → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Same page |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Public cloud name (client-side) | Same as `CLOUDINARY_CLOUD_NAME` |
| `CLOUDFLARE_ONLY` | Set to `true` in production | Manually — leave unset for local dev |

---

## Vercel Deployment

1. Push the repository to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import the GitHub repo.
3. Set all environment variables from the table above.
4. Use these build settings (Vercel usually detects them automatically):
   - **Framework preset:** Next.js
   - **Build command:** `npm run build`
   - **Install command:** `npm install`
   - **Output directory:** `.next`
5. The `postinstall` script (`prisma generate`) runs automatically after `npm install` — no manual step needed.
6. Click **Deploy**.

---

## Database Setup (Production)

Run once from a machine that can reach the Supabase DB directly:

```bash
npx prisma db push
```

**Never run `prisma migrate dev` in production.** It creates migration history files and prompts interactively. `db push` applies the schema directly and is safe for Supabase session-mode connections.

---

## Cloudflare Setup

1. Add your domain to Cloudflare (change nameservers at your registrar).
2. In the Cloudflare DNS tab, add a CNAME record pointing your domain to the Vercel deployment URL (`cname.vercel-dns.com`).
3. Set SSL/TLS mode to **Full (strict)** — Cloudflare → SSL/TLS → Overview.
4. Add a WAF rule to block traffic that bypasses Cloudflare:
   - Cloudflare → Security → WAF → Custom Rules → Create Rule
   - Expression: `(not cf.client.bot) and (not http.request.headers["CF-Connecting-IP"] exists)`
   - Action: Block
5. Disable caching for API routes:
   - Cloudflare → Caching → Cache Rules → Create Rule
   - Match: `URI path starts with /api`
   - Cache status: **Bypass**
6. Set `CLOUDFLARE_ONLY=true` in Vercel environment variables once Cloudflare is active.

---

## Post-Deployment Checklist

- [ ] `GET /api/health` returns `{ "status": "ok", "db": "ok", "redis": "ok" }`
- [ ] Register a new user via `POST /api/auth/register`
- [ ] Login and receive a session token via `POST /api/auth/signin`
- [ ] Create a listing via `POST /api/listings` with a SELLER session
- [ ] Upload an image — verify Cloudinary signed upload works and URL is stored in DB
- [ ] Search listings via `GET /api/listings/search` and confirm Redis cache is populated (check Upstash console)
- [ ] Moderate a listing via `PATCH /api/admin/listings/[id]/moderate` with an ADMIN session
- [ ] Trigger an export via `POST /api/admin/exports` and poll `GET /api/admin/exports/[id]` until status=DONE
- [ ] Verify response headers include `X-Frame-Options: DENY` and `Content-Security-Policy`
