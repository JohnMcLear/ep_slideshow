var postAceInit = function (hook, context) {
  const savedTop = $('#editorcontainer').css('top');
  let currentPosition;
  const changeViewOption = {
    showLineNumbers: true,
  };

  if (!pad.plugins) pad.plugins = {};
  // $('#options-slideshowEdit').attr("disabled", false);

  $(window).resize(() => {
    if (!slideShow.isEnabled) return true;
    slideShow.drawHeight();
  });

  // handle keydown events
  $('body').keydown((e) => {
    if (!slideShow.isEnabled) return true;
    if (e.keyCode == 39) { // next slide from right arrow
      slideShow.next();
    } else if (e.keyCode == 37) { // previous slide from left arrow
      slideShow.previous();
    }
  });

  // handle click events
  $('iframe[name="ace_outer"]').contents().find('#outerdocbody').bind('mousedown', (e) => {
    if (!slideShow.isEnabled) return false; // if we're in slideshow view
    if (slideShow.editMode) return false; // If we're allowing edits
    if (e.which === 1) slideShow.next();
    if (e.which === 3) slideShow.previous();
    e.preventDefault();
  });

  // handle click events
  $('body').bind('mousedown', (e) => {
    if (!slideShow.isEnabled) return true; // if we're in slideshow view
    if (slideShow.editMode) return true; // If we're allowing edits
    if (e.which === 1) slideShow.next();
    if (e.which === 3) slideShow.previous();
    e.preventDefault();
    $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody').blur();
  });

  // handle click events
  $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody').bind('mousedown', (e) => {
    if (!slideShow.isEnabled) return true; // if we're in slideshow view
    if (slideShow.editMode) return; // If we're allowing edits
    if (e.which === 1) slideShow.next();
    if (e.which === 3) slideShow.previous();
    e.preventDefault();
    $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody').blur();
  });

  $('body').on('contextmenu', (e) => {
    if (slideShow.editMode) return; // If we're allowing edits
    e.preventDefault();
    return slideShow.handleRightClick(e);
  });

  $('iframe[name="ace_outer"]').contents().find('#outerdocbody').on('contextmenu', (e) => {
    if (slideShow.editMode) return; // If we're allowing edits
    e.preventDefault();
    return slideShow.handleRightClick(e);
  });

  $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody').on('contextmenu', (e) => {
    if (slideShow.editMode) return; // If we're allowing edits
    e.preventDefault();
    // return slideShow.handleRightClick(e);
    return false;
  });

  // on click view
  $('#options-slideshow').on('click', () => {
    if ($('#options-slideshow').is(':checked')) {
      slideShow.enable();
    } else {
      slideShow.disable();
    }
  });

  // on click edit while in view
  $('#options-slideshowEdit').on('click', () => {
    if ($('#options-slideshowEdit').is(':checked')) {
      slideShow.editMode = true;
    } else {
      slideShow.editMode = false;
    }
  });

  // Mousewheel support
  $(document).bind('mousewheel DOMMouseScroll', (event) => {
    if (event.ctrlKey) return true;
    if (!slideShow.isEnabled) return true;
    if (slideShow.editMode) return; // If we're allowing edits
    event.preventDefault();
    if (event.originalEvent.detail < 0 || event.originalEvent.wheelDelta >= 0) {
      slideShow.previous();
    } else {
      slideShow.next();
    }
  });

  $(document).bind('mozfullscreenchange', (event) => {
    slideShow.drawHeight();
    $('#editorcontainer').css('top', savedTop);
  });

  var slideShow = {
    enable() {
      slideShow.isEnabled = true;
      $('#options-pageview').attr('disabled', true);
      currentPosition = 0; // go to start of document

      const $innerdoc = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody');
      const $outerdoc = $('iframe[name="ace_outer"]').contents().find('#outerdocbody');
      const $innerFrame = $('iframe[name="ace_outer"]').contents().find('iframe');
      const $outerFrame = $('iframe[name="ace_outer"]');

      slideShow.previousInnerCSS = $innerdoc.getStyleObject();
      slideShow.previousInnerFrameCSS = $innerFrame.getStyleObject();
      slideShow.previousOuterFrameCSS = $outerFrame.getStyleObject();


      $('#editorcontainer, iframe, .menu_left, .menu_right').addClass('slideshow');
      // go to 0 position (Start of presentation)
      $outerdoc.css({background: 'transparent', overflow: 'hidden'}).scrollTop(0); // go to 0 position (Start of presentation)
      $outerFrame.css('height', '80%');

      $innerdoc.css({'background-color': 'transparent'});
      $innerFrame.css({'background-color': 'transparent'});

      // make last line super high, this is hacky but it just means we have enough space to scrollto if its near the bottom of the document
      $innerdoc.contents().last('div').css('height', '1000px');


      // create spacing above h1s so you can't see them on each slide
      $innerdoc.contents().find('h1').parent().prev('div').css('margin-bottom', '2000px');

      // make font bigger
      // $innerdoc.css("zoom","1.25"); // TODO make this a setting or workable
      // The above breaks scrolling in firefox..  FML!

      // dont show line numbers -- remember the current setting
      changeViewOption.showLineNumbers = typeof (clientVars.initialOptions.view) === 'undefined' ? false : (typeof (clientVars.initialOptions.view.showLineNumbers) === 'undefined' ? false : clientVars.initialOptions.view.showLineNumbers);
      pad.changeViewOption('showLineNumbers', false);

      // hide the popup dialogue
      // $(".popup").hide();

      // Go full screen
      slideShow.fullScreen();

      // Draw the container height based on the content
      slideShow.drawHeight();
    },

    drawHeight() { // redraws page based on height of content
      // current offset?
      const thish1 = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody').contents().find('h1').eq(currentPosition); // get this element
      const nexth1 = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody').contents().find('h1').eq(currentPosition + 1); // get the target element
      if (thish1Y) var thish1Y = thish1.offsetTop;
      if (nexth1.length > 0) {
        var nexth1Y = nexth1.offsetTop;
      } else {
        // This bodge is because we use h1's to get the contents overall height
        // If this is the last h1 we wont know when the next h1 exists
        // So we can't know the contents height.
        // A fix would be look at the overall height of the editor and use
        // that as a reference --- TODO
        nexth1Y = thish1Y + 2000; // BODGE
      }

      // offset is 2000 px, take that into account
      const contentHeight = (nexth1Y - thish1Y) - 2000;
      // console.log("content Height", contentHeight);

      // page height
      let pageHeight = $('iframe[name="ace_outer"]').css('height');
      pageHeight = pageHeight.replace('px', '');
      pageHeight = parseInt(pageHeight);
      // console.log(pageHeight);

      // content top offset
      const offset = (pageHeight - contentHeight) / 2;

      // set offset
      // console.log("offset", offset);
      $('iframe[name="ace_outer"]').contents().find('iframe').css('top', `${offset}px`);
    },

    disable() { // disable the slideshow functionality
      $('#editorcontainer').css('top', savedTop);
      slideShow.isEnabled = false;
      $('#options-pageview').attr('disabled', false);
      const $innerdoc = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody');
      const $outerdoc = $('iframe[name="ace_outer"]').contents().find('#outerdocbody');
      const $innerFrame = $('iframe[name="ace_outer"]').contents().find('iframe');
      const $outerFrame = $('iframe[name="ace_outer"]');
      $('#editorcontainer, iframe, .menu_left, .menu_right').removeClass('slideshow');

      $outerdoc.css('overflow', 'auto');
      $innerdoc.contents().last('div').css('height', '20px'); // bad
      $innerdoc.removeClass('slideshow');
      $innerdoc.contents().find('h1').parent().prev('div').css('margin-bottom', '0px'); // bad

      $innerdoc.css(slideShow.previousInnerCSS);
      $innerFrame.css(slideShow.previousInnerFrameCSS);
      $outerFrame.css(slideShow.previousOuterFrameCSS);

      pad.changeViewOption('showLineNumbers', changeViewOption.showLineNumbers);

      $('body').keydown((e) => {
        if (e.keyCode == 39) { // next slide from right arrow
          return false;
        } else if (e.keyCode == 37) { // previous slide from left arrow
          return false;
        }
      });

      $('body').mousedown((e) => {
        if (e.target.id == 'editorcontainer') { // if we click on the main body
          if (e.which == 1) {
            return false;
          }
        }
      });

      $('body').bind('contextmenu', (e) => false);
    },

    next() { // go to next slide
      const targetH1 = currentPosition + 1;
      const h1 = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody').contents().find('h1').eq(targetH1); // get the target element
      if (h1.length == 0 && currentPosition == 0) {
        alert('You need to set some text as Heading 1 to create a new slide');
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

      if (h1.offset()) { // if the element exists
        const newY = h1.offset().top;
        const $outerdoc = $('iframe[name="ace_outer"]').contents().find('#outerdocbody');
        const $outerdocHTML = $('iframe[name="ace_outer"]').contents().find('#outerdocbody').parent();
        $outerdoc.scrollTop(newY); // works in Chrome not FF
        $outerdoc.animate({scrollTop: newY});
        $outerdocHTML.animate({scrollTop: newY}); // needed for FF
        currentPosition += 1;
        slideShow.drawHeight();
      }
    },

    previous() { // go to previous slide
      if (currentPosition > 0) { // dont go into negative numbers
        const targetH1 = currentPosition - 1;
        currentPosition -= 1;
        const h1 = $('iframe[name="ace_outer"]').contents().find('iframe').contents().find('#innerdocbody').contents().find('h1').eq(targetH1); // get the target element

        // Skip over blank errornous H1s -- TODO

        if (h1.offset()) { // if the element exists
          const newY = h1.offset().top;
          const $outerdoc = $('iframe[name="ace_outer"]').contents().find('#outerdocbody');
          const $outerdocHTML = $('iframe[name="ace_outer"]').contents().find('#outerdocbody').parent();
          $outerdoc.scrollTop(newY); // works in Chrome not FF
          $outerdoc.animate({scrollTop: newY});
          $outerdocHTML.animate({scrollTop: newY}); // needed for FF
          slideShow.drawHeight();
        }
      }
    },

    getParam(sname) {
      let params = location.search.substr(location.search.indexOf('?') + 1);
      let sval = '';
      params = params.split('&');
      // split param and value into individual pieces
      for (let i = 0; i < params.length; i++) {
        temp = params[i].split('=');
        if ([temp[0]] == sname) { sval = temp[1]; }
      }
      return sval;
    },

    fullScreen() {
      const elem = document.getElementById('editorcontainer');
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

    handleRightClick(e) {
      if (!slideShow.isEnabled) return true;
      e.preventDefault();
      slideShow.previous(); // go to previous slide
      return false;
    },
  };

  const urlContainsSlideshowTrue = (slideShow.getParam('slideshow') == 'true'); // if the url param is set
  if (urlContainsSlideshowTrue) {
    $('#options-slideshow').attr('checked', 'checked');
    $('#options-slideshow').prop('checked', 'checked');
    if ($('#options-slideshowEdit').is(':checked')) {
      slideShow.editMode = true;
    } else {
      slideShow.editMode = false;
    }
    slideShow.enable();
  }

  pad.plugins.ep_slideshow = slideShow;
};
exports.postAceInit = postAceInit;

(function ($) {
  $.fn.getStyleObject = function () {
    const dom = this.get(0);
    let style;
    const returns = {};
    if (window.getComputedStyle) {
      const camelize = function (a, b) {
        return b.toUpperCase();
      };
      style = window.getComputedStyle(dom, null);
      for (let i = 0, l = style.length; i < l; i++) {
        var prop = style[i];
        const camel = prop.replace(/\-([a-z])/g, camelize);
        const val = style.getPropertyValue(prop);
        returns[camel] = val;
      }
      return returns;
    }
    if (style = dom.currentStyle) {
      for (var prop in style) {
        returns[prop] = style[prop];
      }
      return returns;
    }
    return this.css();
  };
})(jQuery);
