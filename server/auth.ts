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
  // Basic session setup
  app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Simplified passport strategy
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false);
      }

      // Basic password check
      const [hash, salt] = user.password.split('.');
      const buf = await scryptAsync(password, salt, 64) as Buffer;
      if (hash !== buf.toString('hex')) {
        return done(null, false);
      }

      return done(null, user);
    } catch (err) {
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
      // Basic validation
      if (!req.body.username || !req.body.password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const data = insertUserSchema.parse(req.body);

      // Check for existing user
      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create password hash
      const salt = randomBytes(16).toString('hex');
      const buf = await scryptAsync(data.password, salt, 64) as Buffer;
      const hashedPassword = `${buf.toString('hex')}.${salt}`;

      // Create user
      const user = await storage.createUser({
        ...data,
        password: hashedPassword
      });

      // Auto login after registration
      req.login(user, (err) => {
        if (err) {
          console.error("Login error after registration:", err);
          return res.status(500).json({ message: "Registration successful but login failed" });
        }

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
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/login", (req, res, next) => {
    // Basic validation
    if (!req.body.username || !req.body.password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    passport.authenticate("local", (err: any, user: any) => {
      if (err) {
        console.error("Authentication error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      req.login(user, (err) => {
        if (err) {
          console.error("Login error:", err);
          return res.status(500).json({ message: "Login failed" });
        }

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