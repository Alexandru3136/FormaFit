# Forma

Forma este un MVP web/PWA pentru nutritie, sala, progres si coach AI.

## Stack

- Next.js App Router
- React
- TypeScript
- Prisma
- PostgreSQL (Neon) pentru dezvoltare si productie
- Stripe pentru abonamente
- OmniRoute pentru functii AI
- PWA manifest + service worker

## Rulare locala

```bash
npm.cmd install
npm.cmd run db:migrate
npm.cmd run dev -- -p 3001
```

`npm run db:migrate` aplica migratiile Prisma pe baza Neon si genereaza clientul.
Aplicatia ruleaza la `http://localhost:3001`.

## Baza de date

- Provider: PostgreSQL, gazduit pe Neon.
- Migratiile traiesc in `prisma/migrations/` si se aplica cu `npm run db:migrate` (dev) sau `npm run db:deploy` (productie/CI).
- `DATABASE_URL` foloseste conexiunea *pooled* (rulare app); `DIRECT_URL` foloseste conexiunea directa (migratii).
- `npm run db:studio` deschide Prisma Studio pentru inspectie.

## Environment

Porneste de la `.env.example` si configureaza:

- `DATABASE_URL` (Neon pooled connection)
- `DIRECT_URL` (Neon direct connection, pentru migratii)
- `SESSION_SECRET`
- `OMNIROUTE_BASE_URL`
- `OMNIROUTE_API_KEY`
- `OMNIROUTE_MODEL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PREMIUM_PRICE_ID`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT`

Nu pune chei reale in repository.

## Ce este implementat

- Conturi, sesiuni si profil
- Calculator calorii si macro-uri
- Jurnal alimentar pe cont
- Idei de mese cu limite Free/Premium
- Plan alimentar Premium salvat ca plan activ
- Dashboard cu progres real pe zi
- Plan sala dupa disponibilitatea userului
- Tracking basic pentru antrenamente
- Premium gate si Stripe webhook
- PWA installability si subscription storage pentru push
- Pagini Terms/Privacy
- Admin basic

## Ce mai trebuie pentru productie

- resetare parola si email verification
- CSRF/rate limiting intarit
- Web Push sender cu VAPID si scheduler
- teste automate
- observability: logs, errors, analytics
- texte legale validate juridic
