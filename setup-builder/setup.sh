#! /usr/bin/env bash

arch=$(uname -m)

if [ "$arch" == "arm64" ]
then
    arch="silicon"
elif [ "$arch" == "x86_64" ]
then
    arch="intel"
fi

wget "https://core.pakket.sh/pakket-builder/$arch/pakket-builder" -O /usr/local/bin/pakket-builder

pakket-builder -h