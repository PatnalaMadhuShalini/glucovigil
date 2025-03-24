# Vercel + Supabase Deployment Guide for GlucoVigil

This guide will walk you through deploying the GlucoVigil application using Vercel for hosting and Supabase for the PostgreSQL database. These services offer free tiers that don't require a credit card.

## 1. Supabase Setup (Database)

1. **Create a Supabase Account**:
   - Go to [supabase.com](https://supabase.com/) and sign up (GitHub authentication available)
   - No credit card required for the free tier

2. **Create a New Project**:
   - Click "New Project"
   - Choose a name (e.g., "glucovigil")
   - Set a secure database password (save it!)
   - Select the free tier and region closest to your users
   - Click "Create New Project"

3. **Get Your Database Connection String**:
   - In your project dashboard, go to "Settings" > "Database"
   - Look for "Connection String" and select "URI"
   - Copy the connection string (it will look like `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxx.supabase.co:5432/postgres`)
   - Replace `[YOUR-PASSWORD]` with your actual database password

4. **Database Schema Migration**:
   - After deployment, you'll need to run the migration command:
   - You can do this locally by setting the `DATABASE_URL` environment variable and running `npm run db:push`
   - Alternatively, you can use Vercel's CLI to run this command in the deployment environment

## 2. Vercel Setup (Hosting)

1. **Create a Vercel Account**:
   - Go to [vercel.com](https://vercel.com/) and sign up using GitHub
   - No credit card is required for the free tier

2. **Prepare Your Repository**:
   - Make sure your code is pushed to GitHub with the following files:
     - `package.json` with the build script already included
     - `vercel.json` as configured in this project

3. **Import Your Repository**:
   - Click "Add New" > "Project"
   - Connect to your GitHub account if not already connected
   - Select your GlucoVigil repository
   - Click "Import"

4. **Configure Project Settings**:
   - Framework Preset: Select "Other"
   - Root Directory: Leave as default (top level of your repo)
   - Build Command: `npm run build` (should automatically be detected)
   - Output Directory: `dist` (should automatically be detected)

5. **Set Environment Variables**:
   - In the project settings, add the following environment variables:
     - `DATABASE_URL`: Your Supabase connection string (from step 3 of Supabase setup)
     - `SESSION_SECRET`: A long, random string for securing sessions (e.g., generate with `openssl rand -base64 32`)
     - `PORT`: `3000`

6. **Deploy Your Application**:
   - Click "Deploy"
   - Vercel will build and deploy your application
   - After a few minutes, your application will be live at `[your-project-name].vercel.app`

## 3. Post-Deployment Steps

1. **Database Migration**:
   - Install Vercel CLI: `npm i -g vercel`
   - Login to Vercel: `vercel login`
   - Pull environment variables: `vercel env pull`
   - Run database migration: `npm run db:push`

2. **Verify Your Deployment**:
   - Visit your Vercel app URL
   - Create a test account
   - Verify that data is being stored in Supabase

3. **Set Up Custom Domain (Optional)**:
   - In Vercel, go to "Settings" > "Domains"
   - Add your custom domain
   - Follow the instructions to configure DNS

## 4. Free Tier Limitations

### Supabase Free Tier:
- 500MB database storage
- Limited database connections
- 2GB bandwidth per month
- No auto-scaling

### Vercel Free Tier:
- 100GB bandwidth per month
- 6,000 minutes of serverless function execution per month
- 100 deployments per day
- No enterprise features

## 5. Monitoring and Maintenance

1. **Vercel Dashboard**:
   - Monitor deployment status and performance
   - View function executions and bandwidth usage

2. **Supabase Dashboard**:
   - Monitor database size and performance
   - View SQL queries and logs
   - Set up database backups (available in paid plans)

## 6. Troubleshooting

### Common Issues:

1. **Database Connection Issues**:
   - Verify your `DATABASE_URL` is correct
   - Check Supabase firewall settings
   - Try connecting from your local environment first

2. **Build Failures**:
   - Check build logs in Vercel
   - Ensure all dependencies are included in package.json
   - Try building locally first

3. **Runtime Errors**:
   - Check function logs in Vercel
   - Common issues include missing environment variables

If you encounter any issues, refer to [Vercel's documentation](https://vercel.com/docs) or [Supabase's documentation](https://supabase.com/docs) for more detailed guidance.