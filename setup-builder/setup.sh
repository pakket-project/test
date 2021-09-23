#! /usr/bin/env bash

arch=$(uname -m)

if [ "$arch" == "arm64" ]
then
    arch="silicon"
elif [ "$arch" == "x86_64" ]
then
    arch="intel"
fi

mkdir -p "$HOME/.local/bin"
echo "$HOME/.local/bin" >> "$GITHUB_PATH"

wget "https://core.pakket.sh/pakket-builder/$arch/pakket-builder" -q -O "$HOME/.local/bin/pakket-builder"
chmod +x "$HOME/.local/bin/pakket-builder"

ls "$HOME/.local/bin"
pakket-builder -h