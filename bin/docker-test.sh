#!/bin/sh

set -e

cd "$(dirname "$0")/../"

# Create the host volumes so the docker process does not create it as root:
mkdir -p \
  "$PWD/node_modules" \
  "$PWD/ci/node_modules" \
  "$PWD/../.yarncache"

set -- \
  -v "$PWD:/srv/www" \
  -v "$PWD/ci/node_modules:/srv/www/node_modules" \
  -v "$PWD/../.yarncache:/srv/www/.yarncache" \
  -e "YARN_CACHE_FOLDER=/srv/www/.yarncache" \
  --security-opt seccomp=$(pwd)/chrome.json \
  -e NODE_ENV \
  -w "/srv/www" \
  --rm \
  zenika/alpine-chrome:with-node \
  "$@"

# Must run as root on Buildkite to avoid permission issues.
# The root user is remapped to the buildkite-agent via userns-remap:
# https://docs.docker.com/engine/security/userns-remap/
#if [ "$BUILDKITE" = true ]; then
#  set -- --user root "$@"
#fi

docker run "$@"
