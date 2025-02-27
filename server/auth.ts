import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";

const scryptAsync = promisify(scrypt);

export function setupAuth(app: Express) {
  app.use(session({
    secret: 'gluco-smart-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      console.log('Attempting login for username:', username);
      const user = await storage.getUserByUsername(username);

      if (!user) {
        console.log('User not found');
        return done(null, false);
      }

      const [hash, salt] = user.password.split('.');
      const buf = await scryptAsync(password, salt, 64) as Buffer;

      if (buf.toString('hex') === hash) {
        console.log('Password verification successful');
        return done(null, user);
      }

      console.log('Password verification failed');
      return done(null, false);
    } catch (err) {
      console.error('Login error:', err);
      return done(err);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
}

export function setupAuthRoutes(app: Express) {
  app.post("/api/register", async (req, res) => {
    try {
      console.log('Registration attempt with data:', { ...req.body, password: '[REDACTED]' });

      // Basic validation
      if (!req.body.username || !req.body.password) {
        console.log('Missing username or password');
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Validate data against schema
      console.log('Validating registration data');
      const data = insertUserSchema.parse(req.body);

      // Check for existing user
      console.log('Checking for existing user');
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        console.log('Username already exists');
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      console.log('Hashing password');
      const salt = randomBytes(16).toString('hex');
      const buf = await scryptAsync(data.password, salt, 64) as Buffer;
      const hashedPassword = `${buf.toString('hex')}.${salt}`;

      // Create user
      console.log('Creating new user');
      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
        username: data.username.toLowerCase().trim()
      });

      console.log('User created successfully');

      // Auto login after registration
      req.login(user, (err) => {
        if (err) {
          console.error('Auto-login failed:', err);
          return res.status(500).json({ message: "Registration successful but login failed" });
        }

        return res.status(201).json({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          place: user.place
        });
      });

    } catch (error: any) {
      console.error('Registration error:', error);

      if (error.errors) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }

      return res.status(500).json({ 
        message: "Registration failed",
        error: error.message 
      });
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any) => {
      if (err) {
        console.error('Login error:', err);
        return res.status(500).json({ message: "Server error" });
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.login(user, (err) => {
        if (err) {
          console.error('Session creation error:', err);
          return res.status(500).json({ message: "Login failed" });
        }

        return res.json({
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          gender: user.gender,
          place: user.place
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = req.user as any;
    res.json({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      gender: user.gender,
      place: user.place
    });
  });
}