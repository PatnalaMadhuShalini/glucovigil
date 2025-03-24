# GlucoVigil Free Tier Deployment Guide

This guide provides instructions for deploying GlucoVigil on free tiers of Supabase and Render without using npm commands.

## Free Tiers Overview

### Supabase Free Tier
- 500MB database storage
- 1GB bandwidth
- No credit card required
- Database remains online continuously

### Render Free Tier
- 750 hours of runtime per month
- 512MB RAM
- Auto-sleeps after 15 minutes of inactivity
- No credit card required

## Step 1: Database Setup (Supabase)

1. **Create a Supabase Account**
   - Visit [supabase.com](https://supabase.com) and sign up with GitHub or email
   - No credit card required

2. **Create a New Project**
   - Click "New Project"
   - Set a project name (e.g., "glucovigil")
   - Create a secure database password and save it
   - Select your preferred region
   - Choose "Free Tier"
   - Click "Create New Project"

3. **Get Connection Details**
   - In your project dashboard, go to Settings → Database
   - Under "Connection String", select "URI"
   - Copy the connection string:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with your database password

4. **Configure Environment Variables**
   - Create or update your `.env` file:
     ```
     DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
     SESSION_SECRET=your_secure_random_string
     PORT=3000
     NODE_ENV=development
     ```

5. **Run Database Migration**
   - Use the manual command:
     ```bash
     node ./node_modules/.bin/drizzle-kit push
     ```
   - This creates all necessary database tables

## Step 2: Deployment (Render)

1. **Create a Render Account**
   - Visit [render.com](https://render.com) and sign up with GitHub
   - No credit card required

2. **Prepare Your Code for Deployment**
   - Build your application locally:
     ```bash
     # Build frontend
     node ./node_modules/.bin/vite build
     
     # Build backend
     node ./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
     ```

3. **Deploy as a Web Service**
   - On Render dashboard, click "New" → "Web Service"
   - Connect to your GitHub repository
     - OR use "Upload" option if you prefer manual deployment

4. **Configure Web Service**
   - **Manual GitHub Deployment:**
     - Name: "glucovigil" (or your preferred name)
     - Environment: "Node"
     - Region: Choose closest to your users
     - Branch: "main" (or your production branch)
     - Build Command: Leave empty if you already built locally, or:
       ```
       node ./node_modules/.bin/vite build && node ./node_modules/.bin/esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
       ```
     - Start Command: 
       ```
       node dist/index.js
       ```
     - Plan: "Free"

5. **Add Environment Variables**
   - `DATABASE_URL`: Your Supabase connection string
   - `NODE_ENV`: `production`
   - `PORT`: `3000`
   - `SESSION_SECRET`: Your secure random string

6. **Create Web Service**
   - Click "Create Web Service"
   - Render will deploy your application

## Step 3: Verify Deployment

1. **Access Your Application**
   - Once deployment is complete, Render provides a URL like:
     ```
     https://glucovigil.onrender.com
     ```
   - Visit this URL to test your application

2. **Initial Load Note**
   - First load after inactivity might take 30 seconds (free tier limitation)
   - The application will run normally after this initial load

## Optimizations for Free Tier

### Managing Database Size
- Supabase free tier has a 500MB limit
- Consider periodic cleanup of old data if needed

### Dealing with Render's Auto-Sleep
- Free tier services on Render sleep after 15 minutes of inactivity
- Options to consider:
  1. **Accept the sleep behavior** (best for development/testing)
     - First request after inactivity will take ~30 seconds to wake the service
  
  2. **Use a free uptime service** (if you need continuous availability)
     - Sign up for [UptimeRobot](https://uptimerobot.com) (free)
     - Add your Render URL as a HTTP(s) monitor
     - Set check interval to 5 minutes
     - This will prevent your app from sleeping but will use more of your monthly hours

### Monthly Hours Management
- Render free tier offers 750 hours per month
- If your service never sleeps, this is enough for ~31 days of continuous operation
- If you let it sleep during periods of inactivity, your hours will last longer

## Troubleshooting

1. **Database Connection Issues**
   - Verify your connection string is correct
   - Ensure your IP is not blocked in Supabase
   - Check for typos in environment variables

2. **Deployment Failures**
   - Check Render logs for specific error messages
   - Verify your build commands are correct
   - Ensure all dependencies are properly installed

3. **Slow Initial Response**
   - This is normal for free tier (app needs to wake up)
   - Subsequent requests will be fast until the app sleeps again

4. **Database Migration Failures**
   - Check if tables already exist
   - Verify database permissions