// Cross-platform development server starter for Windows
// Sets the environment variables properly for Windows
process.env.NODE_ENV = 'development';
// Use the tsx package to run TypeScript files
const { execSync } = require('child_process');
try {
  console.log('Starting GlucoVigil in development mode...');
  // Run the server using tsx
  execSync('npx tsx server/index.ts', { stdio: 'inherit' });
} catch (error) {
  console.error('Failed to start server:', error);
}