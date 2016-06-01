import fs from 'mz/fs'
import path from 'path'
import sharp from 'sharp'
import slug from 'slug'
import Logger from 'lokua.net.node-logger'

const logger = new Logger('main', { level: Logger.ERROR })

const supportedTypes = ['jpg', 'jpeg', 'png', 'webp', 'tiff', 'gif', 'svg']

/**
 * @param  {Object} config
 * @prop config.input
 * @prop config.output
 * @prop config.debug
 * @prop config.sizes
 * @prop config.slugify
 * @return {Array[Promise]}
 */
export async function processImages(config) {
  if (config.debug) logger.setOptions({ level: Logger.DEBUG })
  logger.debug('config:', config)

  const files = await fs.readdir(path.resolve(config.input))

  const imageFiles = files.filter(file => {
    const ext = path.extname(file.toLowerCase()).slice(1)

    return supportedTypes.includes(ext)
  })

  const metadataPromises = await imageFiles.map(async file => {
    const absolutePath = `${config.input}/${file}`
    const metadata = await sharp(absolutePath).metadata()
    const ext = path.extname(file)

    metadata.__absolutePath = absolutePath
    metadata.__fileName = file.replace(ext, '')
    metadata.__ext = ext.slice(1).toLowerCase()

    if (config.slugify) {
      const pre = metadata.__fileName
      metadata.__fileName = slug(metadata.__fileName)
      logger.debug('%s >>slugified>> %s', pre, metadata.__fileName)
    }

    return metadata
  })

  const metadata = await Promise.all(metadataPromises)

  const output = path.resolve(config.output)
  const exists = await fs.exists(output)
  if (!exists) {
    logger.debug('creating output directory')
    await fs.mkdir(output)
  }

  const allWrites = await metadata.map(async data => {
    const { __absolutePath, __fileName, __ext } = data

    const writes = config.sizes.map(async size => {
      const out = `${output}/${__fileName}__${size}.${__ext}`
      try {

        logger.debug('writing', out)

        return await sharp(__absolutePath)
          .resize(+size, null)
          .toFile(out)

      } catch (err) {
        logger.error('err:', err)
        logger.debug('exiting')
        process.exit(1)
      }
    })

    return await Promise.all(writes)
  })

  return await Promise.all(allWrites)
}
