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

For deploying GlucoVigil to an external environment:

1. Set up your production database (PostgreSQL)

2. Configure environment variables on your deployment platform:
   - `DATABASE_URL`: Your production database connection string
   - `SESSION_SECRET`: A strong, unique session secret
   - `PORT`: The port your service will run on (often provided by the platform)
   - `NODE_ENV`: Set to `production`

3. Build the application:
   ```
   npm run build
   ```

4. Start the production server:
   ```
   npm start
   ```

## Database Management

The application uses Drizzle ORM to manage the database schema and migrations:

- Schema definitions are in `shared/schema.ts`
- Push schema changes to the database:
  ```
  npm run db:push
  ```

## License

All Rights Reserved