import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'

async function download(): Promise<void> {
  let arch = ''
  if (process.arch === 'x64') {
    arch = 'intel'
  } else if (process.arch === 'arm64') {
    arch = 'silicon'
  } else {
    core.setFailed('unsupported architecture')
  }

  core.info(`Downloading ${arch} version of pakket-builder`)

  tc.downloadTool(
    `https://core.pakket.sh/pakket-builder/${arch}/pakket-builder`
  )
}

async function run(): Promise<void> {
  try {
    await download()

    core.info('setup complete!')
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
