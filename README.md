# Mission Control Dashboard

AI assistant activity monitoring, scheduling, and search platform.

## Features

1. **Activity Feed** - Complete history of every action performed
2. **Calendar View** - Weekly view of all scheduled tasks
3. **Global Search** - Search across memories, documents, and activities

## Tech Stack

- NextJS 15 (App Router)
- Convex (Database + Real-time sync)
- Tailwind CSS
- TypeScript

## Setup

```bash
npm install
npx convex dev  # Start Convex dev server
npm run dev     # Start NextJS dev server
```

## Convex Setup

1. Create Convex account at convex.dev
2. Run `npx convex dev` to initialize
3. Deploy schema: `npx convex push`

## Project Structure

```
src/
  app/              # NextJS app routes
    page.tsx        # Main dashboard
    activities/     # Activity feed view
    calendar/       # Calendar view
    search/         # Global search
  components/       # React components
  lib/             # Utilities
  types/           # TypeScript types
convex/
  schema.ts        # Database schema
  activities.ts    # Convex functions
```
