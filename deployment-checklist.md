# GlucoVigil External Deployment Checklist

## Step 1: Set up PostgreSQL on Supabase ✅

- [ ] Create Supabase account at [supabase.com](https://supabase.com)
- [ ] Create new project (name: glucovigil-db)
- [ ] Set secure database password
- [ ] Copy PostgreSQL connection string from Settings > Database > Connection String
- [ ] Update connection string for next steps

## Step 2: Deploy Backend on Render ✅

- [ ] Create Render account at [render.com](https://render.com)
- [ ] Create new Web Service and connect GitHub repository
- [ ] Configure build command: `npm install && npm run build`
- [ ] Configure start command: `npm start`
- [ ] Add environment variables:
  ```
  DATABASE_URL=your-supabase-connection-string
  SESSION_SECRET=udmWC/5/o7d6ZTi0p3rgtSnuObYsSViv7Zf7tPxIuWB4R73sp3+RN+8Z01cylZCsyraivhEAA/IRRtjg5sMPnA==
  NODE_ENV=production
  PORT=10000
  ```
- [ ] Deploy backend service
- [ ] Note the backend URL for next step (e.g., https://glucovigil-backend.onrender.com)

## Step 3: Deploy Frontend on Vercel ✅

The GlucoVigil app is a full-stack application where the frontend and backend are deployed together, so we'll skip this separate frontend deployment step.

## Step 4: Testing the Deployment ✅

- [ ] Access your deployed app on Render
- [ ] Create an account and log in
- [ ] Enter health data for a diabetes prediction
- [ ] Verify the prediction results
- [ ] Check Supabase to ensure data is being saved to the database

## Troubleshooting Common Issues ✅

- If the deployment fails, check build logs on Render
- Make sure environment variables are correctly set
- Check database connection by reviewing logs
- Ensure the PostgreSQL connection string is correct and accessible from Render

## Next Steps ✅

- Set up custom domain (optional)
- Configure automated backups in Supabase
- Set up monitoring and alerts