#!/bin/bash
set -e
rsync -av --delete \
  index.html style.css game.js favicon.svg \
  ls-deb12-1:/var/www/multiplier/
