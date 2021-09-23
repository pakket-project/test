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
echo "::add-path::$HOME/.local/bin"

wget "https://core.pakket.sh/pakket-builder/$arch/pakket-builder" -q -O "$HOME/.local/bin/pakket-builder"
chmod +x "$HOME/.local/bin/pakket-builder"

ls "$HOME/.local/bin"
~/.local/bin/pakket-builder -h
pakket-builder -h