$().ready(function() {


  $("#footerContactForm").validate();
  $('#loginForm').validate();
  $('#forgotPWForm').validate();
  $('#registerForm').validate({
    rules: {
      newName: "required",
      instrument: "required",
      newPassword: {
        required: true,
        minlength: 5
      },
      confirmpassword: {
        required: true,
        minlength: 5,
        equalTo: "#newPassword"
      },
      newEmail: {
        required: true,
        email: true
      },
    },
    messages: {
      newName: "Please enter your Name",
      instrument: "Please enter the instrument you play",
      newPassword: {
        required: "Please provide a password",
        minlength: "Your password must be at least 5 characters long"
      },
      confirmpassword: {
        required: "Please provide a password",
        minlength: "Your password must be at least 5 characters long",
        equalTo: "Please enter the same password as above"
      },
      newEmail: "Please enter a valid email address"
    }
  });
  $('#changePasswordForm').validate({
    rules: {
      old_password: {
        required: true,
        remote: {
          url: "/ajax/checkpassword",
          type: "post",
          data: {
            old_password: function() {
              return $("#old_password").val();
            }
          }
        }
      },
      password: {
        required: true,
        minlength: 5
      },
      password2: {
        required: true,
        minlength: 5,
        equalTo: "#password"
      }
    },
    messages: {     
     old_password: {
      remote: "This is not your current password",
      required: "Please provide old password",
      minlength: "Your password must be at least 5 characters long"
    },
    password: {
      required: "Please provide a password",
      minlength: "Your password must be at least 5 characters long"
    },
    password2: {
      required: "Please provide a password",
      minlength: "Your password must be at least 5 characters long",
      equalTo: "Please enter the same password as above"
    }
  },  
  onkeyup: false,
  onblur: true
});

$('.endDateInput').hide();

$(".endCheck").change(function() {
  if ($(this).attr("checked")) {
    $(this).siblings(".endDateInput").show();
  }
  else{
    $(this).siblings(".endDateInput").hide();
  }

}); 

//passwordchange
$("#changePasswordForm").submit(function(e){
  if($("#changePasswordForm").valid()) {
    $.ajax({ 
      data: $(this).serialize(), 
      type: $(this).attr('method'),
      url: $(this).attr('action'), 
      success: function(response) { 
       if(response!="false") {
        $("#actionInfoModal h4").html(response);
        $('#actionInfoModal').reveal();
      }
    }
  });
  }
  return false;
});

$("#forgotPWForm").submit(function(e){
  if($("#forgotPWForm").valid()) {
    $.ajax({ 
      data: $(this).serialize(), 
      type: $(this).attr('method'),
      url: $(this).attr('action'), 
      success: function(response) {        
        $("#actionInfoModal h4").html(response);
        $('#actionInfoModal').reveal();      
      }
    });
  }
  return false;
});

$("#addNewStudentForm").submit(function(e){  
  $.ajax({ 
    data: $(this).serialize(), 
    type: $(this).attr('method'),
    url: $(this).attr('action'), 
    success: function(response) {        
      $("#actionInfoModal h4").html(response);
      $('#actionInfoModal').reveal();      
    }
  });  
  return false;
});

$("#addFriendForm").submit(function(e){  
  $.ajax({ 
    data: $(this).serialize(), 
    type: $(this).attr('method'),
    url: $(this).attr('action'), 
    success: function(response) {        
      $("#actionInfoModal h4").html(response);
      $('#actionInfoModal').reveal();      
    }
  });  
  return false;
});

/** Student grouping by color - Teacher dashboard */
$(".student-color-picker").on("click", function() {
  $("#studentEmail", $("#studentColorPickerModal")).html($(this).attr("data-student-email"));
  $("#studentColorPickerModal > div > div div").unbind('click');
  $("#studentColorPickerModal #showAll").hide();

  $("#studentColorPickerModal > div > div div").on('click', function() {
    btn = $(this);
    studentEmail = $("#studentEmail", $("#studentColorPickerModal")).html();
    $.ajax({ 
      data: {
        teacherColor : btn.attr('data-color'),
        studentEmail: studentEmail
      },
      type: 'POST',
      url: '/teacher/setStudentColor', 
      success: function(response) {    
        if(response != "err") {
          $("#studentColorPickerModal").trigger('reveal:close');          
          $("span.student-color-picker", $("li." + response)).css("background-color", btn.attr('data-color'));
          $("span.student-color-picker", $("li." + response)).attr("data-teacher-color", btn.attr('data-color'));
          applyTeacherColorFilter();
        }   
      }
    });
  })

  $("#studentColorPickerModal > div > div div").removeClass("active");
  $("#studentColorPickerModal > div > div div[data-color="+$(this).attr('data-teacher-color')+"]").addClass("active");
  $("#studentColorPickerModal").reveal();
})

function applyTeacherColorFilter() {
 colorFilter = $(".student-color-filter").attr("data-teacher-color-filter");
 if(colorFilter != "") {
  $("li.aStudent").hide();
  $("li.aStudent span[data-teacher-color="+colorFilter+"]").closest("li").show();
}
else {
  $("li.aStudent").show();
}
}

$("#studentColorPickerModal #showAll").on('click', function(evt) {
  evt.preventDefault();
  $("#studentColorPickerModal > div > div div.active").trigger("click");
})

$(".student-color-filter").on("click", function() {
  $("#studentColorPickerModal > div > div div").unbind('click');
  
  $("#studentColorPickerModal > div > div div").removeClass("active");
  $("#studentColorPickerModal > div > div div[data-color="+$(this).attr('data-teacher-color-filter')+"]").addClass("active");
  
  
  if($("#studentColorPickerModal > div > div div.active").size() > 0)
    $("#studentColorPickerModal #showAll").show();
  else
    $("#studentColorPickerModal #showAll").hide();


  $("#studentColorPickerModal > div > div div").on('click', function() {

    var color = $(this).attr("data-color");
    if(!$(this).hasClass("active")) {
     $("#studentColorPickerModal > div > div div").removeClass("active");
     $(this).addClass("active");
   }
   else {
     color = "";
     $("#studentColorPickerModal > div > div div").removeClass("active");
   }
   
   $(".student-color-filter").attr("data-teacher-color-filter", color);
   $(".student-color-filter").css("background-color", color);
   $("#studentColorPickerModal").trigger('reveal:close');
   applyTeacherColorFilter();
 });

  $("#studentColorPickerModal").reveal();
})
/** End student grouping by color **/

//cancelteacher (student)
/*
$("#cancelTeacherForm").submit(function(e){
  $.ajax({ 
    data: $(this).serialize(), 
    type: $(this).attr('method'),
    url: $(this).attr('action'), 
    success: function(response) { 
      if(response!="false") {
        $("#actionInfoModal h4").html(response);
        $('#actionInfoModal').reveal();
      }
    }
  });  
  return false;
});
*/
$("#cancelTeacherForm").submit(function(e) {
  return confirm("Are you sure you want to cancel relationship with the current teacher?");
});

$("#deleteAccountForm").submit(function(e) {
  return confirm("Are you sure you want to delete your account. This cannot be undone!?");
});

});



