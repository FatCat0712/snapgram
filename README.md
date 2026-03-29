# Snapgram

A social media web app built with React + TypeScript, powered by Appwrite for authentication, database, and file storage.

## What Is Implemented

- User authentication (sign up, sign in, sign out)
- Protected and public route layouts
- Create, edit, delete posts with image upload
- Like and save/unsave posts
- Infinite-scroll style post exploration
- Search posts by caption
- User discovery (all users and top creators)
- Profile pages and profile update flow
- Responsive UI with desktop sidebar and mobile bottombar
- Toast-based feedback and form validation

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query (React Query)
- Appwrite SDK
- Tailwind CSS
- shadcn/ui primitives
- React Hook Form + Zod

## App Routes

### Public

- `/sign-in`
- `/sign-up`

### Private

- `/` (Home)
- `/explore`
- `/saved`
- `/all-users`
- `/create-post`
- `/update-post/:id`
- `/post/:id`
- `/profile/:id/*`
- `/update-profile/:id`

## Project Structure

```txt
src/
  _auth/                 # auth layout + auth forms
  _root/                 # main app layout + private pages
  components/
    forms/               # feature forms (post form)
    shared/              # reusable app components
    ui/                  # UI primitives
  context/               # auth context provider
  lib/
    appwrite/            # Appwrite config + API functions
    react-query/         # query hooks + keys + provider
    validation/          # Zod schemas
  hooks/                 # custom hooks
  constants/             # navigation and shared constants
  types/                 # app-wide TypeScript types
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_APPWRITE_ENDPOINT=
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_PROJECT_NAME=
VITE_APPWRITE_DATABASE_ID=
VITE_APPWRITE_STORAGE_BUCKET_ID=
VITE_APPWRITE_SAVES_COLLECTION_ID=
VITE_APPWRITE_POST_COLLECTION_ID=
VITE_APPWRITE_USER_COLLECTION_ID=
```

These variables are consumed in `src/lib/appwrite/config.ts`.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure Appwrite

- Create an Appwrite project
- Create one database and required collections:
  - users
  - posts
  - saves
- Create one storage bucket for post images
- Set collection and bucket permissions for your auth model
- Copy IDs into `.env`

### 3. Run development server

```bash
npm run dev
```

Open the local URL printed by Vite in your browser.

## Scripts

- `npm run dev` - start development server
- `npm run build` - type-check and build production assets
- `npm run preview` - preview production build locally
- `npm run lint` - run ESLint

## Notes

- Data fetching and cache invalidation are handled through TanStack Query hooks in `src/lib/react-query/queriesAndMutations.ts`.
- Auth state is managed in `src/context/AuthContext.tsx`.
- Appwrite interaction logic is centralized in `src/lib/appwrite/api.ts`.

## Status

This project is in active development and already includes the core social features end to end.
