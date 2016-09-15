#!/bin/bash -e

babel=node_modules/.bin/babel
webpack=node_modules/.bin/webpack

src=./src
lib=lib
tests=tests

rm -rf $lib

NODE_ENV=production $webpack $src/index.js $lib/ReactRangesMultiple.js
NODE_ENV=production $webpack -p $src/index.js $lib/ReactRangesMultiple.min.js

printf "\nGzip: Minified size `gzip -c $lib/ReactRangesMultiple.min.js | wc -c | awk {'print $1/1000'}` bytes\n"
