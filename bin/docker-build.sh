#!/bin/sh

export NODE_ENV=production

./bin/docker-node.sh ash -c "yarn install \
  --production=false \
  --frozen-lockfile &&
  yarn build"
