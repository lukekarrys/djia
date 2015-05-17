import debugThe from 'debug'
import async from 'async'

const debug = debugThe('djia:main')

const dow = (request, url, cache, date, cb) => {
  const tasks = [
    (_cb) => {
      if (!date) {
        _cb(new Error('A date must be specified'))
      } else {
        _cb(null, {date})
      }
    },

    (data = {}, _cb) => {
      if (cache) {
        cache.get(data.date, (err, djia) => _cb(err, {djia, fromCache: true}))
      } else {
        _cb(null, data)
      }
    },

    (data = {}, _cb) => {
      if (data.fromCache) {
        _cb(null, data)
      } else {
        request(url + data.date, (error, response, body) => {
          const success = !error && response.statusCode === 200
          const value = body.replace(/\n/g, ' ')

          debug(`Code: ${response.statusCode}`)
          debug(`Response: ${value}`)

          if (success) {
            _cb(null, {djia: value, fromCache: false, date: data.date})
          } else {
            _cb(new Error(value.replace(/^error /, '')))
          }
        })
      }
    },

    (data = {}, _cb) => {
      if (cache && !data.fromCache) {
        cache.set(date.date, data.djia, (err) => {
          _cb(err, data)
        })
      } else {
        _cb(null, data)
      }
    }
  ]

  async.waterfall(tasks, (err, result) => {
    if (err) return cb(err)

    const djia = Number(result.djia)

    if (typeof djia === 'number' && !isNaN(djia)) {
      cb(null, djia)
    } else {
      cb(new Error('Data was not a valid number'))
    }
  })
}

export default dow
