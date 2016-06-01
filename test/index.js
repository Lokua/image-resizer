'use strict'

const fs = require('mz/fs')
const assert = require('assert')
const rimraf = require('rimraf-promise')
const processImages = require('../lib')

const outDir = `${__dirname}/out`

const config = {
  input: `${__dirname}/fixtures`,
  output: outDir,
  sizes: [200,400,600,800],
  debug: true,
  slugify: true
}

processImages(config).then(results => {
  // console.log(JSON.stringify(results, null, 2))

  assert(results.length === 2)
  assert(results[0].length === 4)
  assert(results[1].length === 4)

  for (let i = 0; i < 4; i++) {
    assert(fs.existsSync(results[0][i].absolutePath))
    assert(fs.existsSync(results[1][i].absolutePath))
  }

  return rimraf(outDir)
}).catch(console.error.bind(console, 'test err:'))
