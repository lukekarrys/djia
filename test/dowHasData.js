import test from 'tape'

import d from '../src/dowHasData'

const openTs = 'T12:00:00-0400'
const closedTs = 'T09:00:00-0400'

test('has past data', (t) => {
  t.equal(d('2015-05-05'), true, 'date in the past')
  t.end()
})

test('does not have future data', (t) => {
  t.equal(d('2015-05-13', '2015-05-12' + openTs), false, 'open date in the future')
  t.end()
})

test('has data for today based on time', (t) => {
  const afterOpen = '2015-05-01' + openTs
  const beforeOpen = '2015-05-01' + closedTs
  t.equal(d('2015-05-01', afterOpen), true, 'today and time is past market is open')
  t.equal(d('2015-05-01', beforeOpen), false, 'today and time is before market is open')
  t.equal(d('2015-05-02', afterOpen), true, 'saturday and time is past market is open')
  t.equal(d('2015-05-02', beforeOpen), false, 'saturday and time is before market is open')
  t.equal(d('2015-05-03', afterOpen), true, 'sunday and time is past market is open')
  t.equal(d('2015-05-03', beforeOpen), false, 'sunday and time is before market is open')
  t.end()
})

test('this and next weekend data on a friday', (t) => {
  const friOpen = '2015-05-15' + openTs
  const friClosed = '2015-05-15' + closedTs
  const sat = '2015-05-16'
  const sun = '2015-05-17'
  const mon = '2015-05-18'
  const nextSun = '2015-05-24'
  t.equal(d(sat, friOpen), true, 'has saturday data on friday afternoon')
  t.equal(d(sun, friOpen), true, 'has sunday data on friday afternoon')
  t.equal(d(mon, friOpen), false, 'no monday data on friday afternoon')
  t.equal(d(sat, friClosed), false, 'no saturday data on friday morning')
  t.equal(d(sun, friClosed), false, 'no sunday data on friday morning')
  t.equal(d(mon, friClosed), false, 'no monday data on friday morning')
  t.equal(d(nextSun, friOpen), false, 'does not have following sunday data')
  t.end()
})

test('weekend data on weekends', (t) => {
  t.equal(d('2015-05-16', '2015-05-16'), true, 'has saturday data on saturday')
  t.equal(d('2015-05-17', '2015-05-16'), true, 'has sunday data on saturday')
  t.equal(d('2015-05-16', '2015-05-17'), true, 'has saturday data on sunday')
  t.equal(d('2015-05-17', '2015-05-17'), true, 'has sunday data on sunday')
  t.end()
})

test('memorial day holiday', (t) => {
  const memorialDay = '2015-05-25'
  const previousFri = '2015-05-22'
  const previousSat = '2015-05-23'
  const previousSun = '2015-05-24'
  t.equal(d(memorialDay, previousFri + openTs), true, 'has memorial day data on friday after market is open')
  t.equal(d(memorialDay, previousFri + closedTs), false, 'no memorial day data on friday before market is open')
  t.equal(d(memorialDay, previousSat), true, 'has memorial day data on saturday')
  t.equal(d(memorialDay, previousSun), true, 'has memorial day data on sun')
  t.equal(d(memorialDay, memorialDay), true, 'has memorial day data on memorial day')
  t.end()
})

test('4th of july on a tuesday', (t) => {
  const july4 = '2017-07-04'
  const before = '2017-07-03'
  const after = '2017-07-05'
  t.equal(d(july4, before + openTs), true, 'has july 4 data the day before after market is open')
  t.equal(d(july4, before + closedTs), false, 'no july 4 data the previous day before market is open')
  t.equal(d(july4, july4), true, 'has july 4 data on july 4')
  t.equal(d(july4, after), true, 'has july 4 data after')
  t.end()
})

test('After midnight in EST but before on west coast', (t) => {
  t.equal(d('2015-05-12', '2015-05-13T00:45:22-04:00'), true, 'Day before is open')
  t.equal(d('2015-05-13', '2015-05-13T00:45:22-04:00'), false, 'Day is closed')
  t.end()
})
