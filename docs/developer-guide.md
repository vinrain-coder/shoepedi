# ShoeStar Developer Documentation

## 1) Project overview
ShoeStar is a Next.js App Router ecommerce application with:
- Public storefront pages under `app/(home)` and `app/(root)`.
- Authentication flows under `app/(auth)`.
- Checkout flows under `app/checkout`.
- Admin dashboard features under `app/admin`.
- API endpoints under `app/api`.

## 2) Tech stack
- **Framework:** Next.js 16 + React 19.
- **Language:** TypeScript.
- **Database:** MongoDB (Mongoose + native MongoDB client for Better Auth adapter).
- **Auth:** Better Auth with email/password and Google social sign-in.
- **State/UI:** Zustand hooks, Tailwind CSS, shadcn-style UI components.

## 3) Local development setup
### Prerequisites
- Node.js 20+
- pnpm (recommended)
- MongoDB instance

### Install and run
```bash
pnpm install
pnpm dev
```
App starts at `http://localhost:3000`.

### Seed data (optional)
```bash
pnpm seed
```

## 4) Environment variables
Create `.env.local` and configure:

### Core
- `MONGODB_URI`
- `MONGODB_DB`

### Authentication
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ADMIN_EMAILS` (semicolon-separated; matching users are auto-promoted to ADMIN at account creation)

### Email / notifications
- `RESEND_API_KEY`
- `SENDER_NAME`
- `SENDER_EMAIL`

### Payments
- `PAYSTACK_SECRET_KEY`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`

### SMS / phone alerts
- `AFRICASTALKING_USERNAME`
- `AFRICASTALKING_API_KEY`
- `AFRICASTALKING_SANDBOX_MODE`
- `ADMIN_PHONE_NUMBERS`

### Public social/settings links
- `NEXT_PUBLIC_FACEBOOK_URL`
- `NEXT_PUBLIC_INSTAGRAM_URL`
- `NEXT_PUBLIC_TWITTER_URL`
- `NEXT_PUBLIC_TIKTOK_URL`
- `NEXT_PUBLIC_YOUTUBE_URL`
- `NEXT_PUBLIC_WHATSAPP_NUMBER`

## 5) Project structure
```text
app/
  (auth)/        # sign-in, sign-up, password reset, email verification
  (home)/        # storefront landing page
  (root)/        # catalog, product, cart, account, blogs, tracking, wishlist, etc.
  checkout/      # checkout pages and payment UI
  admin/         # admin dashboard modules
  api/           # route handlers (auth, uploadthing, paystack verify, tracking, etc.)

lib/
  actions/       # server actions per domain (products, orders, settings, support, etc.)
  db/            # MongoDB and Mongoose connection helpers
  email/         # auth + transactional emails
  auth.ts        # Better Auth configuration

components/
  shared/        # app-specific reusable UI
  ui/            # lower-level UI primitives
```

## 6) Role and access model
- User roles are `USER` and `ADMIN`.
- Admin role is assigned automatically for emails listed in `ADMIN_EMAILS` during user creation.
- Global maintenance mode redirects non-admin users to `/maintenance`.

## 7) Development workflow
1. Create a feature branch.
2. Implement UI in `components/` and route pages in `app/...`.
3. Keep business logic in `lib/actions/*` where possible.
4. Validate locally:
   - `pnpm dev`
   - `pnpm build`
5. Commit using clear, scoped messages.

## 8) Deployment checklist
- Verify all required env vars are set.
- Confirm MongoDB connectivity and correct `MONGODB_DB`.
- Validate auth providers and callback URLs.
- Validate Paystack keys in target environment.
- Test critical flows: sign-up, sign-in, cart, checkout, admin login, order management.
