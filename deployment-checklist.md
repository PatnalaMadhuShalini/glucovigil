# GlucoVigil External Deployment Checklist

## Pre-Deployment Checklist

- [ ] Repository is up to date with all latest changes
- [ ] Project has been tested locally and works properly
- [ ] All required packages are listed in package.json
- [ ] No sensitive credentials are committed to the repository
- [ ] .gitignore includes .env and other sensitive files

## Step 1: Set up PostgreSQL on Supabase

- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create new project (name: glucovigil-db)
- [ ] Set secure database password
- [ ] Choose region closest to your target users
- [ ] Wait for database provisioning to complete
- [ ] Copy PostgreSQL connection string from Settings > Database > Connection String
- [ ] Test the connection string locally (optional)

## Step 2: Configure Environment

- [ ] Create a secure session secret:
  ```
  node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"
  ```
- [ ] Prepare environment variables to be used on Render:
  ```
  DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
  SESSION_SECRET=your_generated_session_secret
  NODE_ENV=production
  PORT=10000
  ```

## Step 3: Deploy on Render

- [ ] Create Render account at [render.com](https://render.com)
- [ ] Create new Web Service and connect GitHub repository
- [ ] Set service name: glucovigil
- [ ] Configure build command: `npm install && npm run build`
- [ ] Configure start command: `npm start`
- [ ] Add all environment variables from Step 2
- [ ] Set appropriate region (ideally same region as Supabase)
- [ ] Select plan type (Free tier for testing)
- [ ] Deploy the service
- [ ] Monitor the build and deployment logs for errors

## Step 4: Post-Deployment Verification

- [ ] Access your deployed application at the Render URL
- [ ] Verify the application loads correctly
- [ ] Test user registration and login
- [ ] Test health data submission
- [ ] Verify risk assessment works properly
- [ ] Check recommendations are displaying
- [ ] Test database operations by checking Supabase tables

## Step 5: Optimization and Security (Optional)

- [ ] Set up a custom domain in Render
- [ ] Configure SSL/TLS
- [ ] Set up database backups in Supabase
- [ ] Implement monitoring tools
- [ ] Review application logs for any errors
- [ ] Test performance under load

## Troubleshooting Guide

### Database Connection Issues
- Check if the DATABASE_URL format is correct
- Ensure password doesn't contain special characters that need escaping
- Verify IP allow-list settings in Supabase

### Build Failures
- Check for TypeScript errors
- Verify all dependencies are correctly listed
- Look for file path issues in import statements

### Runtime Errors
- Check Render logs for server-side errors
- Examine browser console for frontend issues
- Verify environment variables are being correctly loaded

## Production Readiness

- [ ] Application functions correctly in production mode
- [ ] Error handling for all API routes is implemented
- [ ] HTTP security headers are configured
- [ ] Rate limiting is implemented for sensitive endpoints
- [ ] Database queries are optimized for performance