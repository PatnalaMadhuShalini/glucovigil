require('dotenv').config();
const { execSync } = require('child_process');

console.log('Running database migrations...');

try {
  // Run the Drizzle migration using npm script
  execSync('npm run db:push', { stdio: 'inherit' });
  console.log('Database migrations completed successfully!');
} catch (error) {
  console.error('Error running migrations:', error);
  process.exit(1);
}