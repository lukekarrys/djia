import debugThe from 'debug'
import waterfall from 'async/waterfall'
import asyncify from 'async/ensureAsync'

import dowHasData from './dowHasData'

const debug = debugThe('djia:main')
const isValidNumber = (val) => typeof val === 'number' && !isNaN(val)

const dow = (options, url, cache, request, cb) => {
  let date, __now

  if (typeof options === 'string') {
    date = options
  } else {
    date = options.date
    __now = options.__now
  }

  debug(`Date: ${date}`)
  debug(`Now: ${__now}`)

  const tasks = [
    // Validate that date exists
    (_cb) => {
      if (!date) {
        _cb(new Error('A date must be specified'))
      } else {
        _cb(null, {date})
      }
    },

    // Validate that dow data exists for date
    (data = {}, _cb) => {
      if (!dowHasData(date, __now)) {
        _cb(new Error('data not available yet'))
      } else {
        _cb(null, data)
      }
    },

    // Get value from cache if possible
    (data = {}, _cb) => {
      if (cache) {
        cache.get(date, (err, djia) => {
          if (err) {
            debug(`Cache err: ${err}`)
            _cb(err)
          } else if (djia == null) {
            debug(`No cache value: ${djia}`)
            _cb(null, data)
          } else {
            debug(`From cache: ${date} ${djia}`)
            _cb(err, {djia, fromCache: true})
          }
        })
      } else {
        _cb(null, data)
      }
    },

    // Get value from internet if there is no cache val
    (data = {}, _cb) => {
      if (data.fromCache) {
        _cb(null, data)
      } else {
        request(url + date, (error, response, body) => {
          const success = !error && response.statusCode === 200
          const value = (body || '').replace(/\n/g, ' ')

          if (!success) {
            return _cb(new Error((value || 'data not available').replace(/^error /, '')))
          }

          const numValue = Number(value)

          debug(`Request code: ${response.statusCode}`)
          debug(`Request value: ${numValue}`)

          if (isValidNumber(numValue)) {
            _cb(null, {djia: numValue, fromCache: false, date: date})
          } else {
            _cb(new Error('Value is not a valid number'))
          }
        })
      }
    },

    // Set cache if the value is new
    (data = {}, _cb) => {
      if (cache && !data.fromCache) {
        cache.set(date, data.djia, (err) => {
          if (err) {
            debug(`Error setting cache: ${err}`)
            _cb(err)
          } else {
            debug(`Set cache: ${date} ${data.djia}`)
            _cb(null, data)
          }
        })
      } else {
        _cb(null, data)
      }
    }
  ].map(fn => asyncify(fn))

  waterfall(tasks, (err, result) => {
    if (err) return cb(err)

    const djia = Number(result.djia)

    if (isValidNumber(djia)) {
      cb(null, djia)
    } else {
      cb(new Error('Value was not a valid number'))
    }
  })
}

export default dow
