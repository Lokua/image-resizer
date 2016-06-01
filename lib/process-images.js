import fs from 'mz/fs'
import path from 'path'
import sharp from 'sharp'
import slug from 'slug'
import Logger from 'lokua.net.node-logger'

const logger = new Logger('process-images', {
  level: Logger.ERROR,
  format: ['name', 'level']
})

const supportedTypes = ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'gif', 'svg']

/**
 * @param  {Object}        config
 * @prop   {String}        config.input
 * @prop   {String}        config.output
 * @prop   {Boolean}       config.debug
 * @prop   {Array[Number]} config.sizes
 * @prop   {Boolean}       config.slugify
 * @return {Array[Promise]}
 */
export default async function processImages(config) {
  checkConfig(config)
  if (config.debug) logger.options.level = Logger.DEBUG
  logger.debug('config:', config)

  const inputIsFile = await isFile(config.input)

  // read input files, filtering out non-images
  let files

  if (inputIsFile) {
    files = [config.input]

  } else {
    files = await fs.readdir(path.resolve(config.input))
      .then(files => files.filter(file =>
        supportedTypes.includes(path.extname(file.toLowerCase()).slice(1))
      ))
  }

  // create output dir if not exists
  const output = path.resolve(config.output)
  const exists = await fs.exists(output)
  if (!exists) {
    logger.debug('creating output directory')
    await fs.mkdir(output)
  }

  // resize and perform write actions
  const all = await files.map(async file => {
    const absolutePath = `${config.input}/${file}`
    const extname = path.extname(file)
    const ext = extname.slice(1).toLowerCase()

    let fileName = file.replace(extname, '')
    // const metadata = await sharp(absolutePath).metadata()
    // logger.debug('metadata:', metadata)

    if (config.slugify) {
      const pre = fileName
      fileName = slug(fileName)
      logger.debug('%s => slug => %s', pre, fileName)
    }

    const writes = await config.sizes.map(async size => {
      const out = `${output}/${fileName}__${size}.${ext}`
      try {
        logger.debug('writing', out)

        const info = await sharp(absolutePath)
          .resize(+size, null)
          .toFile(out)

        return {
          originalName: fileName,
          fileName: `${fileName}__${size}.${ext}`,
          absolutePath: `${output}/${fileName}__${size}.${ext}`,
          ext: ext,
          info
        }

      } catch (err) {
        logger.error('err:', err)
        process.exit(1)
      }
    })

    return await Promise.all(writes)
  })

  return await Promise.all(all)
}

async function isFile(file) {
  return await fs.stat(file).then(stats => stats.isFile())
}

function checkConfig(config) {
  if (!config.input) {
    throw new TypeError('config.input must be a String or Array')
  }
  if (!config.output) {
    throw new TypeError('config.output must be a String')
  }
  if (!config.sizes || !Array.isArray(config.sizes)) {
    throw new TypeError('config.sizes must be an Array')
  }
}
