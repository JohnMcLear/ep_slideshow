var postAceInit = function(hook, context){
  var currentPosition;
  var slideShow = {
    enable: function() {
      currentPosition = 0; // go to start of document

      var $innerdoc = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody");
      var $outerdoc = $('iframe[name="ace_outer"]').contents().find("#outerdocbody");

      $('#editorcontainer, iframe, .menu_left, .menu_right').addClass('slideshow');

      // go to 0 position (Start of presentation)
      $outerdoc.css({'background':'transparent', 'overflow':'hidden'}).scrollTop(0); // go to 0 position (Start of presentation)

      // make last line super high, this is hacky but it just means we have enough space to scrollto if its near the bottom of the document
      $innerdoc.contents().last("div").css("height","1000px");

      // create spacing above h1s so you can't see them on each slide
      $innerdoc.contents().find("h1").parent().prev("div").css("margin-bottom","2000px");

      // make font bigger
      $innerdoc.css({"font-size":"150%", "line-height":"20px"});

      // dont show line numbers -- TODO: If numbers aren't already visible then don't show them when we re-enable
      pad.changeViewOption('showLineNumbers', false);

      // hide the popup dialogue
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
      var $innerdoc = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody");
      var $outerdoc = $('iframe[name="ace_outer"]').contents().find("#outerdocbody");

      $('#editorcontainer, iframe, .menu_left, .menu_right').removeClass('slideshow');

      $outerdoc.css('overflow','auto');
      $innerdoc.contents().last("div").css("height","20px");
      $innerdoc.contents().find("h1").parent().prev("div").css("margin-bottom","0px");

      // make font normal
      $innerdoc.css({"font-size":"12px", "line-height":"16px"});

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
