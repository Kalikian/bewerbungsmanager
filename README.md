# Bewerbungsmanager (Job Application Manager) — Monorepo

Personal app to track job applications. Monorepo with **Frontend (Next.js/React)**, **Backend (TypeScript/Express/PostgreSQL)** and **shared Zod validation**. Backend uses **plain SQL in the model layer**, with **Drizzle Kit** only for schema & migrations (no ORM). API documented via **Swagger-UI**.

## Features

- **Auth (JWT)**: register & login, protected routes
- **Applications CRUD**: create, list, update, delete
- **Notes per application**: scoped to the user’s application
- **Attachments**: multipart upload, file metadata in DB, files saved to local storage (`UPLOAD_DIR`)
- **Validation with Zod**: shared schemas used by FE (react-hook-form) & BE (controllers)
- **Unified error handling**: typed errors + Express error middleware
- **Swagger-UI**: live API docs at `/api/docs`
- **Plain SQL**: parameterized queries in the model layer
- **ESM/TypeScript** across the stack, **ESLint/Prettier** for quality

## Tech Stack

- **Frontend:** Next.js (React), TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** Node.js (ESM), Express, TypeScript
- **DB:** PostgreSQL (hand-written SQL in models)
- **Validation:** Zod (shared package)
- **Docs:** Swagger-UI (OpenAPI 3)
- **Migrations:** Drizzle Kit (schema & SQL migrations only)
- **Package Manager:** Yarn Workspaces

## Monorepo Structure

apps/
frontend/ # Next.js app (default dev: http://localhost:3001
)
backend/ # Express API (default dev: http://localhost:3000
)
packages/
validation/ # Shared Zod schemas (e.g., userSchema, applicationSchema, helpers)


## Quickstart (Dev)

```bash
# Clone & install
git clone https://github.com/<your-user>/<your-repo>.git
cd <your-repo>
yarn install

# Set up env files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local

# Run backend (Port 3000)
yarn workspace @bewerbungsmanager/backend dev

# Run frontend (Port 3001) in a second terminal
yarn workspace @bewerbungsmanager/frontend dev

```

## Environment Variables 

```bash

backend (apps/backend/.env)
Runtime
NODE_ENV=development
PORT=3000

# PostgreSQL (PG_* recommended)
PGHOST=localhost
PGPORT=5432
PGDATABASE=bewerbungsmanager
PGUSER=postgres
PGPASSWORD=postgres

# Auth
JWT_SECRET=change-me
JWT_EXPIRES_IN=2h

# File uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS (for dev: frontend on 3001)
CORS_ORIGIN=http://localhost:3001

frontend (apps/frontend/.env.local)
Call backend directly (dev)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

Using .env.example
Provide .env.example files in each app directory to document required variables:

# backend
cp apps/backend/.env.example apps/backend/.env

# frontend
cp apps/frontend/.env.example apps/frontend/.env.local

.gitignore (root) should exclude env files:
# Environment Variables
.env*
apps/*/.env*
packages/*/.env*

Development
# Frontend
yarn workspace @bewerbungsmanager/frontend dev
yarn workspace @bewerbungsmanager/frontend build
yarn workspace @bewerbungsmanager/frontend start
yarn workspace @bewerbungsmanager/frontend lint

# Backend
yarn workspace @bewerbungsmanager/backend dev
yarn workspace @bewerbungsmanager/backend build
yarn workspace @bewerbungsmanager/backend start
yarn workspace @bewerbungsmanager/backend lint

Database / Migrations (Drizzle Kit)
# Make sure PostgreSQL is running (Linux/WSL example)
sudo service postgresql start

# Generate a new migration after schema changes
yarn workspace @bewerbungsmanager/backend db:generate

# Apply pending migrations
yarn workspace @bewerbungsmanager/backend db:migrate

API Documentation
Swagger-UI is served at: http://localhost:3000/api/docs (dev)
OpenAPI specs organized per resource (applications, notes, attachments, user)
