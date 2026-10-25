# Client Portal

Private portal for clients of a web design studio. Clients can fill in a project brief and access project materials and documents in one place. An admin panel lets the studio add clients and manage their projects.

## Features

- Client dashboard with sections for materials, documents and the project brief
- Three-step onboarding wizard: project brief, contract and payment
- Admin panel for creating clients and updating project status
- Role-based access (client and admin)
- Email and password authentication
- Responsive layout for mobile and desktop

## Tech stack

- React 18, TypeScript, Vite
- Tailwind CSS, Radix UI components, Framer Motion
- React Router, TanStack Query
- Supabase (PostgreSQL, authentication, storage)
- Vitest for testing, ESLint for linting

## Getting started

Requirements: Node.js 18 or newer and a Supabase project.

```bash
npm install
npm run dev
```

The development server runs on http://localhost:5173.

Create a `.env` file with the following variables:

```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Database migrations are located in `supabase/migrations`.

## Project structure

```
src/
  app/                 application shell: providers and routes
  components/
    layout/            nav link
    ui/                shared UI primitives
  features/
    auth/              auth context and login page
    client/            client dashboard and onboarding wizard
    admin/             admin page
    site/              not-found page
  hooks/               shared hooks
  lib/
    supabase/          Supabase client
    utils.ts           helpers
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
