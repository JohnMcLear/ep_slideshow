var isMobile = $.browser.mobile;

if (!isMobile) {
  var postAceInit = function(hook, context){
    var pv = {
      enable: function() {
        $('#editorcontainer, iframe, .menu_left, .menu_right').addClass('slideshow');
        $('iframe[name="ace_outer"]').contents().find("#outerdocbody").css('background','transparent');
        $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").css('zoom','150%');
        pad.changeViewOption('showLineNumbers', false);
      },
      disable: function() {
        $('#editorcontainer, iframe, .menu_left, .menu_right').removeClass('slideshow');
        $('iframe[name="ace_outer"]').contents().find('iframe').contents().find("#innerdocbody").css('zoom','100%');
        pad.changeViewOption('showLineNumbers', true);
      }
    }
    /* init */
    if($('#options-slideshow').is(':checked')) {
      pv.enable();
    } else {
      pv.disable();
    }
    /* on click */
    $('#options-slideshow').on('click', function() {
      if($('#options-slideshow').is(':checked')) {
        pv.enable();
      } else {
        pv.disable();
      }
    });
  };
  exports.postAceInit = postAceInit;
} else {
  $('input#options-slideshow').hide();
  $('label[for=options-slideshow]').hide();
}
