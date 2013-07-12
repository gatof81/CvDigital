var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var passport = require('passport');

// Define basic user schema
var UserSchema = new Schema({
     email: { type: String, unique: true }  
    , password: { type: String, required: true }
    , validated : {type: Boolean, default : false}
});

//authenticate user login    
UserSchema.static('authenticate', function(email, password, callback) {
  this.findOne({ email: email }, function(err, user) {
      if (err) { return callback(err); }
      if (!user) { console.log("wrong username"); return callback(null, false); }
      if(password==user.password && user.validated){
      return callback(null, user);
      }
      else{
      return callback(null, false);
      }
    });
});

module.exports = mongoose.model('User', UserSchema);