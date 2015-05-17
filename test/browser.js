import test from 'tape'

import djia from '../src/browser'

const date = '2015-03-27'
const DOW_VALUE = 17673.63

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