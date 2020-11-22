describe('slideshow button', function () {
  // create a new pad before each test run
  beforeEach(function (cb) {
    helper.newPad(cb);
    this.timeout(60000);
  });

  it('makes slideshow', function (done) {
    const inner$ = helper.padInner$;
    const chrome$ = helper.padChrome$;

    // get the first text element out of the inner iframe
    const $firstTextElement = inner$('div').first();

    // select this text element
    $firstTextElement.sendkeys('{selectall}');

    // get the heading button and click it
    var $headingOption = chrome$('#heading-selection');
    $headingOption.val(0);
    $headingOption.change();

    const $nextTextElement = inner$('div').children().eq(2);

    // select this text element
    $nextTextElement.sendkeys('{selectall}');

    // get the heading button and click it
    var $headingOption = chrome$('#heading-selection');
    $headingOption.val(0);
    $headingOption.change();


    // click the slideshow button to enable the slideshow
    var $slideshowButton = chrome$('#options-slideshow');
    $slideshowButton.click();

    // menu css
    expect(chrome$('.menu_left').hasClass('slideshow')).to.be(true);
    expect(chrome$('.menu_right').hasClass('slideshow')).to.be(true);
    // editor css
    expect(chrome$('#editorcontainer').first().hasClass('slideshow')).to.be(true);

    // click the slideshow button to disable the slideshow
    var $slideshowButton = chrome$('#options-slideshow');
    $slideshowButton.click();

    // menu css
    expect(chrome$('.menu_left').hasClass('slideshow')).to.be(false);
    expect(chrome$('.menu_right').hasClass('slideshow')).to.be(false);
    // editor css
    expect(chrome$('#outerdocbody').first().hasClass('slideshow')).to.be(false);


    done();
  });
});
