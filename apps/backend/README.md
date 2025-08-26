# Bewerbungsmanager (Job Application Manager) — Backend

Backend service for personal application tracking: **Node.js (TypeScript/ESM)**, **Express**, **PostgreSQL** with **plain SQL in the model layer**, and **Drizzle Kit exclusively for schema & migrations** (no ORM). Input validation via **Zod** and API documentation via **Swagger-UI**.

## Features

- **JWT authentication**: register & login, Bearer token for protected routes
- **Applications CRUD**: create, list, update, delete job applications
- **Notes per application**: list & create notes scoped to the user’s application
- **Attachments**: multipart upload endpoint, file metadata stored in DB, files saved to local storage (`UPLOAD_DIR`)
- **Validation with Zod**: schemas for params, query, and request bodies
- **Unified error handling**: typed HTTP errors + Express error middleware
- **Swagger-UI** available at `/api/docs`
- **Plain SQL access**: parameterized queries in the model layer (no ORM)
- **Drizzle Kit migrations**: schema defined in SQL/TS, migrations generated & applied as SQL
- **Config via `.env`**: database URL, JWT secret, upload dir, CORS origin, etc.

## Tech Stack

- **Runtime:** Node.js ≥ 20 (ESM)
- **Language:** TypeScript
- **Web:** Express
- **DB:** PostgreSQL (hand-written SQL in models)
- **Validation:** Zod
- **API Docs:** Swagger-UI (OpenAPI 3)
- **Migrations:** Drizzle Kit (schema & SQL migrations only)
- **Lint/Format:** ESLint + Prettier
- **Package Manager:** Yarn

## Quickstart (minimal)

````bash
# Clone & install
git clone https://github.com/<your-user>/<your-repo>.git
cd <your-repo> && yarn install

# Configure environment
cp .env.example .env   # fill DATABASE_URL, JWT_SECRET, etc.

# Migrate DB & run
yarn db:migrate
yarn dev
# API:     http://localhost:3000
# Swagger: http://localhost:3000/api/docs

flowchart LR
  Client -->|HTTP/JSON + Bearer JWT| API[Express Router]
  subgraph Server
    API --> MW[Middleware\n(auth, Zod validation, error handler)]
    MW --> C[Controllers]
    C --> M[Model layer\n(parameterized SQL)]
    M --> DB[(PostgreSQL)]
    C --> FS[(File storage\nUPLOAD_DIR)]
    API --> DOCS[Swagger-UI\n(/api/docs)]
  end

# Runtime
NODE_ENV=development
PORT=3000

# PostgreSQL
# Format: postgres://USER:PASSWORD@HOST:PORT/DBNAME
DATABASE_URL=postgres://postgres:postgres@localhost:5432/bewerbungsmanager

# Authentication
JWT_SECRET=change-me
JWT_EXPIRES_IN=2h

# File uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS (frontend origin)
CORS_ORIGIN=http://localhost:5173

### Using `.env.example`

This repository includes a `.env.example`. Duplicate it and fill in your own values:

```bash
cp .env.example .env
# Windows (PowerShell):
copy .env.example .env


# Development
yarn dev           # start with tsx watch (src/server.ts)
yarn build         # compile TypeScript to /dist
yarn start         # run compiled app from dist/server.js
yarn lint          # run ESLint on src/**/*.ts

# Database / migrations (Drizzle Kit used only for schema & SQL migrations)
yarn db            # start PostgreSQL service (Linux/WSL: sudo service postgresql start)
yarn db:generate   # build + generate a new migration after schema changes
yarn db:migrate    # apply pending migrations

# Convenience
yarn all           # run "yarn db" and "yarn dev" in parallel (requires 'concurrently')


src/
  app.ts
  errors.ts
  server.ts
  swagger.ts
  controllers/
    application/
      applicationController.ts
      noteController.ts
      attachmentController.ts
    user/
      userController.ts
  db/
    schema/
      application.ts
      attachment.ts
      index.ts
      note.ts
      timeline.ts
      user.ts
    db.ts
  middleware/
    authenticateToken.ts
    errorHandler.ts
    upload.ts
  models/
    application/
      applicationModel.ts
      noteModel.ts
      attachmentModel.ts
    user/
      userModel.ts
  routes/
    application/
      applicationRoutes.ts
      attachmentRoutes.ts
      noteRoutes.ts
    user/
      userRoutes.ts
  swagger/
    application/
      application.yaml
      attachment.yaml
      note.yaml
    user/
      user.yaml
  types/
    application/
      application.ts
      attachment.ts
      note.ts
    express/
      index.d.ts
    user/
      user.ts
  utils/
    fileSniff.ts
    hash.ts
    mappers.ts
    storage.ts
  validation/
    application/
      applicationSchema.ts
      attachmentSchema.ts
      noteSchema.ts
    helpers/
      zodHelpers.ts
    user/
      userSchema.ts
  uploads/              # local storage (gitignored)
drizzle/



```
