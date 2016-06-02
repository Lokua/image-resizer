import fs from 'mz/fs'
import execa from 'execa'
import assert from 'assert'
import rimraf from 'rimraf-promise'
import processImages from '../lib'

const outDir = `${__dirname}/out`

const config = {
  input: `${__dirname}/fixtures`,
  output: outDir,
  sizes: [200, 400, 600, 800],
  debug: false,
  slugify: true
}

const test = async (desc, fn) => {
  // console.log(`${desc} `)
  await fn()
  // console.log(`after ${desc}`)
  await rimraf(outDir)
  // return Promise.resolve(`(end) ${desc}`)
}

const sequence = async iterable => {
  return iterable.reduce((p, fn) => p.then(fn), Promise.resolve())
}

sequence([

  test('directory', async () => {
    const results = await processImages(config)
    // console.log(JSON.stringify(results, null, 2))

    assert(results.length === 2)
    assert(results[0].length === 4)
    assert(results[1].length === 4)

    results.forEach(result => result.forEach(({ pathInfo }) => {
      assert(fs.existsSync(`${pathInfo.dir}/${pathInfo.base}`))
    }))
  }),

  test('single file', async () => {
    const results = await processImages(
      Object.assign({}, config, { input: `${__dirname}/fixtures/tiger.jpg` })
    )

    assert(results.length === 1)
    assert(results[0].length === 4)

    results[0].forEach(({ pathInfo}) => {
      assert(fs.exists(`${pathInfo.dir}/${pathInfo.base}`))
    })
  }),

  test('cli', async () => {
    const cmd = 'node ./lib -i ./test/fixtures -o ./test/__out -s 200,300'
    const child = await execa.shell(cmd)
    const results = JSON.parse(child.stdout)

    assert(results.length === 2)
    assert(results[0].length === 2)
    assert(results[1].length === 2)

    results.forEach(result => result.forEach(({ pathInfo }) => {
      assert(fs.existsSync(`${pathInfo.dir}/${pathInfo.base}`))
    }))

    await rimraf(`${__dirname}/__out`)
  })
]).then(() => console.log('done'))
  .catch(err => console.error('err:', err))
