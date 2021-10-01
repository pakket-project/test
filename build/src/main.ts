/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as github from '@actions/github'
import {join} from 'path'

async function run(): Promise<void> {
  try {
    const PR = core.getInput('PR', {required: true})

    const GH_WORKSPACE = process.env.GITHUB_WORKSPACE as string
    const repository = 'test'

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
      repo: repository,
      pull_number: (PR as unknown) as number
    })

    const branch = pull.data.head.ref

    await exec.exec('git', ['fetch', 'origin', `${branch}:${branch}`])
    await exec.exec('git', ['config', `branch.${branch}.remote`, 'origin'])
    await exec.exec('git', [
      'config',
      `branch.${branch}.merge`,
      `refs/heads/${branch}`
    ])
    await exec.exec('git', ['checkout', branch])
    core.info(`Checked out ${pull.data.head.ref} (PR #${PR})`)

    // const prFiles = await octokit.request(
    //   `GET /repos/pakket-project/${repository}/pulls/${PR}/files`,
    //   {
    //     owner: 'pakket-project',
    //     repo: repository,
    //     pull_number: PR
    //   }
    // )
    const {data: files} = await octokit.rest.pulls.listFiles({
      owner: 'pakket-project',
      pull_number: (PR as unknown) as number,
      repo: repository
    })

    // await exec.getExecOutput('cat', [
    //   join(GH_WORKSPACE, 'packages', 'neofetch', '7.1.0', 'package')
    // ])

    core.info(files.join(', '))

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
