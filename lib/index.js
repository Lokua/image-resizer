#!/usr/bin/env node

// http://stackoverflow.com/a/35120765/2416000
require('babel-register')({
  ignore: false,
  only: './lib'
})
require('babel-polyfill')

if (require.main === module) {
  require('./cli')

} else {
  module.exports = require('./process-images').default
}
