# image-resizer (working title)

> Create multiple sized variants of images using [sharp][0]

## Install

```sh
git clone https://github.com/lokua/image-resizer.git
```

## Usage

This package is meant to process an entire directory (is not recursive, though).
Pass absolute input and output paths along with required
comma separated list of sizes to produce (spaces not allowed):

```sh
resize-images -i /absolute/input/path -o /absolute/output/path -s 200,400,600,800,1000
# optional flags:
#   -d, --debug
#   -S, --slugify uses `slug` module to output url-friendly file names
```

## MIT Licensed

[0]: http://sharp.dimens.io/
