# GlucoVigil Deployment Architecture

## Supabase + Render Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Client Browser                                                 │
│                                                                 │
└───────────────┬─────────────────────────────────────────────────┘
                │
                ▼
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│  Render Web Service (https://glucovigil.onrender.com)         │
│  ┌─────────────────────────┐        ┌─────────────────────┐   │
│  │                         │        │                     │   │
│  │  Frontend               │        │  Backend            │   │
│  │  - React                │◄──────►│  - Node.js/Express  │   │
│  │  - TypeScript           │        │  - API Routes       │   │
│  │  - Tailwind CSS         │        │  - Authentication   │   │
│  │                         │        │                     │   │
│  └─────────────────────────┘        └──────────┬──────────┘   │
│                                               │              │
└───────────────────────────────────────────────┼──────────────┘
                                                │
                                                ▼
                              ┌────────────────────────────────┐
                              │                                │
                              │  Supabase PostgreSQL Database  │
                              │  - User Data                   │
                              │  - Health Records              │
                              │  - Predictions                 │
                              │  - Recommendations             │
                              │                                │
                              └────────────────────────────────┘
```

## Deployment Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Local Dev  │────►│  GitHub     │────►│  Render     │
│  Environment│     │  Repository │     │  Deployment │
│             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘
                                               │
                                               │
                                               ▼
                                        ┌─────────────┐
                                        │             │
                                        │  Supabase   │
                                        │  Database   │
                                        │             │
                                        └─────────────┘
```

## Database Connection

```
┌──────────────────┐                       ┌──────────────────┐
│                  │                       │                  │
│  GlucoVigil App  │  DATABASE_URL env var │  Supabase        │
│  on Render       │───────────────────────►  PostgreSQL DB   │
│                  │                       │                  │
└──────────────────┘                       └──────────────────┘
```

## Deployment Prerequisites

- GitHub repository with GlucoVigil code
- Supabase account
- Render account

## Key Environment Variables

- `DATABASE_URL`: PostgreSQL connection string from Supabase
- `SESSION_SECRET`: Secure random string for session management
- `NODE_ENV`: Set to "production" for deployment
- `PORT`: Internal port for the Render web service (usually 10000)

## Migration Process

The application will automatically create tables in the Supabase PostgreSQL database on first connection. No manual migrations are needed. The schema is defined in `shared/schema.ts` and applied using Drizzle ORM.