var postAceInit = function(hook, context){
  var currentPosition;
  var changeViewOption = {
    showLineNumbers : true
  };

  if(!pad.plugins) pad.plugins = {};
  // $('#options-slideshowEdit').attr("disabled", false);

  $(window).resize(function() {
    if(!slideShow.isEnabled) return true;
    slideShow.drawHeight();
  });

  // handle keydown events
  $('body').keydown(function(e) {
    if(!slideShow.isEnabled) return true;
    if(e.keyCode == 39){ // next slide from right arrow
      slideShow.next();
    }else if(e.keyCode == 37){ // previous slide from left arrow
      slideShow.previous();
    }
  });

  // handle click events
  $('iframe[name="ace_outer"]').contents().find("#outerdocbody").bind("mousedown", function(e){
    if(!slideShow.isEnabled) return false; // if we're in slideshow view
    if(slideShow.editMode) return false; // If we're allowing edits
    console.log("sup outerdocbody", e);
    if(e.which === 1) slideShow.next();
    if(e.which === 3) slideShow.previous();
    e.preventDefault();
  });

  // handle click events
  $("body").bind("mousedown", function(e){
    if(!slideShow.isEnabled) return false; // if we're in slideshow view
    if(slideShow.editMode) return false; // If we're allowing edits
    console.log("sup body", e);
    if(e.which === 1) slideShow.next();
    if(e.which === 3) slideShow.previous();
    e.preventDefault();
    $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").blur();
  });

  // handle click events
  $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").bind("mousedown", function(e){
    if(!slideShow.isEnabled) return true; // if we're in slideshow view
    if(slideShow.editMode) return; // If we're allowing edits
    console.log("sup inner doc", e);
    if(e.which === 1) slideShow.next();
    if(e.which === 3) slideShow.previous();
    e.preventDefault();
    $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").blur();
  });

  $("body").on("contextmenu", function(e){
    if(slideShow.editMode) return; // If we're allowing edits
    console.log("sup context");
    e.preventDefault();
    return slideShow.handleRightClick(e);
  });

  $('iframe[name="ace_outer"]').contents().find("#outerdocbody").on("contextmenu", function(e){
    if(slideShow.editMode) return; // If we're allowing edits
    console.log("sup context 2");
    e.preventDefault();
    return slideShow.handleRightClick(e);
  });

  $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").on("contextmenu", function(e){
    if(slideShow.editMode) return; // If we're allowing edits
    console.log("sup context 3");
    e.preventDefault();
    // return slideShow.handleRightClick(e);
    return false;
  });

  // on click view
  $('#options-slideshow').on('click', function() {
    if($('#options-slideshow').is(':checked')) {
      slideShow.enable();
    } else {
      slideShow.disable();
    }
  });

  // on click edit while in view
  $('#options-slideshowEdit').on('click', function() {
    if($('#options-slideshowEdit').is(':checked')) {
      slideShow.editMode = true;
    } else {
      slideShow.editMode = false;
    }
  });

  // Mousewheel support
  $(document).bind('mousewheel DOMMouseScroll', function(event) {
    if(event.ctrlKey) return true;
    if(!slideShow.isEnabled) return true;
    if(slideShow.editMode) return; // If we're allowing edits
    event.preventDefault();
    if(event.originalEvent.detail < 0 || event.originalEvent.wheelDelta >= 0) {
      slideShow.previous();
    } else {
      slideShow.next();
    }
  });

  $(document).bind('mozfullscreenchange', function(event){
    console.log("event", event);
    slideShow.drawHeight();
    $('#editorcontainer').css("top","0px");
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

      // Go full screen
      slideShow.fullScreen();

      // Draw the container height based on the content
      slideShow.drawHeight();
    },

    drawHeight: function(){ // redraws page based on height of content
      // current offset?
      var thish1 = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().find("h1").eq(currentPosition); // get this element
      var nexth1 = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().find("h1").eq(currentPosition+1); // get the target element
      var thish1Y = thish1.offset().top;
      if(nexth1.length > 0){
        var nexth1Y = nexth1.offset().top;
      }else{
        // This bodge is because we use h1's to get the contents overall height
        // If this is the last h1 we wont know when the next h1 exists
        // So we can't know the contents height.
        // A fix would be look at the overall height of the editor and use
        // that as a reference --- TODO
        // console.log("bodging it");
        nexth1Y = thish1Y + 2000; // BODGE
      }

      // offset is 2000 px, take that into account
      var contentHeight = (nexth1Y - thish1Y) - 2000;
      // console.log("content Height", contentHeight);
      
      // page height
      var pageHeight = $('iframe[name="ace_outer"]').css("height");
      pageHeight = pageHeight.replace("px", "");
      pageHeight = parseInt(pageHeight);
      // console.log(pageHeight);

      // content top offset
      var offset = (pageHeight - contentHeight) / 2;

      // set offset
      // console.log("offset", offset);
      $('iframe[name="ace_outer"]').contents().find('iframe').css("top", offset +"px");
    },

    disable: function() { // disable the slideshow functionality
      $('#editorcontainer').css("top","0px");
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

      $('iframe[name="ace_outer"]').contents().find('iframe').css("top", "7px");
    },

    next: function(){ // go to next slide
      var targetH1 = currentPosition +1;
      var h1 = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().find("h1").eq(targetH1); // get the target element
      if(h1.length == 0 && currentPosition == 0){
        alert("You need to set some text as Heading 1 to create a new slide");
      }

      // Skip over blank errornous H1s
      // This is really buggy
      /*
      var text = $(h1).text();
      if(text === ""){
        currentPosition = currentPosition +1;
        slideShow.next();
        return;
      }
      */

      if(h1.offset()){ // if the element exists
        var newY = h1.offset().top;
        var $outerdoc = $('iframe[name="ace_outer"]').contents().find("#outerdocbody");
        var $outerdocHTML = $('iframe[name="ace_outer"]').contents().find("#outerdocbody").parent();
        $outerdoc.scrollTop(newY); // works in Chrome not FF
        $outerdoc.animate({scrollTop: newY});
        $outerdocHTML.animate({scrollTop: newY}); // needed for FF
        currentPosition = currentPosition +1;
        slideShow.drawHeight();
      }
    },

    previous: function(){ // go to previous slide
      console.log("previous");
      if(currentPosition > 0){ // dont go into negative numbers
        var targetH1 = currentPosition -1;
        currentPosition = currentPosition -1;
        var h1 = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").contents().find("h1").eq(targetH1); // get the target element

        // Skip over blank errornous H1s -- TODO

        if(h1.offset()){ // if the element exists
          var newY = h1.offset().top;
          var $outerdoc = $('iframe[name="ace_outer"]').contents().find("#outerdocbody");
          var $outerdocHTML = $('iframe[name="ace_outer"]').contents().find("#outerdocbody").parent();
          $outerdoc.scrollTop(newY); // works in Chrome not FF
          $outerdoc.animate({scrollTop: newY});
          $outerdocHTML.animate({scrollTop: newY}); // needed for FF
          slideShow.drawHeight();
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
    },

    fullScreen: function(){
      var elem = document.getElementById("editorcontainer");
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      }
    },

    handleRightClick: function(e){
      if(!slideShow.isEnabled) return true;
      e.preventDefault();
      slideShow.previous(); // go to previous slide
      return false;
    }
  }

  var urlContainsSlideshowTrue = (slideShow.getParam("slideshow") == "true"); // if the url param is set
  if(urlContainsSlideshowTrue){
    $('#options-slideshow').attr('checked','checked');
    slideShow.enable();
  }

  pad.plugins.ep_slideshow = slideShow; 
};
exports.postAceInit = postAceInit;
