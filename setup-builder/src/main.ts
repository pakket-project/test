/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import {join} from 'path'

const version = '0.0.1'

async function get(): Promise<string> {
  const toolPath = tc.find('pakket-builder', version)
  // found in cache
  if (toolPath) {
    core.info(`Found in cache @ ${toolPath}`)
    return toolPath
  }

  let arch = ''
  if (process.arch === 'x64') {
    arch = 'intel'
  } else if (process.arch === 'arm64') {
    arch = 'silicon'
  } else {
    core.setFailed('unsupported architecture')
  }

  const url = `https://core.pakket.sh/pakket-builder/pakket-builder-${arch}-${version}.tar.xz`
  core.info(`Downloading ${arch} version of pakket-builder from ${url}`)

  const downloadPath = await tc.downloadTool(url)
  const dest = await tc.extractTar(downloadPath)

  const cachedDir = await tc.cacheDir(dest, 'pakket-builder', version)
  core.info(`Successfully cached pakket-builder to ${cachedDir}`)

  return cachedDir
}

async function run(): Promise<void> {
  try {
    // get pakket-builder
    const path = await get()

    // add to path
    core.addPath(join(path, 'pakket-builder', 'bin'))

    core.info('setup complete!')
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
