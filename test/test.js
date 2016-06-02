import fs from 'mz/fs'
import assert from 'assert'
import rimraf from 'rimraf-promise'
import processImages from '../lib'

const outDir = `${__dirname}/out`

const config = {
  input: `${__dirname}/fixtures`,
  output: outDir,
  sizes: [200, 400, 600, 800],
  debug: true,
  slugify: true
}

const test = async fn => {
  await fn()
  await rimraf(outDir)
}

const sequence = async iterable => (
  iterable.reduce((p, fn) => p.then(fn), Promise.resolve())
)

sequence([

  test(async () => {
    const results = await processImages(config)
    // console.log(JSON.stringify(results, null, 2))

    assert(results.length === 2)
    assert(results[0].length === 4)
    assert(results[1].length === 4)

    await results.map(async result => result.map(async ({ pathInfo }) => {
      const exists = await fs.exists(`${pathInfo.dir}/${pathInfo.base}`)
      assert(exists)
    }))
  }),

  test(async () => {
    const results = await processImages(
      Object.assign({}, config, { input: `${__dirname}/fixtures/tiger.jpg` })
    )

    assert(results.length === 1)
    assert(results[0].length === 4)

    await results[0].map(async ({ pathInfo }) => {
      const exists = await fs.exists(`${pathInfo.dir}/${pathInfo.base}`)
      assert(exists)
    })
  })
]).then(() => console.log('Done'))
  .catch(console.error.bind(console, 'caught err:'))
