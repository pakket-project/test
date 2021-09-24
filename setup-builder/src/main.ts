import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'

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

  core.info(`Downloading ${arch} version of pakket-builder`)

  const downloadPath = await tc.downloadTool(
    `https://core.pakket.sh/pakket-builder/pakket-builder-${arch}-${version}`
  )
  const dest = await tc.extractTar(downloadPath)

  const cachedDir = await tc.cacheDir(dest, 'pakket-builder', version)
  core.info(`Successfully cached pakket-builder to ${cachedDir}`)

  return cachedDir
}

async function run(): Promise<void> {
  try {
    const path = await get()
    core.info(path)
    core.info('setup complete!')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
