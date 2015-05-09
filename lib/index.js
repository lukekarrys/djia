'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _flatCache = require('flat-cache');

var _flatCache2 = _interopRequireDefault(_flatCache);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _dezalgo = require('dezalgo');

var _dezalgo2 = _interopRequireDefault(_dezalgo);

var _dowHasData = require('./dowHasData');

var _dowHasData2 = _interopRequireDefault(_dowHasData);

var debug = _debug2['default']('djia:main');

var DJIA_URL = 'http://geo.crox.net/djia/';
var HOME_DIR = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
var DEF_CACHE_DIR = _path2['default'].join(HOME_DIR, '.config', 'djia');
var DEF_CACHE_NAME = 'djia_cache.json';

var dow = function dow(options, cb) {
  var date = undefined,
      cacheOpt = undefined,
      cacheDir = undefined,
      cacheName = undefined,
      cache = undefined,
      cacheVal = undefined,
      __now = undefined;

  // Th͏e Da҉rk Pońy Lo͘r͠d HE ́C͡OM̴E̸S
  cb = _dezalgo2['default'](cb);

  if (typeof options === 'string') {
    date = options;
  } else {
    date = options.date;
    __now = options.__now;
    cacheOpt = options.cache === true ? DEF_CACHE_DIR : options.cache;
  }

  if (!date) return cb(new Error('A date must be specified'));
  if (!_dowHasData2['default'](date, __now)) return cb(new Error('data not available yet'));

  if (cacheOpt) {
    // If our cache ends in a part with .json then use that as
    // the cache name and the rest as the cacheDir
    var base = _path2['default'].basename(cacheOpt);
    var extName = _path2['default'].extname(base);
    debug('Cache option: ' + cacheOpt);
    debug('base/ext: ' + base + ' ' + extName);
    if (extName === '.json') {
      cacheName = base;
      cacheDir = _path2['default'].dirname(cacheOpt);
    } else {
      cacheName = DEF_CACHE_NAME;
      cacheDir = cacheOpt;
    }
  }

  if (cacheDir && cacheName) {
    debug('Cache: ' + cacheDir + ' ' + cacheName);
    // flat-cache prunes everything not read during this load session, but
    // there's no way to turn it off, so we should use a different module, but
    // for now just make prune a no-op.
    cache = _flatCache2['default'].load(cacheName, cacheDir);
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