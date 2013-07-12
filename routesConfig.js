/** routes.js
  */
var passport = require('passport'),
    db = require('./accessDB');

// Route methods

var siteRoute = require('./routes/site');
var userRoute = require('./routes/user');

// If user is authenticated, redirect to 
function ensureAuthenticated(request, response, next) {
  if (request.isAuthenticated()) { return next(); }

  request.flash("redirect",request.originalUrl);
  response.redirect('/');
}


module.exports = function(app) {


    /*********** SITE ROUTES ************/ 

    app.get('/', siteRoute.mainpage );

    app.get('/about', siteRoute.aboutPage);

    app.get('/user/:user', siteRoute.logedIn);

    app.post('/login', passport.authenticate('local', { failureRedirect: '/', failureFlash: true }),
    function(request, response) { 
        db.User.findOne({email : request.user.email}).run(function(err, user){
            response.redirect("/user/"+user)
        })
    });

    /*********** USER ROUTES ************/ 
 
    //any route should redirect to not found page.
    app.get('*', siteRoute.pageNotFound );

}