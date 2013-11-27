var db = require('../accessDB');
var moment = require('moment');
module.exports = {
    // app.post('/register'...)
    register: function(request, response) {
      db.saveUser({
        name : request.body.newName
        , email : request.body.newEmail
        , password : request.body.newPassword
      }, function(err,docs) {

        if(err){
          //response redirect to user already exists?
          response.send(err)
        }
        else{
          db.User.findOne({email:request.body.newEmail}, function(err,user){

            var username = "gatof81";
            var key = "136048nm";

            var SendGrid = require('sendgrid').SendGrid;
            var sendgrid = new SendGrid(username, key);

            var addText = 'Hello,'+'<br /><br />'+'Thank you so much for registering with CvDigital.';
            addText+='<br />'+'To activate your account, please <a href="http://cvdigital.herokuapp.com/confirm/'+user._id+'">CLICK HERE</a>';
            addText+='<br />'+'<br />'+'The CvDigital Team';


            sendgrid.send({
              to: request.body.newEmail,
              from: 'info@cvdigital.com',
              subject: 'Activate your CvDigital account',
              html: addText

            }, function(success, message) {
              if (!success) {
                response.send("fail");
              }
              else{
                response.send("success");
              }
            });

          });
        }
      });
},


confirmAccount: function(request,response){

  console.log("****************************");
  db.User.findOne({_id:request.params.userid}, function(err,user){
    if(user) {
      user.validated=true;
      user.save();
      response.render('site/confirmation.html');
    }else {
      response.send("User does not exists.");
    }
  });
},

forgotPW : function(request,response){

  var user ="gatof81";
  var key= "136048nm";

  var SendGrid = require('sendgrid').SendGrid;
  var sendgrid = new SendGrid(user, key);

  db.User.findOne({email:request.body.email}, function(err,user){
    if(user) {
      sendgrid.send({
        to: user.email,
        from: 'admin@cvfigital.com',
        subject: 'Forgotten Password',
        html: 'Hello <br /><br /> Your password is '+ user.password +'. <br />Please login at <a href="http://clefnetwork.com">ClefNetwork</a> using this email address and password.<br /><br />Thanks<br />ClefNetwork'

      }, function(success, message) {
        if (!success) {
          console.log(message);
          response.redirect('/');
        }
        else{

          response.redirect('/');
        }

      }); 
    }
    else {
      response.redirect('/');
    }

  });
},
logout: function(request, response){
  request.logout();
  response.redirect('/');
},
changePW : function(request,response){
  db.User.findOne({email : request.user.email}).run(function(err, user){
    user.password=request.body.password;       
    user.save(function() {
     response.send("Password succesfully changed");
   });   
  });
},
deleteAccount : function(request,response){

  db.User.remove({email : request.user.email}, function(err) {
    if (!err) {
      if(request.user.role=='S')
        db.Student.remove({email : request.user.email}, function(err) {         
          request.logout();
          response.redirect('/');
        });
      else
       db.Teacher.remove({email : request.user.email}, function(err) {
        request.logout();
        response.redirect('/');
      });
   }
   else {      
   }
 });


},    
ajaxCheckPassword : function(request,response){
  db.User.findOne({email : request.user.email}).run(function(err, user){
    if(user.password==request.body.old_password)
      response.send("true");
    else
      response.send("false");     

  });
}
};

