// PROBLEMS and TODO list
// arrow keys dont work
// no right click to go back a slide
// need ability to go onto next and previous slide
// headings prolly break line height issues


var postAceInit = function(hook, context){
  var slideShow = {
    enable: function() {
      $('#editorcontainer, iframe, .menu_left, .menu_right').addClass('slideshow');
      $('iframe[name="ace_outer"]').contents().find("#outerdocbody").css('background','transparent');
      $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").css('zoom','150%');
      pad.changeViewOption('showLineNumbers', false);
      $(".popup").hide();

      $("body").keypress(function(e) {
        console.log(e);
        console.warn("Handler for .keypress() called.");
      });
      $("body").click(function(e) {
        if(e.target.id == "editorcontainer"){ // if we click on the main body
          slideShow.next(); // go to next slide
        }
      });

    },
    disable: function() {
      $('#editorcontainer, iframe, .menu_left, .menu_right').removeClass('slideshow');
      $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").css('zoom','100%');
      pad.changeViewOption('showLineNumbers', true);
    },
    next: function(){
      var status = slideShow.status(); // get the current slide number
      currentSlide = status.slideNumber;
      console.log(currentSlide);
    },
    status: function(){
      var state = {};
      var html = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").html; // get the HTML
      // console.log(html);
      state.slideNumber = 0;
      return state;
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
