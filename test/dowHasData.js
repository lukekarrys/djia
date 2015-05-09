import test from 'tape'

import d from '../src/dowHasData'

test('has data', (t) => {
  t.equal(d('2015-05-05'), true, 'date in the past')
  t.equal(d('2015-05-16', '2015-05-15T12:00:00.000Z'), true)
  t.equal(d('2015-05-17', '2015-05-15T12:00:00.000Z'), true)
  t.equal(d('2015-05-25', '2015-05-22T12:00:00.000Z'), true)
  t.equal(d('2015-05-25', '2015-05-22T08:00:00.000Z'), false)
  t.end()
})
