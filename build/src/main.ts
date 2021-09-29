/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import {join} from 'path'

async function run(): Promise<void> {
  try {
    const path = core.getInput('path', {required: true})

    const pathRegex = new RegExp(
      /(packages\/)([^/]*)\/([^/]*)\/([^\n]*)/g
    ).exec(path)

    if (pathRegex) {
      for (let i = 0; i < pathRegex.length; i++) {
        core.info(`${i}: ${pathRegex[i]}`)
      }
    }

    // exec.getExecOutput("pakket-builder", ["build", "path", "version", "-o pkg+ver"])
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
