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
  if (config.debug) logger.options.level = Logger.DEBUG
  logger.debug('config:\n', config)

  checkConfig(config)

  const input = path.resolve(config.input)
  const inputIsFile = await isFile(input)

  // read input files, filtering out non-images
  const files = inputIsFile ? [path.basename(input)] : await getImages(input)

  // create output dir if not exists
  const output = path.resolve(config.output)
  await ensureOutput(output)

  // resize and perform write actions
  const all = await files.map(async file => {
    const absolutePath = inputIsFile ? input : `${input}/${file}`
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

        const imageInfo = await sharp(absolutePath)
          .resize(Number(size), null)
          .toFile(out)

        return {
          originalFile: absolutePath,
          pathInfo: path.parse(`${output}/${fileName}__${size}.${ext}`),
          imageInfo
        }

      } catch (err) {
        logger.error('write block err:', absolutePath)
        process.exit(1)
      }
    })

    return await Promise.all(writes)
  })

  return await Promise.all(all)
}

export async function isFile(file) {
  const is = await fs.stat(file).then(stats => stats.isFile())
  logger.debug('processing single file?', is)

  return is
}

export async function getImages(dir) {
  return await fs.readdir(path.resolve(dir))
    .then(files => files.filter(file =>
      supportedTypes.includes(path.extname(file.toLowerCase()).slice(1))
    ))
}

export async function ensureOutput(output) {
  const exists = await fs.exists(output)
  if (!exists) {
    logger.debug('creating output directory')
    await fs.mkdir(output)
  }
}

export function checkConfig(config) {
  if (!config.input) {
    throw new TypeError('config.input must be a String')
  }
  if (!config.output) {
    throw new TypeError('config.output must be a String')
  }
  if (!config.sizes || !Array.isArray(config.sizes)) {
    throw new TypeError('config.sizes must be an Array')
  }
}
