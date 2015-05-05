'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _debugThe = require('debug');

var _debugThe2 = _interopRequireDefault(_debugThe);

var _flatCache = require('flat-cache');

var _flatCache2 = _interopRequireDefault(_flatCache);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _dz = require('dezalgo');

var _dz2 = _interopRequireDefault(_dz);

var debug = _debugThe2['default']('djia');
var DJIA_URL = 'http://geo.crox.net/djia/';
var HOME_DIR = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
var DEF_CACHE_DIR = _path2['default'].join(HOME_DIR, '.config', 'djia');
var CACHE_NAME = 'cache.json';

var dow = function dow(options, cb) {
  var date = undefined,
      cacheDir = undefined,
      cache = undefined,
      cacheVal = undefined;

  // Th͏e Da҉rk Pońy Lo͘r͠d HE ́C͡OM̴E̸S
  cb = _dz2['default'](cb);

  if (typeof options === 'string') {
    date = options;
  } else {
    date = options.date;
    cacheDir = options.cache === true ? DEF_CACHE_DIR : options.cache;
  }

  if (!date) {
    return cb(new Error('A date must be specified'));
  }if (cacheDir) {
    debug('Cache: ' + cacheDir);
    cache = _flatCache2['default'].load(CACHE_NAME, cacheDir);
    // flat-cache prunes everything not read during this load session
    // No way to turn it off so we should use a different module, but
    // for now just make prune a no-op
    cache._prune = function () {};
    cacheVal = cache.getKey(date);
  } else {
    debug('No cache');
  }

  if (cacheVal) {
    debug('From cache: ' + cacheVal);
    cb(null, cacheVal);
  } else {
    _request2['default'](DJIA_URL + date, function (error, response, body) {
      var success = !error && response.statusCode === 200;
      var value = body.replace(/\n/g, ' ');
      var numValue = Number(value);

      debug('Code: ' + response.statusCode);
      debug('Response: ' + value);

      if (success && typeof numValue === 'number' && !isNaN(numValue)) {
        if (cache) {
          cache.setKey(date, numValue);
          cache.save();
          debug('Save cache: ' + date + ':' + numValue);
        }
        cb(null, numValue);
      } else {
        cb(new Error(value.replace(/^error /, '')));
      }
    });
  }
};

exports['default'] = dow;
module.exports = exports['default'];