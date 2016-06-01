# image-resizer

> Create multiple sized variants of images using [sharp][0]

## Install

```sh
git clone https://github.com/lokua/image-resizer.git
```

## Usage

Pass absolute input and output paths along with required comma separated list
of sizes to produce (spaces not allowed):

```sh
resize-images -i /absolute/input/path -o /absolute/output/path -s 200,400,600,800,1000
```

## MIT Licensed

[0]: http://sharp.dimens.io/
