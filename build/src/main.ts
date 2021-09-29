/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {join} from 'path'

async function run(): Promise<void> {
  try {
    const paths = core.getInput('paths').split(' ')

    for (const p of paths) {
      const pathRegex = new RegExp(
        /(packages\/)([^/]*)\/([^/]*)\/([^\n]*)/g
      ).exec(p)

      if (pathRegex) {
        core.info(`pkg: ${pathRegex[1]} version: ${pathRegex[2]}`)
      }
      core.info('')
    }

    // exec.getExecOutput("pakket-builder", ["build", "path", "version", "-o pkg+ver"])
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
