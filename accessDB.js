// Module dependencies
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// dependencies for authentication
var passport = require('passport')
, LocalStrategy = require('passport-local').Strategy;


var User = require('./models/user'); 

passport.use(new LocalStrategy({
  usernameField: 'email'
},
function(email, password, done) {
  User.authenticate(email, password, function(err, user) {
    if (err || !user) { return done(null, false, { message: 'Invalid password' }); }
    return done(null, user);
  });
}
));

// serialize user on login
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// deserialize user on logout
passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// connect to database
module.exports = {

  //include all Models
  // you can access models with db.User or db.ModelName
  User : User,

  // DB Helper functions
  // initialize DB
  startup: function(dbToUse) {
    mongoose.connect(dbToUse);
    // Check connection to mongoDB
    mongoose.connection.on('open', function() {
      console.log('We have connected to mongodb');
    }); 

  },

  // save a user
  saveUser: function(userInfo, callback) {
    //console.log(userInfo['fname']);
    var newUser = new User ({
      name : userInfo.name, 
      email: userInfo.email, 
      password: userInfo.password
    });
    newUser.save(function(err) {
      callback(err, userInfo);
    });
  },


  // disconnect from database
  closeDB: function() {
    mongoose.disconnect();
  },

  // get all the users
  getUsers: function(callback) {
    User.find({}, ['name', '_id'], function(err, users) {
      callback(null, users);
    });
  },

}