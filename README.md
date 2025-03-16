# GlucoVigil Health Analytics

GlucoVigil is an advanced AI-powered healthcare web application revolutionizing diabetes management through intelligent, personalized health analytics and comprehensive tracking capabilities.

## Tech Stack

- React frontend with TypeScript
- Node.js Express backend
- PostgreSQL database via Neon.tech
- Drizzle ORM for database operations
- Tailwind CSS for styling
- Framer Motion for animations
- AI/ML prediction models

## Key Features

- Intelligent health data tracking system
- Advanced authentication mechanisms
- Dynamic error handling and user guidance
- Personalized health recommendations
- Robust application deployment workflow
- Stress factor integration in risk assessment

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (or Neon.tech account)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd GlucoVigil
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Environment Configuration:
   - Copy `.env.example` to `.env`
   - Update the environment variables with your own values:
     ```
     DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
     SESSION_SECRET=your_strong_session_secret_here
     PORT=5000
     NODE_ENV=development
     ```

4. Start the development server:
   ```
   npm run dev
   ```
   
5. The application will be available at: `http://localhost:5000`

## External Deployment

### Supabase + Render Deployment Method

#### Step 1: Set up PostgreSQL on Supabase

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project:
   - Choose a project name (e.g., "glucovigil-db")
   - Set a secure database password (save it securely)
   - Select the region closest to your target audience
3. Get your connection string:
   - Go to Settings > Database > Connection String
   - Copy the PostgreSQL connection string
   - Replace the placeholders with your actual credentials:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
     ```

#### Step 2: Deploy Backend on Render

1. Create a Render account at [render.com](https://render.com)
2. Create a new Web Service:
   - Connect your GitHub repository or upload your project
   - Configure build settings:
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
3. Set environment variables:
   - `DATABASE_URL`: Your Supabase connection string
   - `SESSION_SECRET`: Your secure session secret
   - `NODE_ENV`: Set to `production`
   - `PORT`: Set to `10000` (Render automatically assigns a port, but your app will use this internal port)
4. Deploy your application by clicking "Create Web Service"

#### Step 3: Testing Your Deployment

1. Wait for the deployment to complete (can take a few minutes)
2. Access your application at the URL provided by Render
3. Test all functionality:
   - User registration and login
   - Health data submission
   - Risk assessment features
   - Dashboard and reporting

For a detailed deployment checklist, see [deployment-checklist.md](./deployment-checklist.md).

### Alternative Deployment Options

You can also deploy GlucoVigil using:

1. **Vercel**: Ideal for frontend deployment
2. **Railway**: One-click deployments with GitHub integration
3. **Heroku**: Platform as a service with easy scaling
4. **AWS Elastic Beanstalk**: For enterprise-grade deployments

For any deployment method, ensure you:

1. Set up your production database (PostgreSQL)
2. Configure environment variables correctly
3. Set `NODE_ENV` to `production`

## Database Management

The application uses Drizzle ORM to manage the database schema and migrations:

- Schema definitions are in `shared/schema.ts`
- Push schema changes to the database:
  ```
  npm run db:push
  ```

## License

All Rights Reserved