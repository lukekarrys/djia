import request from 'request'
import debugThe from 'debug'
import flatCache from 'flat-cache'
import path from 'path'

import djia from './main'

const debug = debugThe('djia:node')
const DJIA_URL = 'http://geo.crox.net/djia/'
const HOME_DIR = process.env[process.platform === 'win32' ? 'USERPROFILE' : 'HOME']
const DEF_CACHE_DIR = path.join(HOME_DIR, '.config', 'djia')
const DEF_CACHE_NAME = 'djia_cache.json'

const dow = (options, cb) => {
  let cacheOpt, cacheName, cacheDir, cache, cacheMethods

  if (typeof options === 'object') {
    cacheOpt = options.cache === true ? DEF_CACHE_DIR : options.cache
  }

  if (cacheOpt) {
    debug(`Cache option: ${cacheOpt}`)

    // If our cache ends in a part with .json then use that as
    // the cache name and the rest as the cacheDir
    const base = path.basename(cacheOpt)
    const extName = path.extname(base)
    debug(`base/ext: ${base} ${extName}`)

    if (extName === '.json') {
      cacheName = base
      cacheDir = path.dirname(cacheOpt)
    } else {
      cacheName = DEF_CACHE_NAME
      cacheDir = cacheOpt
    }

    debug(`Cache: ${cacheDir} ${cacheName}`)
    cache = flatCache.load(cacheName, cacheDir)

    cacheMethods = {
      get (date, _cb) {
        _cb(null, cache.getKey(date))
      },
      set (date, value, _cb) {
        cache.setKey(date, value)
        cache.save(true) // Dont prune
        _cb(null)
      }
    }
  } else {
    debug('No cache option')
  }

  djia(options, DJIA_URL, cacheMethods, request, cb)
}

export default dow
