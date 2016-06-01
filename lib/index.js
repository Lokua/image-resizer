#!/usr/bin/env node
require('babel-register')
require('babel-polyfill')

if (require.main === module) {
  require('./cli')
} else {
  module.exports = require('./process-images').default
}
