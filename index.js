"use strict";

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const fs = require("fs");

const app = express();
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
const cors = require("cors");
const { newUser } = require("./mongoose-module");
const cors_options = {
  optionSuccessStatus: 200, // some legacy browsers choke on 204
  origin: [
    "https://marsh-glazer.gomix.me",
    "https://narrow-plane.gomix.me",
    "https://www.freecodecamp.com"
  ]
};

app.use(cors(cors_options));

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "/views/index.html"));
});

router.get("/file/*?", function(req, res, next) {
  if (req.params[0] === ".env") {
    return next({ status: 401, message: "ACCESS DENIED" });
  }
  fs.readFile(path.join(__dirname, req.params[0]), function(err, data) {
    if (err) {
      return next(err);
    }
    res.type("txt").send(data.toString());
  });
});

app.use("/api", cors(), router);

// new-user, users, add

// Add a new user
var new_user = require("./mongoose-module").newUser;

router.post(
  "/exercise/new-user",
  function(req, res, next) {
    console.log("newUser");
    next();
  },
  function(req, res, next) {
    console.log(req.query);
    new_user(req.body.username, function(err, data) {
      if (err) {
        if ((err.code = 11000)) err.message = { error: "User Already Exists" };
        return next(err);
      }
      res.json(data);
    });
  }
);

// Get all users
var getAllUsers = require("./mongoose-module").getAllUsers;

// Get all users
router.get(
  "/exercise/users",
  function(req, res, next) {
    console.log("getAllUsers");
    next();
  },
  function(req, res, next) {
    getAllUsers(function(err, data) {
      if (err) {
        return next(err);
      }
      res.json(data);
    });
  }
);

// Get all user logs
var getUserLogs = require("./mongoose-module").getUserLogs;

router.get(
  "/exercise/log?:userId/:from?/:to?/:limit?",
  function(req, res, next) {
    console.log("getuserLogs");
    next();
  },
  function(req, res, next) {
    let id = req.query.userId;
    let from = req.query.from;
    let to = req.query.to;
    let limit = req.query.limit ? parseInt(req.query.limit) : 0;
    console.log(req.query);
    getUserLogs(id, from, to, limit, function(err, data) {
      console.log(err, data)
      if (err) {
        return next(err);
      }
      res.json(data);
    });
  }
);

//var exercise = require("./mongoose-module").exercise;
var addExercise = require("./mongoose-module").addExercise;

router.post(
  "/exercise/add",
  function(req, res, next) {
    console.log("addExercise");
    next();
  },
  function(req, res, next) {
    let id = req.body.userId;
    let desc = req.body.description;
    let dur = req.body.duration;
    let d = req.body.date;
    addExercise(id, desc, dur, d, function(err, data) {
      if (err) {
        return next(err);
      }
      res.json(data);
      res.end();
    });
  }
);

// Not found middleware
app.use((req, res, next) => {
  console.log("unmatched");
  return next({ status: 404, message: "not found" });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;
  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});

/*let ids = ['5f1c4bbf494b2240941aa8d7', '5f1c4bbf494b2240941aa8d8'];

let exercises = [
  { description: 'First Exercise', duration: 230, date: '2020/07/23' },
  { description: 'Second Exercise', duration: 120, date: '2020/07/24' },
  { description: 'Third Exercise', duration: 180, date: '2020/07/25' }
]
function getId(err, data) {
  if (err) console.log('getId: ', err);

  ids.push(data.id);
}
function print(err, data) {
  if (err) console.log('print: ', err);
  console.log('getAllusers: ', data);
}
run();
// run tests
function run() {*/

// Create some test data
/*new_user('David Booth', function(err, data){
    //getId(err, data);
  })
  new_user('Robert Williams', function(err, data){
    //getId(err, data);
  })*/

// Get all users
/*getAllUsers(function(err, data){
    print(err, data);
  })*/

// Add exercises for each user
/*for (let i = 0; i < 2; i++) {
    exercises.forEach((data) => {
      addExercise(ids[i], data.description, data.duration, data.date, function(err, data){
        console.log(data);
      })
    })
  }*/
// get the user logs
/*getUserLogs(ids[0], '2020/07/23', '2020/07/24', 0, function(err, data){
    console.log('getUserLogs: ', data);
  })*/
//}

/*let deleteUsers = require("./mongoose-module").deleteUsers;

deleteUsers();

let deleteExercises = require("./mongoose-module").deleteExercises;

deleteExercises();*/

// listen for requests :)
var server = app.listen(process.env.PORT || 3001, function() {
  console.log(
    "Express Server Listening on localhost:port " + server.address().port
  );
});
