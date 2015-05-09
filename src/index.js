import request from 'request'
import debugThe from 'debug'
import flatCache from 'flat-cache'
import path from 'path'
import dz from 'dezalgo'

import dowHasData from './dowHasData'

const debug = debugThe('djia:main')

const DJIA_URL = 'http://geo.crox.net/djia/'
const HOME_DIR = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME']
const DEF_CACHE_DIR = path.join(HOME_DIR, '.config', 'djia')
const DEF_CACHE_NAME = 'djia_cache.json'

const dow = (options, cb) => {
  let date, cacheOpt, cacheDir, cacheName, cache, cacheVal, __now

  // Th͏e Da҉rk Pońy Lo͘r͠d HE ́C͡OM̴E̸S
  cb = dz(cb)

  if (typeof options === 'string') {
    date = options
  } else {
    date = options.date
    __now = options.__now
    cacheOpt = options.cache === true ? DEF_CACHE_DIR : options.cache
  }

  if (!date) return cb(new Error('A date must be specified'))
  if (!dowHasData(date, __now)) return cb(new Error('data not available yet'))

  if (cacheOpt) {
    // If our cache ends in a part with .json then use that as
    // the cache name and the rest as the cacheDir
    const base = path.basename(cacheOpt)
    const extName = path.extname(base)
    debug(`Cache option: ${cacheOpt}`)
    debug(`base/ext: ${base} ${extName}`)
    if (extName === '.json') {
      cacheName = base
      cacheDir = path.dirname(cacheOpt)
    } else {
      cacheName = DEF_CACHE_NAME
      cacheDir = cacheOpt
    }
  }

  if (cacheDir && cacheName) {
    debug(`Cache: ${cacheDir} ${cacheName}`)
    // flat-cache prunes everything not read during this load session, but
    // there's no way to turn it off, so we should use a different module, but
    // for now just make prune a no-op.
    cache = flatCache.load(cacheName, cacheDir)
    cache._prune = () => {}
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
