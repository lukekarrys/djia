import xhr from 'xhr'
import {AsyncStorage} from 'react-native'
import debugThe from 'debug'

import djia from './main'

const debug = debugThe('djia:react-native')
const DJIA_URL = 'https://geo.crox.net/djia/'
const DEF_CACHE_PREFIX = '@djia:'

const dow = (options, cb) => {
  let cachePrefix, cacheMethods

  if (typeof options === 'object') {
    cachePrefix = options.cache === true ? DEF_CACHE_PREFIX : options.cache
  }

  if (cachePrefix) {
    debug(`Cache prefix: ${cachePrefix}`)
    cacheMethods = {
      get (date, _cb) {
        AsyncStorage.getItem(cachePrefix + date)
        .then((value) => _cb(null, value))
        .catch((err) => _cb(err))
        .done()
      },
      set (date, value, _cb) {
        AsyncStorage.setItem(cachePrefix + date, value)
        .then(() => _cb(null))
        .catch((err) => _cb(err))
        .done()
      }
    }
  } else {
    debug('No cache option')
  }

  djia(options, DJIA_URL, cacheMethods, xhr, cb)
}

export default dow
