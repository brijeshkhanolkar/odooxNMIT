Dayflow is a Next.js and Supabase HRMS application.

## Supabase setup

The app is configured to use the supplied Supabase project through a local `.env.local` file. That file is intentionally ignored by Git.

1. In the Supabase SQL Editor, run the migration files in `supabase/migrations` in numeric order (`001` through `015`). Migration `015` enables secure employee self-signup without putting a service-role key in the app.
2. In **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` as a redirect URL for local development. Add your deployed equivalent when deploying.
3. Set `NEXT_PUBLIC_SITE_URL` in `.env.local` to the deployed site URL before enabling email confirmation or password-reset emails.
4. To use the administrator employee-provisioning flow, add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local`. This secret must remain server-only and must never be given a `NEXT_PUBLIC_` prefix.

### First administrator

Sign up the first employee through `/signup`, then promote that account in the Supabase SQL Editor:

```sql
UPDATE public.profiles
SET role_id = (SELECT id FROM public.roles WHERE name = 'admin')
WHERE email = 'admin@example.com';
```

Replace `admin@example.com` with the email used at signup. Once promoted, that user can access `/admin`. The administrator can manage existing data with the normal authenticated session; only the **Create employee** flow requires `SUPABASE_SERVICE_ROLE_KEY` because it creates a Supabase Auth account.

Use `.env.example` as the template for another environment.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
