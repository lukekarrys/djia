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

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var debug = _debug2['default']('djia:node');
var DJIA_URL = 'http://geo.crox.net/djia/';
var HOME_DIR = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME'];
var DEF_CACHE_DIR = _path2['default'].join(HOME_DIR, '.config', 'djia');
var DEF_CACHE_NAME = 'djia_cache.json';

var dow = function dow(options, cb) {
  var cacheOpt = undefined,
      cacheName = undefined,
      cacheDir = undefined,
      cache = undefined,
      cacheMethods = undefined;

  if (typeof options === 'object') {
    cacheOpt = options.cache === true ? DEF_CACHE_DIR : options.cache;
  }

  if (cacheOpt) {
    debug('Cache option: ' + cacheOpt);

    // If our cache ends in a part with .json then use that as
    // the cache name and the rest as the cacheDir
    var base = _path2['default'].basename(cacheOpt);
    var extName = _path2['default'].extname(base);
    debug('base/ext: ' + base + ' ' + extName);

    if (extName === '.json') {
      cacheName = base;
      cacheDir = _path2['default'].dirname(cacheOpt);
    } else {
      cacheName = DEF_CACHE_NAME;
      cacheDir = cacheOpt;
    }

    debug('Cache: ' + cacheDir + ' ' + cacheName);

    // flat-cache prunes everything not read during this load session, but
    // there's no way to turn it off, so we should use a different module, but
    // for now just make prune a no-op.
    cache = _flatCache2['default'].load(cacheName, cacheDir);
    cache._prune = function () {};

    cacheMethods = {
      get: function get(date, _cb) {
        _cb(null, cache.getKey(date));
      },
      set: function set(date, value, _cb) {
        cache.setKey(date, value);
        cache.save();
        _cb(null);
      }
    };
  } else {
    debug('No cache option');
  }

  _main2['default'](options, DJIA_URL, cacheMethods, _request2['default'], cb);
};

exports['default'] = dow;
module.exports = exports['default'];