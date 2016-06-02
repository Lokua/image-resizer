# process-images

> Create multiple sized variants of images for use with the HTML5 `srcset`
  attribute.

## Install

```sh
npm i -g lokua/process-images
```

Note that `process-images` uses [sharp][0] for image processing,
so you might have to follow their instructions to meet all requirements.

## Usage

`process-images` operates on an input file or directory, and
produces resized copies to an output directory. Images are resized according
to a list of widths provided (height is automatically determined by
aspect ratio). The program is available for both programmatic and command line
usage.

# API

At the very least `process-images` requires `input`, `output`, and `sizes`
arguments. Each output file will have `__<size>` appened to the name, so
input `foo.jpg` with a size of 200 would result in `foo__200.jpg`.

### Programmatic usage example:

```js
import processImages from 'process-images'

processImages({

  // input can be a single file or directory
  input: 'input/dir',

  output: 'some/directory',

  // list of pixel width constraints
  sizes: [200, 400, 600, 800],

  // if true, uses `slug` to name output files in a url-friendly way
  slugify: false,
  debug: false
}).then(results => {
  // results is an array of arrays. Each inner array contains objects for
  // each resize action, containting the `sharp#resize` result data, as well
  // the original file name and the result of calling `path.parse`
  // on the output file.
  //
  // Example snippet from running this repo's tests on the authors machine:
  // [
  //   [ // inner array created for each file found in `input`
  //     { // object created for each size in `sizes`
  //       "originalFile": "/home/a/process-images/test/fixtures/tiger.jpg",
  //       "pathInfo": {
  //         "root": "/",
  //         "dir": "/home/a/process-images/test/out",
  //         "base": "tiger__200.jpg",
  //         "ext": ".jpg",
  //         "name": "tiger__200"
  //       },
  //       "info": {
  //         "format": "jpeg",
  //         "width": 200,
  //         "height": 133,
  //         "channels": 3,
  //         "size": 6125
  //       }
  //     },
  //     ...
  //   ],
  //   ...
  // ]
})
```

### CLI usage example:

The CLI works the same as the programmatic API, except that results
are run through `JSON.stringify` and printed to stdout. Note that values
passed to the `--sizes, -s` options cannot contain spaces.

```sh
resize-images -i /absolute/input/path -o /absolute/output/path -s 200,400,600,800
# optional flags:
#   -d, --debug
#   -S, --slugify
```

## MIT Licensed

[0]: http://sharp.dimens.io/
