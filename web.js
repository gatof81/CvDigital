// base dependencies for app
var express = require('express')
  , passport = require('passport')
  , mongoose = require('mongoose')
  , ejs = require('ejs')
  , routes = require('./routesConfig')
  , DB = require('./accessDB').AccessDB
  , mongoStore = require('connect-mongodb');

  var app = module.exports = express.createServer();
global.app = app;

var DB = require('./accessDB');
var db = new DB.startup('mongodb://diegof18:136048nm@ds035438.mongolab.com:35438/heroku_app16857097');

var moment = require('moment');

// Configuration
app.configure(function(){

    app.enable("jsonp callback");

    //configure template engine
    app.set('views', __dirname + '/views'); //store all templates inside /views
    app.set('view engine', 'ejs'); // ejs is our template engine
    app.set('view options',{layout:true}); // use /views/layout.html to manage your main header/footer wrapping template
    app.engine('html', require('ejs').renderFile); //use .html files in /views instead .ejs extension
    
    app.use(express.cookieParser());//Cookies must be turned on for Sessions
    app.use(express.bodyParser());
    app.use(express.methodOverride());

    /*** Turn on Express Sessions - Use MongoStore ***/
    app.use(express.session({ 
    store: new mongoStore({url:'mongodb://diegof18:136048nm@ds035438.mongolab.com:35438/heroku_app16857097', maxAge: 300000})
    , secret: 'YOURSECRETHASH'
  }, function() {
            app.use(app.router);
        })
);
    
    app.use(passport.initialize());
    app.use(passport.session());
    /*** end of passport setup ***/
    
    // define the static directory for css, img and js files
    app.use(express.static(__dirname + '/static'));
    //favicon
    app.use(express.favicon(__dirname + '/static/images/favicon.ico'));
  
    /**** Turn on some debugging tools ****/
    app.use(express.logger());
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  
});


// Routes - all URLs are defined inside routesConfig.js
// we pass in 'app'
require('./routesConfig')(app);

// Make server turn on and listen at defined PORT (or port 3000 if is not defined)
var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Listening on ' + port);

});