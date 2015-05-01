import fs from 'fs'
import path from 'path'
import test from 'tape'
import moment from 'moment'

import djia from '../src/index'

test('Can fetch from server', (t) => {
  djia('2015-03-27', (err, val) => {
    t.equal(err, null, 'No error')
    t.equal(val, 17673.63, 'Amount is correct')
    t.end()
  })
})

test('Can fetch from server and cache and then retrieve from cache', (t) => {
  const cache = path.resolve(__dirname, '..')
  const cacheFile = path.join(cache, 'dija.json')

  djia({date: '2015-03-27', cache}, (err, val) => {
    t.equal(fs.existsSync(cacheFile), true, 'Cache file exists')
    t.equal(err, null, 'No error')
    t.equal(val, 17673.63, 'Amount is correct')

    djia({date: '2015-03-27', cache}, (err, val) => {
      t.equal(fs.existsSync(cacheFile), true, 'Cache file exists')
      t.equal(err, null, 'No error')
      t.equal(val, 17673.63, 'Amount is correct')
      fs.unlinkSync(cacheFile)
      t.equal(fs.existsSync(cacheFile), false, 'Cache file is deleted')
      t.end()
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
  // Next tuesday since sometimes market is closed on monday
  // This might not always work, but I'm not sure what the bulletproof
  // logic for this would look like
  djia(moment().day(10).format('YYYY-MM-DD'), (err) => {
    t.equal(err instanceof Error, true, 'Error is an error')
    t.equal(err.message, 'data not available yet', 'Error says data isn\'t available')
    t.end()
  })
})
