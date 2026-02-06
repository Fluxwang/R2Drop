# Repository Guidelines

# 使用中文回答用户的问题

## Project Structure & Module Organization

The project uses the Next.js App Router inside `app/`. Route groups such as `app/login`, `app/register`, and `app/dashboard` provide the authentication and dashboard flows, while `app/files` handles file listing. API handlers live under `app/api/*/route.ts`; keep them thin and defer shared logic to `lib/r2.ts` or future modules in `lib/`. The Prisma client is generated into `app/generated/prisma`—never edit these files manually; update the schema in `prisma/schema.prisma` and rerun the generator. Static assets belong in `public/`, and database migrations are tracked in `prisma/migrations/`.

## Build, Test, and Development Commands

- `npm run dev` — start the Turbopack dev server on `http://localhost:3000`.
- `npm run build` — create an optimized production build.
- `npm run start` — serve the output of `npm run build`.
- `npm run lint` — run the Next.js ESLint profile.
- `npx prisma migrate dev --name <label>` — create and apply a Prisma migration.
- `npx prisma generate` — refresh the client in `app/generated/prisma`.

## Coding Style & Naming Conventions

Write client components in TypeScript/React functional style with two-space indentation and double quotes to match the existing codebase. Prefix client-side modules that use hooks with the `"use client"` directive. Favor descriptive English identifiers; keep environment variable names uppercase with underscores (e.g., `R2_ACCESS_KEY_ID`). Tailwind utility classes drive UI styling—compose utilities rather than inline styles, and keep DaisyUI components consistent with existing layouts.

## Testing Guidelines

Automated tests are not yet configured. When introducing new behavior, provide manual verification steps in the pull request and consider adding targeted tests using the Next.js Testing Library or Playwright if you introduce the tooling alongside documentation. For Prisma changes, include the resulting migration files and confirm `npm run lint` passes.

## Commit & Pull Request Guidelines

Follow Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) as seen in the git history, keep the subject line under 72 characters, and write the body in English. Each pull request should summarize the change, link related issues, detail environment variable updates, and attach screenshots or screen recordings for UI-affecting work. Always run `npm run lint` and relevant Prisma commands before requesting review.

## Security & Configuration Tips

Keep `.env` files out of version control and supply `DATABASE_URL`, `R2_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `R2_BUCKET_NAME` when running locally. If a proxy is required, set `HTTPS_PROXY` so `lib/r2.ts` can configure the AWS client. Never log secret values—use the existing console output only for non-sensitive connection metadata.
