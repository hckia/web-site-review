'use strict';
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const path = require('path');

// Here we use destructuring assignment with renaming so the two variables
// called router (from ./users and ./auth) have different names
// For example:
// const actorSurnames = { james: "Stewart", robert: "De Niro" };
// const { james: jimmy, robert: bobby } = actorSurnames;
// console.log(jimmy); // Stewart - the variable name is jimmy, not james
// console.log(bobby); // De Niro - the variable name is bobby, not robert
const { router: usersRouter } = require('./users');
const { router: sitesRouter } = require('./sites');
const { router: authRouter, localStrategy, jwtStrategy } = require('./auth');

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require('./config');

const app = express();

// Logging
app.use(morgan('common'));

//path for static files
app.use(express.static(path.join(__dirname, 'public')));

//enable ejs  
app.set("view engine", "ejs");

// CORS
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
  if (req.method === 'OPTIONS') {
    return res.send(204);
  }
  next();
});

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use('/api/users/', usersRouter);
app.use('/api/auth/', authRouter);
app.use('/api/sites/', sitesRouter);

const jwtAuth = passport.authenticate('jwt', { session: false });

//need to implement this... https://stackoverflow.com/questions/824349/modify-the-url-without-reloading-the-page?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
app.get("/", function(req,res){
  res.render("welcome");
})

app.get("/signup", function(req, res){
  res.render("signup");
});

//this won't be necessary soon.
app.get("/create",jwtAuth,function(req, res) {
  res.render("create");
})
//may not need this...
app.get("/dashboard", function(req,res) {
  res.render("dashboard");
})

app.get("/login", function(req, res){
  res.render("login");
})

app.get("/logout", function (req,res){
  req.logout();
  //redirects to login after changing a few settings
  res.render("logout");
})

app.get("/test", function(req,res){
  res.render("test");
})

app.get("/style.css")

app.get("/secret", function(req, res){
  res.render("secret");
});

// A protected endpoint which needs a valid JWT to access it
app.get('/api/protected', jwtAuth, (req, res) => {
  return res.json({
    data: 'rosebud'
  });
});

app.use('*', (req, res) => {
  return res.status(404).json({ message: 'Not Found' });
});

// Referenced by both runServer and closeServer. closeServer
// assumes runServer has run and set `server` to a server object
let server;

function runServer(databaseUrl, port = PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
