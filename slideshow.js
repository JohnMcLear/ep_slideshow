var eejs = require('ep_etherpad-lite/node/eejs/');
var settings = require('ep_etherpad-lite/node/utils/Settings');
var checked_state = '';

exports.eejsBlock_mySettings = function (hook_name, args, cb) {
  if (settings.ep_slideshow_default) checked_state = 'checked';
  args.content = args.content + eejs.require('ep_slideshow/templates/slideshow_entry.ejs', {checked : checked_state});
  return cb();
}

exports.eejsBlock_styles = function (hook_name, args, cb)
{
  args.content = args.content + '<link href="../static/plugins/ep_slideshow/static/css/slideshow.css" rel="stylesheet">';
} 

exports.eejsBlock_scripts = function (hook_name, args, cb)
{
  args.content = args.content + '<script src="../static/plugins/ep_slideshow/static/js/jquery.event.move.js"></script>';
  args.content = args.content + '<script src="../static/plugins/ep_slideshow/static/js/jquery.event.swipe.js"></script>';
}