$("#registerForm").submit(function(e){
 e.preventDefault();
 if($("#confirmpassword").val()==$('#newPassword').val()){        
   var newName = $("#newName").val();
   var newEmail = $("#newEmail").val();
   var newPassword = $('#newPassword').val();
   var instrument = $('#instrument').val();
   var role = $('input:radio[name=role]:checked').val();
   $.ajax({
    type: "POST",
    url: "/register",
    data:{
      newName : newName,
      newEmail : newEmail,
      newPassword : newPassword,
      instrument : instrument,
      role : role
    },
    success: function(data) {
      console.log(data);
      if(data=="success"){
        $('#registerForm').fadeOut('slow', function() {
          $('#successMessage').fadeIn('slow');
        });
      }
      else{
        $('#registerAlert').show();
        $('#registerError').html("Email already exists!");

      }
    }

  }); 

 }
 else{
  $('#registerAlert').show();
  $('#registerError').html("Passwords don't match!");

}        

});


$(".featureGoal").click(function(evt) {
  
/*
  evt.preventDefault();
  btn = $(this);


  $.ajax({ 
    data: {status: !btn.hasClass('featured')},
    type: "POST",
    url: "/editGoal/"+btn.attr('goalno')+"/featureSession/" + btn.attr('sessionno'), 
    success: function(response) {

      btn.toggleClass('featured');

      if(btn.hasClass('featured'))
        $("i", btn).removeClass('icon-star-empty').addClass('icon-star');
      else
        $("i", btn).removeClass('icon-star').addClass('icon-star-empty');
    }
  });  
*/
})



window.onload = function () {
  var youtubetext = $(".youtubetext"),
  youtubefile = $(".youtubefile"),
  typeInput = $(".youtubetype");
  youtubefile.hide();
  youtubetext.hide();

  $(".showtextinput").click(function(){
    typeInput.val("text");
    //youtubefile.hide();
    //youtubetext.show();
  });

  $(".showfileinput").click(function(){
    typeInput.val("file");
    //youtubefile.show();
    //youtubetext.hide();
  });

  $('.fullmessage').each(function(){
    var notes = $(this).html();
    console.log(notes);
    notes = notes.replace(/\r\n|\r|\n/g, "<br/>"); 
    $(this).html(notes);
  });


  $('input:radio[name="color"]').change(function(){
    theClass=($(this).val());
    className = $('#innerPreview').attr('class');
    $('#innerPreview').removeClass(className);
    $('#innerPreview').addClass(theClass);
  });


  $('input:radio[name="graphic"]').change(function(){
    thegraphic=($(this).val());
    $('#innerPreview').html("<i class='"+thegraphic+"'></i>");
  });

//?? too complex ?
$(".participants").each(function() {
  var names = new Array();
  var theDiv = $(this);
  var theEmails = $(this).html().split(", ");
  $(theDiv).html("");
  $.getJSON('/getContacts',function(data){
    $.each(data, function(i,person){
      for(j=0;j<theEmails.length;j++){
        if(theEmails[j].trim()==person.email.trim()) {
          $(theDiv).append(person.name+", ");
        }
      }
    });
  });

});
$(".message").each(function(){
  var leadText=$(this).html().substring(0,50);
  $(this).html(leadText+"...");

});
}

$(".unread").click(function(){
  $(this).removeClass('unread');
  var theNumber = $(this).find('.theNumber').val();
  $.post("/readMessage", { number: theNumber } );
});

$('#goalSelect').change(function() {
  if($('#goalSelect option:selected').val()!="-1"){
    $("#addNewGoal").fadeOut();
  }
  else{
    $("#addNewGoal").fadeIn();
    $("#sesssionArea").fadeOut();
  }

});