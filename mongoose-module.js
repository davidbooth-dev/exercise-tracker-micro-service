var mongoose = require("mongoose");

const mongodb = 'mongodb+srv://user2020:Lucile101@cluster0.8x0m4.mongodb.net/nodedb?retryWrites=true&w=majority';
mongoose
  .connect(process.env.MONGO_URI || mongodb, {
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
  duration: { type: String },
  date: { type: Date, default: Date.now }
})

const User = mongoose.model('Users', userSchema, 'Users');
const Exercise = mongoose.model('Exercise', exerciseSchema, 'Exercise');

const newUser = function (username, done) {
  if (!username) return done({ error: 'Invalid param name' });
  User.create({ username: username }, function (err, data) {
    if (err) { return done(err) }
    done(null, data);
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

const addExercise = async function (userId, descr, duration, date, done) {
  if (!userId || userId.length < 12) return done({ error: 'Invalid ID' });
  await User.findOne({ _id: userId })
    .then((data) => {
      let d = date !== null ? new Date(date) : new Date();
      let formatter = require('./functions.js').formatter;
      let dur = formatter(duration);
      let record = { idx: data._id, description: descr, duration: dur, date: d }
      Exercise.create(record, function (err, result) {

        if (err) {
          err.message = { error: 'Record already exists' }
          return done(err);
        }
        return done(null, result);
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
 
      let params = { idx: data._id, date: {} }
     
      if (from) params.date.$gte = new Date(from);
      if (to) params.date.$lte = new Date(to);
      
      Exercise.find(params)
        .limit(limit)
        .select({ _id: 0, __v: 0 })
        .exec(function (err, logs) {
          if (err) return done({ error: err });
          else return done(null, { user: { _id: data._id, username: data.username }, logs: logs });
        })
    })
    .catch((err) => done(err));
}

exports.exercise = Exercise;
exports.user = User;
exports.newUser = newUser;
exports.addExercise = addExercise;
exports.getAllUsers = getAllUsers;
exports.getUserLogs = getUserLogs;