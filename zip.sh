#!/bin/bash

zip -r source.zip * -x "*.DS_Store" "build/*" "dist/*" "node_modules/*" "vendor/*" ".git/*" "dist.zip" "source.zip"
zip -r dist.zip dist -x "*.DS_Store" "dist.zip" "source.zip" "dist/.git/*"
