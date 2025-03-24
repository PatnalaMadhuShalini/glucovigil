// Example configuration file
// Copy this file to config.js and replace values with your actual configuration
module.exports = {
  // Database configuration
  database: {
    host: "your-database-host",
    port: 5432,
    username: "your-username",
    password: "your-password",
    database: "your-database-name",
    ssl: true
  },
  
  // API keys and external services
  apiKeys: {
    service1: "your-service1-api-key",
    service2: "your-service2-api-key"
  },
  
  // Server configuration
  server: {
    port: 5000,
    host: "0.0.0.0",
    sessionSecret: "your-session-secret",
    cookieMaxAge: 86400000 // 24 hours
  },
  
  // Email configuration
  email: {
    from: "noreply@example.com",
    smtp: {
      host: "smtp.example.com",
      port: 587,
      secure: false,
      auth: {
        user: "your-smtp-username",
        pass: "your-smtp-password"
      }
    }
  }
}