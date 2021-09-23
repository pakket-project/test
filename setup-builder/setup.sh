#! /usr/bin/env bash

arch=$(uname -m)

if [ "$arch" == "arm64" ]
then
    arch="silicon"
elif [ "$arch" == "x86_64" ]
then
    arch="intel"
fi

echo "$HOME/.local/bin" >> "$GITHUB_PATH"

brew --help

# wget "https://core.pakket.sh/pakket-builder/$arch/pakket-builder"
# install pakket-builder "$HOME/.local/bin"

# pakket-builder -h