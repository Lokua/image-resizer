import program from 'commander'
import pkg from '../package.json'
import processImages from './process-images'

program
  .version(pkg.version)
  .option('-i, --input <dir>', 'input directory')
  .option('-o, --output <dir>', 'output directory')
  .option('-s, --sizes <n...>',
    'image widths in pixels (comma separated, no spaces!)')
  .option('-d, --debug', 'output extra information to stdout')
  .option('-S, --slugify', 'output url-friendly image names')
  .parse(process.argv)

try {

  (async () => {

    const results = await processImages({
      input: program.input,
      output: program.output,
      sizes: program.sizes.split(','),
      debug: program.debug,
      slugify: program.slugify
    })

    console.log(JSON.stringify(results, null, 2))

  })()

} catch (err) {
  throw err
}
