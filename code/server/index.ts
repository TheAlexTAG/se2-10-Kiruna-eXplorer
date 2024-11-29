import express from "express";
import { testConnection } from "./src/db/db";
import { Role, User } from "./src/components/user";
import { UserRoutes } from "./src/routers/userRoutes";
import { UserController } from "./src/controllers/userController";
import { DocumentRoutes } from "./src/routers/documentRoutes";


const morgan = require("morgan"); // logging middleware
const cors = require("cors");

const path = require('path');
const fs = require('fs');
const resourceDir = path.join(__dirname,'src/resources');

const passport = require("passport");
const LocalStrategy = require("passport-local");

const session = require("express-session"); // Create the session

// init express
const app: express.Application = express();
const port: number = 3001;

// enable cors
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// set-up the middlewares
app.use(morgan("dev"));
app.use(express.json()); // To automatically decode incoming json

app.use('/resources', express.static(resourceDir));
  if (!fs.existsSync(resourceDir)) {
  fs.mkdirSync(resourceDir);
}

/*** Passport ***/

const controller = new UserController();


// set up the "username and password" login strategy with a function to verify username and password
passport.use(
  new LocalStrategy(async function verify(username: string,password: string,callback: any){
    const user = await controller.getUser(username, password);
    if (!user) {
      return callback(null, false, {message: "Incorrect username or password"});
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
  return res.status(401).json({error: "Not authorized"});
};

app.use(session({
  secret: "team10-project",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true }
}));

// init passport
app.use(passport.initialize());
app.use(passport.session());

/* ROUTES */
/*
new DocumentRoutes(app);
new LinkDocumentRoutes(app);
new ZoneRoutes(app);
*/

new UserRoutes(app, passport, isLoggedIn);
const documentRoutes = new DocumentRoutes(app);

documentRoutes.initRoutes();



/*** Other express-related instructions ***/
// activate the server
const server= app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

testConnection();
/*
  example query with mariaDB, be sure to always open the connection and close it in finally
  app.get("/api/zones", async function(req: any, res: any, next: any) {
    let conn;
    try {
      conn = await db.pool.getConnection();
      let result = await conn.query("SELECT * FROM zone");
      console.log(result);
      res.status(200).json(result);
    } catch (err) {
      res.status(400).json(err);
    } finally {
      if(conn) conn.release();
    }
  })
*/

export {app, server};