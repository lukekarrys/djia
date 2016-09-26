import test from 'tape'
import localForage from 'localforage'
import parallel from 'async/parallel'

import djia from '../src/browser'

const date = '2015-03-27'
const DOW_VALUE = 17673.63
const date2 = '2015-03-26'
const DOW_VALUE2 = 17716.27

test('Can fetch from server', (t) => {
  let after = false

  djia(date, (err, val) => {
    t.equal(err, null, 'No error')
    t.equal(val, DOW_VALUE, 'Amount is correct')
    t.equal(after, true)
    t.end()
  })

  after = true
})

test('Can fetch from server multiple times', (t) => {
  let after1 = false
  let after2 = false

  djia({date}, (err, val) => {
    t.equal(err, null, 'No error')
    t.equal(val, DOW_VALUE, 'Amount is correct')
    t.equal(after1, true)

    djia({date}, (err, val) => {
      t.equal(err, null, 'No error')
      t.equal(val, DOW_VALUE, 'Amount is correct')
      t.equal(after2, true)
      t.end()
    })

    after2 = true
  })

  after1 = true
})

test('Can cache multiple values', (t) => {
  const cache = true
  let after1 = false
  let after2 = false

  djia({date, cache}, (err, val) => {
    console.log(err, val)
    t.equal(err, null, 'No error')
    t.equal(val, DOW_VALUE, 'Amount is correct')
    t.equal(after1, true)

    djia({date: date2, cache}, (err, val) => {
      console.log(err, val)
      t.equal(err, null, 'No error')
      t.equal(val, DOW_VALUE2, 'Amount is correct')
      t.equal(after2, true)

      parallel([
        (cb) => localForage.getItem('djia_' + date, cb),
        (cb) => localForage.getItem('djia_' + date2, cb)
      ], (err, results) => {
        t.notOk(err, 'No errors from local forage')
        t.equal(results[0], DOW_VALUE, `Can get cached value directly ${date}`)
        t.equal(results[1], DOW_VALUE2, `Can get cached value directly ${date2}`)
        t.end()
      })
    })

    after2 = true
  })

  after1 = true
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
