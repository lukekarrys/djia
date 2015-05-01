import fs from 'fs'
import path from 'path'
import test from 'tape'
import moment from 'moment'
import rimraf from 'rimraf'

import djia from '../src/index'

const date = '2015-03-27'
const DOW_VALUE = 17673.63

test('Can fetch from server', (t) => {
  djia(date, (err, val) => {
    t.equal(err, null, 'No error')
    t.equal(val, DOW_VALUE, 'Amount is correct')
    t.end()
  })
})

test('Can fetch from server and cache and then retrieve from cache', (t) => {
  const topCacheDir = path.join(path.resolve(__dirname, '..'), 'testcache')
  const cache = path.join(topCacheDir, 'testcache2')
  const cacheFile = path.join(cache, 'cache.json')

  djia({date, cache}, (err, val) => {
    t.equal(fs.existsSync(cacheFile), true, 'Cache file exists')
    t.equal(err, null, 'No error')
    t.equal(val, DOW_VALUE, 'Amount is correct')

    djia({date, cache}, (err, val) => {
      t.equal(fs.existsSync(cacheFile), true, 'Cache file exists')
      t.equal(err, null, 'No error')
      t.equal(val, DOW_VALUE, 'Amount is correct')
      rimraf(topCacheDir, (err) => {
        t.equal(err, null, 'Cache dir is deleted')
        t.equal(fs.existsSync(cacheFile), false, 'Cache file is deleted')
        t.end()
      })
    })
  })
})

test('Too old', (t) => {
  djia('1900-01-01', (err) => {
    t.equal(err instanceof Error, true, 'Error is an error')
    t.equal(err.message, 'date too much in the past', 'Error says date is too old')
    t.end()
  })
})

test('Too new', (t) => {
  djia('2999-01-01', (err) => {
    t.equal(err instanceof Error, true, 'Error is an error')
    t.equal(err.message, 'data not available yet', 'Error says data isn\'t available')
    t.end()
  })
})
