var postAceInit = function(hook, context){
  var currentPosition;
  var slideShow = {
    enable: function() {
      $('#editorcontainer, iframe, .menu_left, .menu_right').addClass('slideshow');
      $('iframe[name="ace_outer"]').contents().find("#outerdocbody").css({'background':'transparent', 'overflow':'hidden'});
      $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().find("h1").not(":eq(0)").css("margin-top","1000px");
      $('iframe[name="ace_outer"]').contents().find("#outerdocbody").scrollTop(0); // go to 0 position (Start of presentation)
      // make last line super high, this is hacky but it just means we have enough space to scrollto if its near the bottom of the document
      $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().last("div").css("height","1000px");
/*
      $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().css("font-size","16px");
      $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().css("line-height","20px");
*/
      currentPosition = 0; // go to start of document

      pad.changeViewOption('showLineNumbers', false);
      $(".popup").hide();

      $("body").keydown(function(e) {
        if(e.keyCode == 39){ // next slide from right arrow
          slideShow.next();
        }else if(e.keyCode == 37){ // previous slide from left arrow
          slideShow.previous();
        }
      });
      $("body").mousedown(function(e) {
        if(e.target.id == "editorcontainer"){ // if we click on the main body
          if(e.which == 1){
            slideShow.next(); // go to next slide
          }
        }
      });
      $("body").bind("contextmenu", function(e){
        e.preventDefault();
        slideShow.previous(); // go to previous slide
        return false;
      });

    },
    disable: function() { // disable the slideshow functionality
      $('#editorcontainer, iframe, .menu_left, .menu_right').removeClass('slideshow');
      $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().find("h1").not(":eq(0)").css("margin-top","0px");
      $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().last("div").css("height","20px");
      $('iframe[name="ace_outer"]').contents().find("#outerdocbody").css('overflow','auto');
/*
      $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().css("font-size","12px");
      $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().css("line-height","14px");
*/
      pad.changeViewOption('showLineNumbers', true);

      $("body").keydown(function(e) {
        if(e.keyCode == 39){ // next slide from right arrow
          return false;
        }else if(e.keyCode == 37){ // previous slide from left arrow
          return false;
        }
      });
      $("body").mousedown(function(e) {
        if(e.target.id == "editorcontainer"){ // if we click on the main body
          if(e.which == 1){
            return false;
          }
        }
      });
      $("body").bind("contextmenu", function(e){
        return false;
      });

    },
    next: function(){ // go to next slide
      var targetH1 = currentPosition +1;
      var h1 = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().find("h1").eq(targetH1); // get the target element
      if(h1.offset()){ // if the element exists
        var newY = h1.offset().top;
        $('iframe[name="ace_outer"]').contents().find("#outerdocbody").scrollTop(newY);
        currentPosition = currentPosition +1;
      }
    },
    previous: function(){ // go to previous slide
      if(currentPosition > 0){ // dont go into negative numbers
        var targetH1 = currentPosition -1;
        currentPosition = currentPosition -1;
        var h1 = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().find("h1").eq(targetH1); // get the target element
        if(h1.offset()){ // if the element exists
          var newY = h1.offset().top;
          $('iframe[name="ace_outer"]').contents().find("#outerdocbody").scrollTop(newY);
        }
      }
    }
  }
  /* init */
  if($('#options-slideshow').is(':checked')) {
    slideShow.enable();
  } else {
    slideShow.disable();
  }
  /* on click */
  $('#options-slideshow').on('click', function() {
    if($('#options-slideshow').is(':checked')) {
      slideShow.enable();
    } else {
      slideShow.disable();
    }
  });
};
exports.postAceInit = postAceInit;
