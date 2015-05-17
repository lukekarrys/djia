import request from 'xhr'
import dz from 'dezalgo'

const CORS_PROXY = 'http://jsonp.afeld.me/?url='
const DJIA_URL = 'http://geo.crox.net/djia/'

const dow = (options, cb) => {
  let date

  // Th͏e Da҉rk Pońy Lo͘r͠d HE ́C͡OM̴E̸S
  cb = dz(cb)

  if (typeof options === 'string') {
    date = options
  } else {
    date = options.date
  }

  if (!date) return cb(new Error('A date must be specified'))

  request({url: CORS_PROXY + DJIA_URL + date, useXDR: true}, (error, response, body) => {
    const success = !error && response.statusCode === 200
    const value = body.replace(/\n/g, ' ')
    const numValue = Number(value)

    if (success && typeof numValue === 'number' && !isNaN(numValue)) {
      cb(null, numValue)
    } else {
      cb(new Error(value.replace(/^error /, '')))
    }
  })
}

export default dow
