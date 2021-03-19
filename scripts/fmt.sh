#!/usr/bin/env bash

tool_dir=./vendor/tools
dprint_bin="$tool_dir/dprint"

if [ ! -x "$dprint_bin" ]; then
    echo "downloading dprint..."

    case $(uname -s) in
    Darwin) target="x86_64-apple-darwin" ;;
    *) target="x86_64-unknown-linux-gnu" ;;
    esac

    if [ $(uname -m) != "x86_64" ]; then
        echo "Unsupported architecture $(uname -m). Only x64 binaries are available."
        exit
    fi

    dprint_asset_path=$(
        command curl -sSf https://github.com/dprint/dprint/releases |
            command grep -o "/dprint/dprint/releases/download/.*/dprint-${target}\\.zip" |
            command head -n 1
	)
	if [ ! "$dprint_asset_path" ]; then exit 1; fi
	dprint_uri="https://github.com${dprint_asset_path}"

    mkdir -p "$tool_dir"

    curl --fail --location --progress-bar --output "$dprint_bin.zip" "$dprint_uri"
    unzip -o "$dprint_bin.zip" -d "$tool_dir"
    chmod +x "$dprint_bin"
    rm "$dprint_bin.zip"

    echo "dprint downloaded successfully"
fi

$dprint_bin fmt