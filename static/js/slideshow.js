var postAceInit = function(hook, context){
  var currentPosition;
  var changeViewOption = {
    showLineNumbers : true
  };

  if(!pad.plugins) pad.plugins = {};

  // handle swipe events
  $("body").bind('swipeone', function(e, d){
    if(!slideShow.isEnabled) return false;
    if(d.direction.lastX == -1){  // if it's a swipe to the left
      slideShow.previous();
    }else{
      slideShow.next();
    }
  });

  $("#editorcontainerbox").off('tapone'); // remove the initial event so it doesn't fire twice
  $("#editorcontainerbox").on('tapone', function(e, d){
    if(d.originalEvent.which !== 3){ // if it's not a right click..
      slideShow.next();
    }
  });

  // handle click events
  $("body").keydown(function(e) {
    if(!slideShow.isEnabled) return false;
    if(e.keyCode == 39){ // next slide from right arrow
      slideShow.next();
    }else if(e.keyCode == 37){ // previous slide from left arrow
      slideShow.previous();
    }
  });

  $("body").bind("contextmenu", function(e){
    if(!slideShow.isEnabled) return false;
    e.preventDefault();
    slideShow.previous(); // go to previous slide
    return false;
  });

  //Mousewheel support
  $(document).bind('mousewheel DOMMouseScroll', function(event) {
    if(!slideShow.isEnabled) return false;
    event.preventDefault();
    if(event.originalEvent.wheelDelta > 0) {
      slideShow.previous();
    } else {
      slideShow.next();
    }
  });

  var slideShow = {
    enable: function() {
      slideShow.isEnabled = true;
      $("#options-pageview").attr("disabled", true);
      if(pad.plugins.ep_page_view) pad.plugins.ep_page_view.disable();
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

      // dont show line numbers -- remember the current setting
      changeViewOption.showLineNumbers = typeof(clientVars.initialOptions.view) === 'undefined' ? false : (typeof(clientVars.initialOptions.view.showLineNumbers) === 'undefined' ? false : clientVars.initialOptions.view.showLineNumbers);
      pad.changeViewOption('showLineNumbers', false);

      // hide the popup dialogue
      $(".popup").hide();
 
    },
    disable: function() { // disable the slideshow functionality
      slideShow.isEnabled = false;
      $("#options-pageview").attr("disabled", false);
      var $innerdoc = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody");
      var $outerdoc = $('iframe[name="ace_outer"]').contents().find("#outerdocbody");

      $('#editorcontainer, iframe, .menu_left, .menu_right').removeClass('slideshow');

      $outerdoc.css('overflow','auto');
      $innerdoc.contents().last("div").css("height","20px");
      $innerdoc.contents().find("h1").parent().prev("div").css("margin-bottom","0px");

      // make font normal
      $innerdoc.css({"font-size":"12px", "line-height":"16px"});

      pad.changeViewOption('showLineNumbers', changeViewOption.showLineNumbers);

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
      if(h1.length == 0 && currentPosition == 0){
        alert("You need to set some text as Heading 1 to create a new slide");
      }
      if(h1.offset()){ // if the element exists
        var newY = h1.offset().top;
        var $outerdoc = $('iframe[name="ace_outer"]').contents().find("#outerdocbody");
        var $outerdocHTML = $('iframe[name="ace_outer"]').contents().find("#outerdocbody").parent();
        $outerdoc.scrollTop(newY); // works in Chrome not FF
        $outerdoc.animate({scrollTop: newY});
        $outerdocHTML.animate({scrollTop: newY}); // needed for FF
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
          var $outerdoc = $('iframe[name="ace_outer"]').contents().find("#outerdocbody");
          var $outerdocHTML = $('iframe[name="ace_outer"]').contents().find("#outerdocbody").parent();
          $outerdoc.scrollTop(newY); // works in Chrome not FF
          $outerdoc.animate({scrollTop: newY});
          $outerdocHTML.animate({scrollTop: newY}); // needed for FF
        }
      }
    },
    getParam: function(sname)
    {
      var params = location.search.substr(location.search.indexOf("?")+1);
      var sval = "";
      params = params.split("&");
      // split param and value into individual pieces
      for (var i=0; i<params.length; i++)
      {
        temp = params[i].split("=");
        if ( [temp[0]] == sname ) { sval = temp[1]; }
      }
      return sval;
    }
  }
  /* init */
  if($('#options-slideshow').is(':checked')) {
    slideShow.enable();
  } else {
    slideShow.disable();
  }
  var urlContainsSlideshowTrue = (slideShow.getParam("slideshow") == "true"); // if the url param is set
  if(urlContainsSlideshowTrue){
    $('#options-slideshow').attr('checked','checked');
    slideShow.enable();
  }
  /* on click */
  $('#options-slideshow').on('click', function() {
    if($('#options-slideshow').is(':checked')) {
      slideShow.enable();
    } else {
      slideShow.disable();
    }
  });

  pad.plugins.ep_slideshow = slideShow;
 
};
exports.postAceInit = postAceInit;
