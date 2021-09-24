import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'

async function get(): Promise<string> {
  const toolPath = tc.find('pakket-builder', '0.0.1')
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
    `https://core.pakket.sh/pakket-builder/${arch}/pakket-builder`
  )

  const cachedDir = await tc.cacheDir(downloadPath, 'pakket-builder', '0.0.1')
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
