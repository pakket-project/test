#!/bin/bash

files=("packages/bat/0.18.0/metadata.toml" "packages/bat/0.18.0/package" "packages/neofetch/7.1.0/package" "packages/pfetch/package.toml")
regex="(packages\/)([^\/]*)\/([^\/]*)\/([^\n]*)"

for file in "${files[@]}"; do
    if [[ $file =~ $regex ]]
    then
        echo "packages/${BASH_REMATCH[2]} ${BASH_REMATCH[3]}"
    else
        echo "$file doesn't match" >&2 # this could get noisy if there are a lot of non-matching files
    fi
done