var isMobile = $.browser.mobile;

if (!isMobile) {
  var postAceInit = function(hook, context){
    var pv = {
      enable: function() {
        $('#editorcontainer, iframe, #editbar').addClass('slideshow');
        $('iframe[name="ace_outer"]').contents().find("#outerdocbody").css('background','transparent');
      },
      disable: function() {
        $('#editorcontainer, iframe, #editbar').removeClass('slideshow');
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
