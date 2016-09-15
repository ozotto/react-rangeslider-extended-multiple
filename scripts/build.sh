#!/bin/bash -e

babel=node_modules/.bin/babel
webpack=node_modules/.bin/webpack

src=./src
lib=lib
tests=tests

rm -rf $lib

NODE_ENV=production $webpack $src/index.js $lib/ReactRangesliderExtendedMultiple.js
NODE_ENV=production $webpack -p $src/index.js $lib/ReactRangesliderExtendedMultiple.min.js

printf "\nGzip: Minified size `gzip -c $lib/ReactRangesliderExtendedMultiple.min.js | wc -c | awk {'print $1/1000'}` bytes\n"
