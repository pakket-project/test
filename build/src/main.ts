/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {join} from 'path'

async function run(): Promise<void> {
  try {
    // /runner/core/packages
    const packagesPath = core.getInput('repoPath')
    // /runner/core/packages/neofetch/0.17.0/package
    const modifiedPaths = core.getInput('packagePaths').split(' ')

    for (const p of modifiedPaths) {
      const pathRegex = new RegExp(
        /(packages\/)([^/]*)\/([^/]*)\/([^\n]*)/g
      ).exec(p)

      if (pathRegex) {
        const pkg = pathRegex[2]
        const version = pathRegex[3]
        core.info(
          `pakket-builder build ${join(
            packagesPath,
            pkg
          )} ${version} -o ${pkg}-${version}`
        )
        // $GITHUB_WORKSPACE/core/packages/$name
      }
      core.info('')
    }

    // exec.getExecOutput("pakket-builder", ["build", "path", "version", "-o pkg+ver"])
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
