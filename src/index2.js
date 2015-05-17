import request from 'request'
import debugThe from 'debug'
import flatCache from 'flat-cache'
import path from 'path'

import djia from './main'

const debug = debugThe('djia:node')
const DJIA_URL = 'http://geo.crox.net/djia/'
const HOME_DIR = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME']
const DEF_CACHE_DIR = path.join(HOME_DIR, '.config', 'djia')
const CACHE_NAME = 'cache.json'

const dow = (options, cb) => {
  let date, cacheDir, cache

  if (typeof options === 'string') {
    date = options
  } else {
    date = options.date
    cacheDir = options.cache === true ? DEF_CACHE_DIR : options.cache
  }

  if (cacheDir) {
    debug(`Cache: ${cacheDir}`)
    cache = flatCache.load(CACHE_NAME, cacheDir)
    // flat-cache prunes everything not read during this load session
    // No way to turn it off so we should use a different module, but
    // for now just make prune a no-op
    cache._prune = () => {}
    cacheVal = cache.getKey(date)
  } else {
    debug('No cache')
  }

  const cache = {
    get (date, cb) {

    },
    set (date, ) {

    }
  }


  djia(request, DJIA_URL, cache, date, cb)
}

export default dow
