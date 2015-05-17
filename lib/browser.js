'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _xhr = require('xhr');

var _xhr2 = _interopRequireDefault(_xhr);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _dezalgo = require('dezalgo');

var _dezalgo2 = _interopRequireDefault(_dezalgo);

var debug = _debug2['default']('djia');
var DJIA_URL = 'http://geo.crox.net/djia/';

var dow = function dow(options, cb) {
  var date = undefined;

  // Th͏e Da҉rk Pońy Lo͘r͠d HE ́C͡OM̴E̸S
  cb = _dezalgo2['default'](cb);

  if (typeof options === 'string') {
    date = options;
  } else {
    date = options.date;
  }

  if (!date) return cb(new Error('A date must be specified'));

  debug('No cache');

  _xhr2['default'](DJIA_URL + date, function (error, response, body) {
    var success = !error && response.statusCode === 200;
    var value = body.replace(/\n/g, ' ');
    var numValue = Number(value);

    debug('Code: ' + response.statusCode);
    debug('Response: ' + value);

    if (success && typeof numValue === 'number' && !isNaN(numValue)) {
      cb(null, numValue);
    } else {
      cb(new Error(value.replace(/^error /, '')));
    }
  });
};

exports['default'] = dow;
module.exports = exports['default'];