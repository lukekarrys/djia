'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _xhr = require('xhr');

var _xhr2 = _interopRequireDefault(_xhr);

var _reactNative = require('react-native');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _main = require('./main');

var _main2 = _interopRequireDefault(_main);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('djia:react-native');
var DJIA_URL = 'http://geo.crox.net/djia/';
var DEF_CACHE_PREFIX = '@djia:';

var dow = function dow(options, cb) {
  var cachePrefix = void 0,
      cacheMethods = void 0;

  if ((typeof options === 'undefined' ? 'undefined' : _typeof(options)) === 'object') {
    cachePrefix = options.cache === true ? DEF_CACHE_PREFIX : options.cache;
  }

  if (cachePrefix) {
    debug('Cache prefix: ' + cachePrefix);
    cacheMethods = {
      get: function get(date, _cb) {
        _reactNative.AsyncStorage.getItem(cachePrefix + date).then(function (value) {
          return _cb(null, value);
        }).catch(function (err) {
          return _cb(err);
        }).done();
      },
      set: function set(date, value, _cb) {
        _reactNative.AsyncStorage.setItem(cachePrefix + date, value).then(function () {
          return _cb(null);
        }).catch(function (err) {
          return _cb(err);
        }).done();
      }
    };
  } else {
    debug('No cache option');
  }

  (0, _main2.default)(options, DJIA_URL, cacheMethods, _xhr2.default, cb);
};

exports.default = dow;