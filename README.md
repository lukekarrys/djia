djia
===================

[![Greenkeeper badge](https://badges.greenkeeper.io/lukekarrys/djia.svg)](https://greenkeeper.io/)

Get the opening Dow Jones Industrial Average for a date, or the most recent opening if the market is closed for that day.

It fetches data from a web service, with the option to cache the results for future requests.

I use this for [xkcd Geohashing](https://xkcd.com/426/).

[![NPM](https://nodei.co/npm/djia.png)](https://nodei.co/npm/djia/)
[![Build Status](https://travis-ci.org/lukekarrys/djia.png?branch=master)](https://travis-ci.org/lukekarrys/djia)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)


## Install

`npm install djia`


## Usage

```js
import djia from 'djia'

djia('2015-03-27', (err, value) => {
    // err: null
    // value: 17673.63
})

djia('1900-01-01', (err) => {
    // err: [Error: date too much in the past]
})

djia('2999-01-01', (err) => {
    // err: [Error: data not available yet]
})

// Cache the result in $HOME/.config/djia
djia({date: '2015-03-27' cache: true}, (err, value) => {})

// Cache it in your current directory
djia({date: '2015-03-27' cache: process.cwd()}, (err, value) => {})
```


## API

### `djia(options, callback)`

#### `options` (`YYYY-MM-DD` formatted date string or `object`)

The first paramter is either a `YYYY-MM-DD` date string or an object of options.

#### `options.date` (required, `YYYY-MM-DD` formatted date string)

If you are using the object form, then pass in the formatted date string using the `date` key.

#### `options.cache` (optional, can be `true` or path to cache directory/file in node or cache prefix in the browser)

Since the fetched data will never change (it is only for the opening value), it can make sense to cache it. There are slight differences in how this works if you are using it in the browser vs Node.

**Node**
If you pass in `true` then a cache directory will be created for you at `$HOME/.config/djia`. You can also pass in a path to your own cache directory or a `.json` file, and they will be created if they do not exist. If your path ends in `.json` thats where the cache will be, otherwise it is assumed you are passing in a direcotry and the path will be `DIRECTORY/djia_cache.json`.

**Browser**
It will use [`localforage`](https://www.npmjs.com/package/localforage) to cache everything. If you pass in `true` then each key will be prefixed with `djia_`, otherwise pass in a string and it will use that. The key format is `PREFIX_DATE`.

#### `callback(err, value)`

`err` will be an `Error` object with a message most likely from the web service.
`value` will be the Dow Jones opening value as a `number`.


## Contributing

This is written in ES6 and compiled to ES5 using [`babel`](https://babeljs.io/). The code you require will come from the `lib/` directory which gets compiled from `src/` before each `npm publish`.


## Tests

`npm test`


## License

MIT