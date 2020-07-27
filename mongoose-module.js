var mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .then(() => {
    console.log("Connected to Mongoose ");
  })
  .catch(err => {
    console.log("Mongoose Error: ", err);
  });

const MongooseSchema = mongoose.Schema;

const userSchema = new MongooseSchema({
  username: { type: String, unique: true },
})

const exerciseSchema = new MongooseSchema({
  idx: { type: mongoose.Schema.Types.ObjectId },
  description: { type: String },
  duration: { type: Number },
  date: { type: Date, default: Date.now }
})

const User = mongoose.model('Users', userSchema, 'Users');
const Exercise = mongoose.model('Exercise', exerciseSchema, 'Exercise');

const newUser = function (username, done) {
  if (!username) return done({ error: 'Invalid param name' });
  User.create({ username: username }, function (err, data) {
    if (err) { return done(err) }
    done(null, { _id: data._id, username: data.username });
  })
}

const getUser = function (user_name, done) {
  URL.findOne({ username: user_name }, function (err, record) {
    if (err) return done(err);
    return done(null, record);
  })
}

const getAllUsers = function (done) {
  User.find()
    .sort({ username: 1 })
    .select({ _id: 1, username: 1 })
    .exec(function (err, data) {
      if (err) return done(err);
      return done(null, data);
    })
}

const addExercise = async function (userId, descr, dur, date, done) {
  if (!userId || userId.length < 12) return done({ error: 'Invalid ID' });
  await User.findOne({ _id: userId })
    .then((data) => {
      //let d = date !== null new Date(date);
      //let formatter = require('./functions.js').formatter;
      //let dur = formatter(duration);
      let record;
      if(date){
        record = { idx: data._id, description: descr, duration: dur, date: date }
      }
      else{
        record = { idx: data._id, description: descr, duration: dur }
      }
      Exercise.create(record, function (err, result) {

        if (err) {
          err.message = { error: 'Record already exists' }
          return done(err);
        }     
        
        return done(null, { 
          _id: data._id, 
          username: data.username, 
          description: result.description, 
          duration: result.duration, 
          date: result.date.toDateString()
        });
      })
    })
    .catch((err) => {
      err.message = { error: 'user not Found' };
      return done(err);
    })
}

const getUserLogs = function getUserLogs(userId, from, to, limit, done) {
  if (!userId) return done({ error: 'Invalid UserId' });
  if (!done) return done({ error: 'Missing Callback' });
  User.findOne({ _id: userId })
    .then((data) => {
 
      let params = { idx: data._id }
     
      if(from && to){
          params.date = {}
          if (from) params.date.$gte = new Date(from);
          if (to) params.date.$lte = new Date(to);
      }
    
      Exercise.find(params)
        .limit(limit)
        .select({ _id: 0, __v: 0 })
        .exec(function (err, logs) {
          if (err) return done({ error: err });
          else return done(null, { _id: data._id, username: data.username, count: logs.length, log: logs,  });
        })
    })
    .catch((err) => done(err));
}

let deleteUsers = function(){
  User.deleteMany(function(err, result){
    if(err) console.log('Error Deleting Records');
    console.log(result.deletedCount, ' User Records Deleted');
  })
}

let deleteExercises = function(){
  Exercise.deleteMany(function(err, result){
    if(err) console.log('Error Deleting Records');
    console.log(result.deletedCount, ' Exercise Records Deleted');
  })
}

exports.exercise = Exercise;
exports.user = User;
exports.newUser = newUser;
exports.addExercise = addExercise;
exports.getAllUsers = getAllUsers;
exports.getUserLogs = getUserLogs;
exports.deleteUsers = deleteUsers;
exports.deleteExercises = deleteExercises;