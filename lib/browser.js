'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _xhr = require('xhr');

var _xhr2 = _interopRequireDefault(_xhr);

var _localforage = require('localforage');

var _localforage2 = _interopRequireDefault(_localforage);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

var debug = _debug2['default']('djia:browser');
var DJIA_URL = 'http://crossorigin.me/http://geo.crox.net/djia/';
var DEF_CACHE_PREFIX = 'djia_';

var dow = function dow(options, cb) {
  var cachePrefix = undefined,
      cacheMethods = undefined;

  if (typeof options === 'object') {
    cachePrefix = options.cache === true ? DEF_CACHE_PREFIX : options.cache;
  }

  if (cachePrefix) {
    debug('Cache prefix: ' + cachePrefix);
    cacheMethods = {
      get: function get(date, _cb) {
        _localforage2['default'].getItem(cachePrefix + date, _cb);
      },
      set: function set(date, value, _cb) {
        _localforage2['default'].setItem(cachePrefix + date, value, _cb);
      }
    };
  } else {
    debug('No cache option');
  }

  _main2['default'](options, DJIA_URL, cacheMethods, _xhr2['default'], cb);
};

exports['default'] = dow;
module.exports = exports['default'];