Kanban Board

A Trello-style kanban board built with Next.js, GraphQL, and Nhost.

Features

Email/password authentication with Nhost

Create, edit, delete, and reorder boards

Create, delete, and reorder columns (drag & drop)

Create and delete cards inside columns

Realtime updates using GraphQL subscriptions

Protected routes (unauthenticated users are redirected to login)

Deployed on Vercel

Tech Stack

Next.js (App Router)

TypeScript

Apollo Client (GraphQL)

Nhost (Auth + Hasura)

@hello-pangea/dnd for drag and drop

Tailwind CSS

Getting Started (Local)
npm install
npm run dev


Create a .env.local file with your Nhost environment variables.

Deployment

The app is deployed on Vercel and builds using npm run build.
