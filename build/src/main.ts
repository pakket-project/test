/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import {join} from 'path'

async function run(): Promise<void> {
  try {
    const PR = core.getInput('PR', {required: true})

    const GH_WORKSPACE = process.env.GITHUB_WORKSPACE as string

    let arch = ''

    if (process.arch === 'x64') {
      arch = 'intel'
    } else if (process.arch === 'arm64') {
      arch = 'silicon'
    } else {
      core.setFailed('unsupported architecture')
    }

    const octokit = github.getOctokit(core.getInput('GH_TOKEN'))

    const pull = await octokit.rest.pulls.get({
      owner: 'pakket-project',
      repo: 'test',
      pull_number: (PR as unknown) as number
    })

    const remote = 'origin'
    const branch = pull.data.head.ref

    await exec.exec('git', ['fetch', remote, `${branch}:${branch}`])
    await exec.exec('git', ['config', `branch.${branch}.remote`, remote])
    await exec.exec('git', [
      'config',
      `branch.${branch}.merge`,
      `refs/heads/${branch}`
    ])
    await exec.exec('git', ['checkout', branch])

    await exec.getExecOutput('cat', [
      join(GH_WORKSPACE, 'packages', 'packages', 'neofetch', '7.1.0', 'package')
    ])

    // for (const p of modifiedPaths) {
    //   const pathRegex = new RegExp(
    //     /(packages\/)([^/]*)\/([^/]*)\/([^\n]*)/g
    //   ).exec(p)

    //   if (pathRegex) {
    //     const pkg = pathRegex[2]
    //     const version = pathRegex[3]

    //     const output = await exec.getExecOutput('pakket-builder', [
    //       'build',
    //       join(GH_WORKSPACE, packagesPath, pkg),
    //       version,
    //       '-o',
    //       join(GH_WORKSPACE, 'packages', pkg, '-', version)
    //     ])

    //     const stdout = output.stdout.split('\n')
    //     for (const line of stdout) {
    //       const regex = new RegExp(/checksum: ([A-Fa-f0-9]{64})/g).exec(line)
    //       if (regex) {
    //         const checksum = regex[1]
    //         core.info(checksum)
    //         if (arch === 'intel') {
    //           intelChecksums.push(checksum)
    //         } else if (arch === 'silicon') {
    //           siliconChecksums.push(checksum)
    //         }
    //       }
    //     }
    //   }
    // }
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
