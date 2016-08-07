'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _waterfall = require('async/waterfall');

var _waterfall2 = _interopRequireDefault(_waterfall);

var _ensureAsync = require('async/ensureAsync');

var _ensureAsync2 = _interopRequireDefault(_ensureAsync);

var _dowHasData = require('./dowHasData');

var _dowHasData2 = _interopRequireDefault(_dowHasData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('djia:main');
var isValidNumber = function isValidNumber(val) {
  return typeof val === 'number' && !isNaN(val);
};

var dow = function dow(options, url, cache, request, cb) {
  var date = void 0,
      __now = void 0;

  if (typeof options === 'string') {
    date = options;
  } else {
    date = options.date;
    __now = options.__now;
  }

  debug('Date: ' + date);
  debug('Now: ' + __now);

  var tasks = [
  // Validate that date exists
  function (_cb) {
    if (!date) {
      _cb(new Error('A date must be specified'));
    } else {
      _cb(null, { date: date });
    }
  },

  // Validate that dow data exists for date
  function () {
    var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var _cb = arguments[1];

    if (!(0, _dowHasData2.default)(date, __now)) {
      _cb(new Error('data not available yet'));
    } else {
      _cb(null, data);
    }
  },

  // Get value from cache if possible
  function () {
    var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var _cb = arguments[1];

    if (cache) {
      cache.get(date, function (err, djia) {
        if (err) {
          debug('Cache err: ' + err);
          _cb(err);
        } else if (djia == null) {
          debug('No cache value: ' + djia);
          _cb(null, data);
        } else {
          debug('From cache: ' + date + ' ' + djia);
          _cb(err, { djia: djia, fromCache: true });
        }
      });
    } else {
      _cb(null, data);
    }
  },

  // Get value from internet if there is no cache val
  function () {
    var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var _cb = arguments[1];

    if (data.fromCache) {
      _cb(null, data);
    } else {
      request(url + date, function (error, response, body) {
        var success = !error && response.statusCode === 200;
        var value = (body || '').replace(/\n/g, ' ');

        if (!success) {
          return _cb(new Error((value || 'data not available').replace(/^error /, '')));
        }

        var numValue = Number(value);

        debug('Request code: ' + response.statusCode);
        debug('Request value: ' + numValue);

        if (isValidNumber(numValue)) {
          _cb(null, { djia: numValue, fromCache: false, date: date });
        } else {
          _cb(new Error('Value is not a valid number'));
        }
      });
    }
  },

  // Set cache if the value is new
  function () {
    var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var _cb = arguments[1];

    if (cache && !data.fromCache) {
      cache.set(date, data.djia, function (err) {
        if (err) {
          debug('Error setting cache: ' + err);
          _cb(err);
        } else {
          debug('Set cache: ' + date + ' ' + data.djia);
          _cb(null, data);
        }
      });
    } else {
      _cb(null, data);
    }
  }].map(function (fn) {
    return (0, _ensureAsync2.default)(fn);
  });

  (0, _waterfall2.default)(tasks, function (err, result) {
    if (err) return cb(err);

    var djia = Number(result.djia);

    if (isValidNumber(djia)) {
      cb(null, djia);
    } else {
      cb(new Error('Value was not a valid number'));
    }
  });
};

exports.default = dow;