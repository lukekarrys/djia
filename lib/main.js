'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _dowHasData = require('./dowHasData');

var _dowHasData2 = _interopRequireDefault(_dowHasData);

var debug = _debug2['default']('djia:main');
var isValidNumber = function isValidNumber(val) {
  return typeof val === 'number' && !isNaN(val);
};

var dow = function dow(options, url, cache, request, cb) {
  var date = undefined,
      __now = undefined;

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
  function (_x, _cb) {
    var data = arguments[0] === undefined ? {} : arguments[0];

    if (!_dowHasData2['default'](date, __now)) {
      _cb(new Error('data not available yet'));
    } else {
      _cb(null, data);
    }
  },

  // Get value from cache if possible
  function (_x2, _cb) {
    var data = arguments[0] === undefined ? {} : arguments[0];

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
  function (_x3, _cb) {
    var data = arguments[0] === undefined ? {} : arguments[0];

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
  function (_x4, _cb) {
    var data = arguments[0] === undefined ? {} : arguments[0];

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
  }];

  _async2['default'].waterfall(tasks, function (err, result) {
    if (err) return cb(err);

    var djia = Number(result.djia);

    if (isValidNumber(djia)) {
      cb(null, djia);
    } else {
      cb(new Error('Value was not a valid number'));
    }
  });
};

exports['default'] = dow;
module.exports = exports['default'];