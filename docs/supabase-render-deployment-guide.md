# GlucoVigil Deployment Guide: Supabase + Render

This guide walks you through deploying the GlucoVigil application using Supabase for the database and Render for the web service.

## Step 1: Set up PostgreSQL Database on Supabase

### 1.1 Create a Supabase Account and Project

1. Go to [supabase.com](https://supabase.com) and sign up for an account
2. Once logged in, click "New Project"
3. Fill in the project details:
   - **Name**: GlucoVigil (or your preferred name)
   - **Database Password**: Create a strong password (save this securely)
   - **Region**: Choose the region closest to your target users
   - **Pricing Plan**: Start with the free tier

### 1.2 Get Your Database Connection String

1. After your project is created, navigate to:
   - Settings (gear icon in sidebar) > Database
2. Scroll down to "Connection String"
3. Select "URI" format 
4. Copy the connection string which looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with the database password you created

## Step 2: Deploy to Render

### 2.1 Prepare Your Repository

1. Make sure your code is in a GitHub repository
2. Ensure your code includes:
   - A valid package.json file with build and start scripts
   - The .env.example file (don't include your actual .env file)

### 2.2 Create a Render Account and Service

1. Go to [render.com](https://render.com) and sign up (using GitHub is easiest)
2. Once logged in, click "New +" button and select "Web Service"
3. Connect your GitHub repository:
   - Select the repository containing your GlucoVigil code
   - You may need to configure access to your repository

### 2.3 Configure the Web Service

1. Fill in the service details:
   - **Name**: glucovigil (or your preferred name)
   - **Region**: Choose the region closest to your users (ideally same as Supabase)
   - **Branch**: main (or your default branch)
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

2. Add environment variables by clicking "Advanced" > "Add Environment Variable":
   - `DATABASE_URL`: Paste your Supabase connection string
   - `SESSION_SECRET`: Generate a secure random string (you can use: `node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"`)
   - `NODE_ENV`: production
   - `PORT`: 10000

3. Configure any other necessary settings:
   - **Plan**: Start with free tier
   - **Auto-Deploy**: Enabled (recommended)

4. Click "Create Web Service"

## Step 3: Test Your Deployment

1. Wait for the initial deployment to complete (this can take several minutes)
2. Once deployed, Render will provide a URL to access your application (e.g., https://glucovigil.onrender.com)
3. Visit this URL and test all functionality:
   - User registration and login
   - Health data entry
   - Risk assessment and recommendations
   - Dashboard and visualizations

## Step 4: Database Migration

The first time your app connects to the Supabase database, it will automatically create all necessary tables based on your schema. You don't need to manually create tables or run migration scripts.

## Troubleshooting

### Database Connection Issues

- Verify the DATABASE_URL is correctly formatted
- Check that the password doesn't contain special characters that need escaping
- Ensure the Supabase project is active and the database is available

### Build Failures

- Check the build logs on Render for specific errors
- Common issues include:
  - Missing dependencies
  - Typescript compile errors
  - Environment variable issues

### Application Errors

- Use Render's logging feature to view server logs
- Check browser console for frontend errors
- Verify all environment variables are correctly set

## Performance Optimization

1. **Database Pooling**: Consider adding connection pooling to your database setup
2. **Caching**: Implement Redis caching if your app has high traffic
3. **Scaling**: Upgrade your Render plan if you need more performance

## Security Best Practices

1. **Keep Secrets Safe**: Never commit your .env file or secrets to git
2. **Rate Limiting**: Implement API rate limiting for security
3. **CORS Configuration**: Set proper CORS policies
4. **TLS/SSL**: Ensure all connections use HTTPS (Render provides this automatically)

## Next Steps After Deployment

1. **Custom Domain**: Configure a custom domain in Render settings
2. **Monitoring**: Set up uptime monitoring
3. **Backups**: Configure regular database backups in Supabase
4. **CI/CD**: Set up automated testing before deployment

## Further Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Render Documentation](https://render.com/docs)
- [Node.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)