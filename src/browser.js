import xhr from 'xhr'
import localForage from 'localforage'
import debugThe from 'debug'

import djia from './main'

const debug = debugThe('djia:browser')
const DJIA_URL = 'http://crossorigin.me/http://geo.crox.net/djia/'
const DEF_CACHE_PREFIX = 'djia_'

const dow = (options, cb) => {
  let cachePrefix, cacheMethods

  if (typeof options === 'object') {
    cachePrefix = options.cache === true ? DEF_CACHE_PREFIX : options.cache
  }

  if (cachePrefix) {
    debug(`Cache prefix: ${cachePrefix}`)
    cacheMethods = {
      get (date, _cb) {
        localForage.getItem(cachePrefix + date, _cb)
      },
      set (date, value, _cb) {
        localForage.setItem(cachePrefix + date, value, _cb)
      }
    }
  } else {
    debug('No cache option')
  }

  djia(options, DJIA_URL, cacheMethods, xhr, cb)
}

export default dow
