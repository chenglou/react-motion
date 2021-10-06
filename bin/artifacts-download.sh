#!/bin/sh
# shellcheck shell=dash

#
# Downloads build artifacts from buildkite.
#
# Usage: ./artifact-download.sh
#

set -e

cd "$(dirname "$0")/../"

echo '--- Downloading build artifacts'

# Prepare the artifacts folder:
rm -rf ci/artifacts
mkdir -p ci/artifacts

# Download artifacts:
buildkite-agent artifact download "*.tar.gz" .

# Remove existing artifacts content:
rm -rf ci/node_modules build lib

# Extract artifacts:
for FILE in ci/artifacts/*.tar.gz; do
  tar -xf "$FILE"
done

echo # Newline for better readability
