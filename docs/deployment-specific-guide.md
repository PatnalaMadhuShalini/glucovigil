# GlucoVigil Deployment Guide for Supabase + Render

This guide provides specific steps to deploy the GlucoVigil application using Supabase for the database and Render for hosting.

## Prerequisites

- A Supabase account (https://supabase.com)
- A Render account (https://render.com)
- Your GlucoVigil codebase with all features implemented and tested locally

## Step 1: Prepare Your Supabase Database

1. **Log in to Supabase** and access your project dashboard
   - Current project: `db.yesumehizeuustcgahpx.supabase.co`

2. **Get your database connection strings**:
   - For development: `postgresql://postgres:Lenovo1234@db.yesumehizeuustcgahpx.supabase.co:5432/postgres`
   - For production: `postgresql://postgres.yesumehizeuustcgahpx:Lenovo1234@aws-0-ap-south-1.pooler.supabase.com:5432/postgres`

3. **Apply Database Schema**:
   - Run database migrations locally using your Supabase connection string:
   ```bash
   # First update your .env file with your Supabase connection
   DATABASE_URL=postgresql://postgres:Lenovo1234@db.yesumehizeuustcgahpx.supabase.co:5432/postgres
   
   # Then run the migration
   npm run db:push
   ```

4. **Configure Database Security**:
   - In Supabase dashboard, go to Authentication → Policies
   - Ensure Row Level Security (RLS) is enabled for sensitive tables
   - Add appropriate policies to protect user data

## Step 2: Prepare Your Application for Render

1. **Ensure your package.json has the correct scripts**:
   ```json
   "scripts": {
     "dev": "tsx server/index.ts",
     "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
     "start": "NODE_ENV=production node dist/index.js",
     "db:push": "drizzle-kit push"
   }
   ```

2. **Update Environment Variables**
   - Make a list of all environment variables your app needs:
     - DATABASE_URL
     - NODE_ENV
     - PORT
     - SESSION_SECRET
     - Any API keys or other secrets

3. **Add Health Check Endpoint**:
   - Ensure you have a health check endpoint at `/api/health`
   - This endpoint should return a 200 status code

## Step 3: Deploy to Render

1. **Create a new Web Service on Render**:
   - Go to the Render dashboard
   - Click "New" and select "Web Service"
   - Connect your GitHub repository

2. **Configure the Web Service**:
   - Name: `glucovigil`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: Choose the appropriate plan (e.g., Free for testing)
   - Auto-Deploy: Enable

3. **Add Environment Variables**:
   - Add all required environment variables:
     - `DATABASE_URL`: Use the production pooled connection string
     ```
     postgresql://postgres.yesumehizeuustcgahpx:Lenovo1234@aws-0-ap-south-1.pooler.supabase.com:5432/postgres
     ```
     - `NODE_ENV`: `production`
     - `PORT`: `3000`
     - `SESSION_SECRET`: Generate a secure random string

4. **Deploy Your Application**:
   - Click "Create Web Service"
   - Render will automatically build and deploy your application
   - Monitor the build logs for any errors

5. **Verify Deployment**:
   - Once deployment is complete, your app will be accessible at a `.onrender.com` URL
   - Test the application to ensure everything works as expected
   - Check database connectivity by performing operations that require database access

## Production Considerations

1. **Session Management**:
   - Your app uses `express-session` with `connect-pg-simple`
   - This stores sessions in PostgreSQL, which is perfect for production
   - No additional setup is needed as your database is already configured

2. **Database Connection Pooling**:
   - In production, use the pooled connection URL from Supabase
   - Update your DATABASE_URL environment variable in Render to use this URL

3. **SSL Verification**:
   - Supabase requires SSL connections
   - Your current setup with `@neondatabase/serverless` handles this properly

4. **Security Headers**:
   - Consider adding security headers to your Express app
   - Implement rate limiting for API endpoints

## Troubleshooting

1. **Database Connection Issues**:
   - Check for network restrictions in Supabase
   - Verify connection string format
   - Test connection with a simple query

2. **Build Failures**:
   - Check Render build logs
   - Ensure all dependencies are properly listed in package.json
   - Check for Node.js version compatibility

3. **Runtime Errors**:
   - Check application logs in the Render dashboard
   - Look for environment variable or configuration issues
   - Ensure database schema is properly migrated

## Scaling the Application

1. **Upgrade Database Plan**:
   - As your user base grows, consider upgrading your Supabase plan

2. **Upgrade Render Plan**:
   - Move from Free to Starter or higher plans for better performance

3. **Add Custom Domain**:
   - Configure a custom domain in the Render dashboard
   - Set up appropriate DNS records

## Next Steps

After successful deployment:

1. Set up monitoring and alerts
2. Configure regular database backups
3. Implement CI/CD pipeline for automated testing and deployment
4. Consider implementing a CDN for static assets