/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {join} from 'path'

async function run(): Promise<void> {
  try {
    // /runner/core/packages
    const packagesPath = core.getInput('packagesPath', {required: true})
    // /runner/core/packages/neofetch/0.17.0/package
    const modifiedPaths = core
      .getInput('modifiedPaths', {required: true})
      .split(' ')
    const GH_WORKSPACE = process.env.GITHUB_WORKSPACE as string

    for (const p of modifiedPaths) {
      const pathRegex = new RegExp(
        /(packages\/)([^/]*)\/([^/]*)\/([^\n]*)/g
      ).exec(p)

      if (pathRegex) {
        const pkg = pathRegex[2]
        const version = pathRegex[3]

        const output = await exec.getExecOutput('pakket-builder', [
          'build',
          join(GH_WORKSPACE, packagesPath, pkg),
          version,
          '-o',
          join(GH_WORKSPACE, 'packages', pkg, '-', version)
        ])

        const stdout = output.stdout.split('\n')
        for (const line of stdout) {
          const regex = new RegExp(/checksum: ([A-Fa-f0-9]{64})/g).exec(line)
          if (regex) {
            const checksum = regex[1]
            core.info(checksum)
          }
        }
      }
    }
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
