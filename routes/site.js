var db = require('../accessDB');
var moment = require('moment');

module.exports = {

    pageNotFound: function(request,response) {

         if(request.user){
                templateData = {
                    layout : 'layout.html',
                    user : request.user

                }
            }
            else {
                templateData = {
                    layout : 'layout.html',
                    user : false
                }
            }
                
                response.render('site/404.html', templateData);
    },

    mainpage : function(request, response) {
         
         if(request.user){
            if(request.user.role=='T'){
                response.redirect('/teacher/dashboard');
            }
            else{
                response.redirect('/student/dashboard');

            }
         }
         else{

                 templateData = {
                     message: request.flash('error')[0],
                     layout:'layout_home.html'
                }
                
                response.render('site/home.html', templateData);

         }

    },

    aboutPage : function(request, response) {
         if(request.user){
                templateData = {
                    layout : 'layout.html',
                    user : request.user

                }
            }
            else {
                templateData = {
                    layout : 'layout.html',
                    user : false
                }
            }
                
                response.render('site/about.html', templateData);

    }
 }