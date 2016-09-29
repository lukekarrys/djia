import fs from 'fs'
import path from 'path'
import test from 'tape'
import rimraf from 'rimraf'
import nock from 'nock'

import djia from '../src/index'

const domain = 'http://geo.crox.net/djia'
const date = '2015-03-27'
const DOW_VALUE = 17673.63
const date2 = '2015-03-26'
const DOW_VALUE2 = 17716.27

const mock = (d, ...reply) => nock(domain).get(`/${d}`).reply(...reply)

test('Can fetch from server', (t) => {
  let after = false

  mock(date, 200, DOW_VALUE)

  djia(date, (err, val) => {
    t.equal(err, null, 'No error')
    t.equal(val, DOW_VALUE, 'Amount is correct')
    t.equal(after, true)
    t.end()
  })

  after = true
})

test('Can fetch from server and cache and then retrieve from cache', (t) => {
  const topCacheDir = path.join(path.resolve(__dirname, '..'), 'testcache')
  const cache = path.join(topCacheDir, 'testcache2')
  const cacheFile = path.join(cache, 'djia_cache.json')
  let after1 = false
  let after2 = false

  mock(date, 200, DOW_VALUE)

  djia({date, cache}, (err, val) => {
    t.equal(fs.existsSync(cacheFile), true, 'Cache file exists')
    t.equal(err, null, 'No error')
    t.equal(val, DOW_VALUE, 'Amount is correct')
    t.equal(after1, true)

    djia({date, cache}, (err, val) => {
      t.equal(fs.existsSync(cacheFile), true, 'Cache file exists')
      t.equal(err, null, 'No error')
      t.equal(val, DOW_VALUE, 'Amount is correct')
      t.equal(after2, true)

      rimraf(topCacheDir, (err) => {
        t.equal(err, null, 'Cache dir is deleted')
        t.equal(fs.existsSync(cacheFile), false, 'Cache file is deleted')
        t.end()
      })
    })

    after2 = true
  })

  after1 = true
})

test('Can cache multiple values', (t) => {
  const topCacheDir = path.join(path.resolve(__dirname, '..'), 'testcache')
  const cache = path.join(topCacheDir, 'testcache2')
  const cacheFile = path.join(cache, 'djia_cache.json')

  mock(date, 200, DOW_VALUE)

  djia({date, cache}, (err, val) => {
    t.equal(fs.existsSync(cacheFile), true, 'Cache file exists')
    t.equal(err, null, 'No error')
    t.equal(val, DOW_VALUE, 'Amount is correct')

    mock(date2, 200, DOW_VALUE2)

    djia({date: date2, cache}, (err, val) => {
      t.equal(fs.existsSync(cacheFile), true, 'Cache file exists')
      t.equal(err, null, 'No error')
      t.equal(val, DOW_VALUE2, 'Amount is correct')

      const cacheVals = JSON.parse(fs.readFileSync(cacheFile))
      t.equal(cacheVals[date], DOW_VALUE, `Can get cached value directly from file ${date}`)
      t.equal(cacheVals[date2], DOW_VALUE2, `Can get cached value directly from file ${date2}`)

      rimraf(topCacheDir, (err) => {
        t.equal(err, null, 'Cache dir is deleted')
        t.equal(fs.existsSync(cacheFile), false, 'Cache file is deleted')
        t.end()
      })
    })
  })
})

test('Can cache to a json file', (t) => {
  const cache = path.join(path.resolve(__dirname, '..'), 'custom_cache.json')

  mock(date, 200, DOW_VALUE)

  djia({date, cache}, (err, val) => {
    t.equal(fs.existsSync(cache), true, 'Cache file exists')
    t.equal(err, null, 'No error')
    t.equal(val, DOW_VALUE, 'Amount is correct')

    const cacheVals = JSON.parse(fs.readFileSync(cache))
    t.equal(cacheVals[date], DOW_VALUE, `Can get cached value directly from file ${date}`)

    fs.unlinkSync(cache)
    t.equal(fs.existsSync(cache), false, 'Cache file is deleted')
    t.end()
  })
})

test('Too old', (t) => {
  const d = '1900-01-01'
  mock(d, 404, 'error\ndate too much in the past')

  djia(d, (err) => {
    t.equal(err instanceof Error, true, 'Error is an error')
    t.equal(err.message, 'date too much in the past', 'Error says date is too old')
    t.end()
  })
})

test('Too new', (t) => {
  const d = '2999-01-01'
  mock(d, 404, 'error\ndata not available yet')

  djia(d, (err) => {
    t.equal(err instanceof Error, true, 'Error is an error')
    t.equal(err.message, 'data not available yet', 'Error says data isn\'t available')
    t.end()
  })
})
