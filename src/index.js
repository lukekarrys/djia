import request from 'request'
import debugThe from 'debug'
import flatCache from 'flat-cache'
import path from 'path'
import dz from 'dezalgo'

const debug = debugThe('djia')
const DJIA_URL = 'http://geo.crox.net/djia/'
const HOME_DIR = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME']
const DEF_CACHE_DIR = path.join(HOME_DIR, '.config', 'djia')
const CACHE_NAME = 'cache.json'

const dow = (options, cb) => {
  let date, cacheDir, cache, cacheVal

  // Th͏e Da҉rk Pońy Lo͘r͠d HE ́C͡OM̴E̸S
  cb = dz(cb)

  if (typeof options === 'string') {
    date = options
  } else {
    date = options.date
    cacheDir = options.cache === true ? DEF_CACHE_DIR : options.cache
  }

  if (!date) return cb(new Error('A date must be specified'))

  if (cacheDir) {
    debug(`Cache: ${cacheDir}`)
    cache = flatCache.load(CACHE_NAME, cacheDir)
    cacheVal = cache.getKey(date)
  } else {
    debug('No cache')
  }

  if (cacheVal) {
    debug(`From cache: ${cacheVal}`)
    cb(null, cacheVal)
  } else {
    request(DJIA_URL + date, (error, response, body) => {
      const success = !error && response.statusCode === 200
      const value = body.replace(/\n/g, ' ')
      const numValue = Number(value)

      debug(`Code: ${response.statusCode}`)
      debug(`Response: ${value}`)

      if (success && typeof numValue === 'number' && !isNaN(numValue)) {
        if (cache) {
          cache.setKey(date, numValue)
          cache.save()
          debug(`Save cache: ${date}:${numValue}`)
        }
        cb(null, numValue)
      } else {
        cb(new Error(value.replace(/^error /, '')))
      }
    })
  }
}

export default dow
