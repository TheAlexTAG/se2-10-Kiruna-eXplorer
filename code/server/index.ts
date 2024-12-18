import express from "express";
import { DocumentRoutes } from "./src/routers/documentRoutes";
import { UserController } from "./src/controllers/userController";
import { UserRoutes } from "./src/routers/userRoutes";
import { LinkDocumentRoutes } from "./src/routers/link_docRoutes";
import { ZoneRoutes } from "./src/routers/zoneRoutes";
import { testConnection } from "./src/db/db";

import morgan from "morgan"; // logging middleware
import cors from "cors";

const path = require("path");
const fs = require("fs");
const resourceDir = path.join(__dirname, "resources");

import passport from "passport";
const LocalStrategy = require("passport-local");

import session from "express-session"; // Create the session

// init express
const app: express.Application = express();
const port: number = 3001;

// enable cors
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// set-up the middlewares
app.use(morgan("dev"));
app.use(express.json()); // To automatically decode incoming json

if (!fs.existsSync(resourceDir)) {
  fs.mkdirSync(resourceDir);
}

/*** Passport ***/
const controller = new UserController();

// set up the "username and password" login strategy with a function to verify username and password
passport.use(
  new LocalStrategy(async function verify(
    username: string,
    password: string,
    callback: any
  ) {
    const user = await controller.getUser(username, password);
    if (!user) {
      return callback(null, false, {
        message: "Incorrect username or password",
      });
    }
    return callback(null, user);
  })
);

passport.serializeUser((user: any, callback: any) => {
  callback(null, user.id);
});

passport.deserializeUser(async function (id: number, callback: any) {
  try {
    const user = await controller.getUserById(id);
    callback(null, user);
  } catch (err) {
    callback(err, null);
  }
});

const isLoggedIn = (req: any, res: any, next: any) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authorized" });
};

app.use(
  session({
    secret: "team10-project",
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true },
  })
);

// init passport
app.use(passport.initialize());
app.use(passport.session());

/* ROUTES */
const userRote = new UserRoutes(app, passport, isLoggedIn);
userRote.initRoutes();

const documentRoutes = new DocumentRoutes(app);
documentRoutes.initRoutes();

const linkRoutes = new LinkDocumentRoutes(app);
linkRoutes.initRoutes();

const zoneRoutes = new ZoneRoutes(app);
zoneRoutes.initRoutes();

/*** Other express-related instructions ***/
// activate the server
const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

testConnection();

export { app, server };
