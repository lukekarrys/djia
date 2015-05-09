import moment from 'moment-timezone'
import debugThe from 'debug'

const debug = debugThe('djia:hasData')

const closedDates = {
  d: ['6', '0'],
  'YYYY-MM-DD': [
    // These can be deleted as they pass
    // New dates can be grabbed from http://wiki.xkcd.com/geohashing/Dow_holiday
    '2015-05-25',
    '2015-07-03',
    '2015-09-07',
    '2015-11-26',
    '2015-12-25'
  ]
}

// Tests a date for whether the market will be open on that date
// based on the data above. Closed for holidays and Sat/Sun
const marketOpen = (date) => {
  const closedKeys = Object.keys(closedDates)
  let format, closedKey, closedData

  for (let i = 0, m = closedKeys.length; i < m; i++) {
    closedKey = closedKeys[i]
    format = date.format(closedKey)
    closedData = closedDates[closedKey]

    if (closedData.indexOf(format) > -1) {
      debug(`Market is closed: ${closedKey} ${format}`)
      return false
    }
  }

  return true
}

const pastOpenBell = (date) => {
  const time = date.format('HHmm')
  const pastOpen = time >= '0930'
  debug(`Current time: ${time} Is open: ${pastOpen}`)
  return pastOpen
}

const dowHasData = (date, __now) => {
  const mDate = moment(date)
  const open = marketOpen(mDate)
  const nowDow = (__now ? moment(__now) : moment()).tz('America/New_York')
  const isBeforeDay = mDate.isBefore(nowDow, 'day')
  const isAfterDay = mDate.isAfter(nowDow, 'day')
  const isSameDay = mDate.isSame(nowDow, 'day')

  __now && debug(`Mocking time to: ${__now}`)
  debug(`Date: ${mDate.format()}`)
  debug(`Now Dow: ${nowDow.format()}`)
  debug(`Market open: ${open}`)
  debug(`Date is before: ${isBeforeDay }`)
  debug(`Date is after: ${isAfterDay }`)
  debug(`Date is same: ${isSameDay }`)

  // Anything before this day has valid data
  if (isBeforeDay) {
    debug('Date is in the past: true')
    return true
  }

  // If it the same day and the market will be open, then return true after 9:30am
  // Note that fetching from the data server might not have data
  // at exactly 9:30 but at least we start trying
  if (isSameDay && open) {
    debug('Date is today and will be open')
    return pastOpenBell(nowDow)
  }

  // If it is in the future and the market will be open, return false
  // since eventually we will get data for that day
  if (isAfterDay && open) {
    debug('Date is in the future and will be open: false')
    return false
  }

  // We have determined that our date is today or in the future
  // and the market will not be open on that day. We work backwards from the
  // requested date the first date that the market was open.
  let whileDay = mDate.clone()
  let previousOpenDay
  while (true) {
    if (marketOpen(whileDay)) {
      previousOpenDay = whileDay.clone()
      break
    }
    whileDay.subtract({days: 1})
  }

  debug(`Previous open day: ${previousOpenDay.format()}`)

  // We have previous open data that is before today.
  // So we are all good.
  if (previousOpenDay.isBefore(nowDow, 'day')) {
    debug('Previous open day is before now: true')
    return true
  }

  if (previousOpenDay.isSame(nowDow, 'day')) {
    debug('Previous open day is today')
    return pastOpenBell(nowDow)
  }

  return false
}

export default dowHasData
