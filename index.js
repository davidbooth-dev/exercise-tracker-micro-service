'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const router = express.Router();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
const cors = require('cors');
const cors_options = {
  optionSuccessStatus: 200, // some legacy browsers choke on 204
  origin: [
    "https://marsh-glazer.gomix.me",
    "https://narrow-plane.gomix.me",
    "https://www.freecodecamp.com"
  ]
}

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());
app.use(cors(cors_options));  

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, "/views/index.html"));
});

router.get("/file/*?", function (req, res, next) {
  if (req.params[0] === ".env") {
    return next({ status: 401, message: "ACCESS DENIED" });
  }
  fs.readFile(path.join(__dirname, req.params[0]), function (err, data) {
    if (err) {
      return next(err);
    }
    res.type("txt").send(data.toString());
  });
});

app.use("/api", cors(), router);

// new-user, users, add

// Add a new user
var new_user = require('./mongoose-module').newUser;

router.post('/exercise/:new-user', function(req, res, next){
  next();
}, function(req, res, next){
  new_user(req.body.username, function(err, data){
    if(err) return next(err);
    res.json({ id: data .id, username: data.username });
  })
})

// Get all users
var getAllUsers = require('./mongoose-module').getAllUsers;

// Get all users
router.get('/exercise/:users', function(req, res, next){
  next();
}, function(req, res, next){
  getAllUsers(function(err, data){
    if(err) return next(err);
    res.json({ data: data})
  })
})

// Get all users
var addExercise = require('./mongoose-module').addExercise;

router.post('/exercise/:add', function(req, res, next){
  next();
}, function(req, res, next){
  let id = req.body.userId;
  let desc = req.body.description;
  let dur = req.body.duration;
  let d = req.body.date;
  addExercise(id, desc, dur, d, function(err, data){
    if(err) return next(err)
    res.json({ data: data })
  })
})

// Get all users
var getLogs = require('./mongoose-module').getLogs;

router.get('/exercise/:log', function(req, res, next){
  next();
}, function(req, res, next){
  console.log('hefre')
      getLogs(id, function(err, data){
        if(err) { 
          return next(err);
        }
        res.json(data)
      })
    }
)

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage
console.log('error')
  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

// listen for requests :)
var server = app.listen(process.env.PORT || 3001, function () {
  console.log('Express Server Listening on localhost:port ' + server.address().port)
});