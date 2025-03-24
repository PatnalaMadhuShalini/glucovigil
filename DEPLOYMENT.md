# GlucoVigil Free Deployment Guide

This project is configured for free deployment on Vercel + Supabase with **no credit card required**.

## Quick Deployment Steps

### 1. Database: Supabase (Free Tier)
1. Sign up at [supabase.com](https://supabase.com) (GitHub login available)
2. Create a new project (free tier)
3. Get your database connection string from Settings → Database → Connection String (URI)
4. Save this for the Vercel setup

### 2. Hosting: Vercel (Free Tier)
1. Sign up at [vercel.com](https://vercel.com) (GitHub login available)
2. Import your repository
3. Configure build settings:
   - Framework: Other
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables:
   - `DATABASE_URL`: Your Supabase connection string
   - `SESSION_SECRET`: A random secure string
   - `PORT`: `3000`
5. Click "Deploy"

### 3. Run Database Migrations
```bash
# Install Vercel CLI
npm i -g vercel

# Log in to Vercel
vercel login

# Link to your project
vercel link

# Run database migration
vercel env pull
npm run db:push
```

## Files Created/Modified for Deployment

1. `vercel.json` - Configuration for Vercel deployment
2. `.env.vercel` - Template for environment variables on Vercel
3. `docs/vercel-supabase-deployment-guide.md` - Detailed step-by-step instructions

## Free Tier Benefits

- **No credit card required** for either service
- Vercel: No auto-sleep, 100GB bandwidth/month
- Supabase: 500MB database, 2GB bandwidth/month
- Includes custom domain support (just add your domain in Vercel)

## Need More Help?

See `docs/vercel-supabase-deployment-guide.md` for detailed instructions including screenshots and troubleshooting tips.