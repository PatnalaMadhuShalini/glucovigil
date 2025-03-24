# Manual Deployment Commands for GlucoVigil

This document provides the raw commands needed to deploy GlucoVigil without using npm scripts. Use these commands for local development or when deploying to a server without full Node.js support.

## Local Setup Commands

### 1. Install Dependencies
```bash
# Install dependencies directly without npm scripts
node ./node_modules/.bin/tsx --install
```

### 2. Start Development Server
```bash
# Start the development server manually
node ./node_modules/.bin/tsx server/index.ts
```

### 3. Run Database Migrations
```bash
# Run database migrations directly
node ./node_modules/.bin/drizzle-kit push
```

### 4. Build for Production
```bash
# Build frontend
node ./node_modules/.bin/vite build

# Build backend
node ./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

### 5. Start Production Server
```bash
# Set production environment and start server
export NODE_ENV=production && node dist/index.js
```

## Deploying to Free Tier Services

### 1. Database Setup (Supabase)

Before deploying, ensure your `.env` file contains:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
SESSION_SECRET=[YOUR_SECRET_KEY]
```

### 2. Deployment to Render

If you need to manually deploy to Render without their automatic GitHub integration:

1. Build your project locally:
```bash
# Build entire project
node ./node_modules/.bin/vite build
node ./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
```

2. Create a zip file of the following:
   - `dist/` directory (contains built backend and frontend)
   - `node_modules/` directory
   - `package.json`
   - Any other necessary files (e.g., static assets)

3. Upload this zip file to Render as a new Web Service

4. Set the start command on Render to:
```
node dist/index.js
```

5. Configure environment variables on Render:
   - `DATABASE_URL`
   - `NODE_ENV=production`
   - `PORT=3000`
   - `SESSION_SECRET`

## Free Tier Limitations

### Supabase Free Tier
- 500MB database storage
- 1GB bandwidth
- Database remains online continuously

### Render Free Tier
- 750 hours of runtime per month
- Auto-sleeps after 15 minutes of inactivity
- Auto-wakes on request (30-second delay for first request)

## Handling Free Tier Limitations

### Preventing Auto-Sleep (Optional)
Create a simple script to ping your application every 14 minutes:

```bash
# Simple bash script to ping your app
while true; do
  curl https://your-app-name.onrender.com/api/health
  sleep 840  # 14 minutes in seconds
done
```

You can run this script on any computer that stays online or use a free service like UptimeRobot.