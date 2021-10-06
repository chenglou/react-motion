#!/bin/sh

#
# Creates build artifacts for the Continuous Integration environment.
#
# Usage: ./artifacts-build.sh
#

set -e

cd "$(dirname "$0")/../"

echo '+++ Building project files'
./bin/docker-build.sh

echo # Newline for better readability

echo '+++ Packaging build artifacts'

# Remove any existing build artifacts
rm -rf ci/artifacts
mkdir -p ci/artifacts

for FOLDER in ci/node_modules build lib; do
  printf "Packaging %s folder ... " "$FOLDER"
  tar -czf "ci/artifacts/$(basename $FOLDER)".tar.gz "$FOLDER"/
  echo 'done'
done
