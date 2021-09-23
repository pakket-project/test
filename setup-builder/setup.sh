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

wget "https://core.pakket.sh/pakket-builder/$arch/pakket-builder" -O "$HOME/.local/bin/pakket-builder"

pakket-builder -h