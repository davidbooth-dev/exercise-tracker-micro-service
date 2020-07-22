var mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

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
    username: { type: String , unique: true },
  })

  const exerciseSchema = new MongooseSchema({
    _id: { type: ObjectId },
    description: { type: String, unique: true },
    duration: { type: String },
    date: { type: Date }
  })

  const User = mongoose.model('Users', userSchema, 'Users');
  const Exercise = mongoose.model('Exercise', exerciseSchema, 'Exercise');
  
  const getNumberOfUsers = function(done){
    User.find(function(err, data){
      if(err) return done(err);
      return done(null, data);
    });
  }

  const getUserExercise = function(user_name, done){
    User.findOne({ name: user_name }, function(err, data){
      if(err) return done(err);
      else{
        Exercise.findMany({ _id: data._id}, function(err, records){
          if(err) return done(err);
          return done(err, records);
        })
      }
    });
  }

  const newUser = function(user_name, done){
    User.create({ username: user_name }, function(err, data){
      if(err){
        err.message = { error: 'User Already Exists'};
        return done(err);
      }
      done(null, data);
    })
  }

  const getUser = function(user_name, done){
    URL.find({ username: user_name }, function(err, record){
      if(err) return done(err);
      return done(null, record);
    })
  }

  const getAllUsers = function(done){
    User.find()
    .sort({ username: 1})
    .select({ _id: 1, username: 1}) 
    .exec(function(err, data){
      if(err) return done(err);
      return done(null, data);
    })
  }

  const addExercise = function(userId, descr, duration, date, done){
    if(!userId || userId.length < 12) return done({ error: 'Invalid ID'});
    User.findById({ _id: userId }, function(err, data){
      //console.log(err, data);
      if(err){
        err.message = { error: 'user not Found'};
        return done(err);
      } 
      else {
        let d = date !== null ? date : new Date();
        let formatter = require('./functions.js').formatter;
        let dur = formatter(duration);
        let record = { _id: data._id, description: descr, duration: dur, date: d }
        Exercise.create(record, function(err, result){
          if(err){
            err.message = { error: 'Record already exists'}
            return done(err);
          }
          return done(null, result);
        })  
      }
    })
  }

  const getUserLogs = function(userId, done){
    console.log(userId)
    User.findById({ _id: userId }, function(err, data){
      if(err){
        err.message = { error: 'user not Found'};
        return done(err);
      } 
      else {
        let logs = getLogs(data._id)
        if(logs === 'error'){
          err.message = { error: 'No Logs Found'}
          return done(err);
        } 
        // user found go ahead and find any logs
        let result = { user: data, logs: logs}
        done(null, result)
    }
  })
}
var getLogs = function(userId){
  Exercise.findById({ _id : userId}, function(err, data){
    if(err) return 'error';
    else return data;
  })
}
  exports.newUser = newUser;
  exports.addExercise = addExercise;
  exports.getAllUsers = getAllUsers;
  exports.getLogs = getUserLogs;