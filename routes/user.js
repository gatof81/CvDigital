var db = require('../accessDB');
var moment = require('moment');
module.exports = {
    // app.post('/register'...)
    register: function(request, response) {
      db.saveUser({
        name : request.body.newName
        , email : request.body.newEmail
        , password : request.body.newPassword
        , instrument : request.body.instrument.toLowerCase()
        , role : request.body.role
      }, function(err,docs) {

        if(err){
          response.send(err)
        }
        else{
          db.User.findOne({email:request.body.newEmail}, function(err,user){

            var username =process.env.SENDGRID_USERNAME;
            var key= process.env.SENDGRID_PASSWORD;

            var SendGrid = require('sendgrid').SendGrid;
            var sendgrid = new SendGrid(username, key);

            var addText = 'Hello,'+'<br /><br />'+'Thank you so much for registering with ClefNetwork.';
            addText+='<br />'+'To activate your account, please <a href="http://clefnetwork.com/confirm/'+user._id+'">CLICK HERE</a>';
            addText+='<br />'+'<br />'+'The ClefNetwork Team';


            sendgrid.send({
              to: request.body.newEmail,
              from: 'info@clefnetwork.com',
              subject: 'Activate your ClefNetwork account',
              html: addText

            }, function(success, message) {
              if (!success) {

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

      if(user.role=='S') {
      //assign teacher if there are pending teacher requests
      db.Student.findOne({email : user.email}).run(function(err, student){

        if (student == null ) {
          console.log('post not found');
          response.send("uh oh, can't find that post");
        }
        else {

          db.Teacher.findOne({ "pendingRequests": { "$in": [student.email] }} ).run(function(err, teacher){
            if(teacher!==null){
              teacher.students.push(student._id);
              var requestPosition = 0;
              for(var i=0;i<teacher.pendingRequests.length;i++){
                if(teacher.pendingRequests[i]==user.email){
                  requestPosition=i;
                }
              }
              var pendingRequests = teacher.pendingRequests;
              pendingRequests.splice(requestPosition,1);
              db.Teacher.update({email : teacher.email}, {"$set" : {pendingRequests : pendingRequests}});
              teacher.save();
              student.teacher = teacher._id;
              student.teacherName = teacher.name;
              student.save();
            }

            response.render('site/confirmation.html');

          });
        }

      });
}
}
else {
  response.send("User does not exists.");
}

});


},

viewProfile: function(request,response){

  db.Student.findOne({_id : request.params.profileID}).run(function(err, student){
    if(request.user.role=="T"){
      db.Teacher.findOne({email : request.user.email }).run(function(err, teacher){
        var templateData = {
          student : student,
          teacher : teacher,
          user : request.user
        }
        response.render('teacher/viewProfile.html', templateData);
      });
    }
    else{
      db.Student.findOne({email : request.user.email }).run(function(err, user){
        var templateData = {
          student : student,
          user : user
        }
        response.render('student/viewProfile.html', templateData);
      });
    }
  });
},


forgotPW : function(request,response){

  var user =process.env.SENDGRID_USERNAME;
  var key= process.env.SENDGRID_PASSWORD;

  var SendGrid = require('sendgrid').SendGrid;
  var sendgrid = new SendGrid(user, key);

  db.User.findOne({email:request.body.email}, function(err,user){
    if(user) {
      sendgrid.send({
        to: user.email,
        from: 'admin@clefnetwork.com',
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
userSettings : function(request,response){
  var uemail=request.user.email;
  if(request.user.role=='S') {

    db.Student.findOne({email : uemail}).run(function(err, student){

      if (err) {
        console.log(err);
        response.send("an error occurred!");
      }

      if (student == null ) {
        console.log('post not found');
        response.send("uh oh, can't find that post");
      }

      else {
        var practices = new Array;
        for(i=0;i<student.goals.length;i++){
          for(j=0;j<student.goals[i].sessions.length;j++){
            var theSession = {
              time : student.goals[i].sessions[j].mins,
              date : student.goals[i].sessions[j].timestamp
            }
            practices.push(theSession);
          }

        }
        templateData = {
          student :  student,
          user : request.user,
          practices : practices,
          today : moment().format("YYYY-MM-DD")
        }
        response.render('student/settings.html', templateData);

      }
    });
  }
  else {
    if(request.user.role=='T') {

      db.Teacher.findOne({email : uemail}).run(function(err, teacher){

        if (err) {
          console.log(err);
          response.send("an error occurred!");
        }

        if (teacher == null ) {
          console.log('post not found');
          response.send("uh oh, can't find that post");
        } 

        else {
          var query = db.Student.find({  'teacher' : teacher._id}); 
                query.sort('name',1); //sort by date in descending order 
                query.exec({}, function(err, allStudents){
                  templateData = {
                   students : allStudents
                   ,  teacher :  teacher
                   ,  user : request.user
                 }
                 response.render('teacher/settings.html', templateData);

               });
              }
            });
    }
  }
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

