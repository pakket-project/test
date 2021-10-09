/* eslint-disable @typescript-eslint/no-explicit-any */
import * as core from '@actions/core'
import * as actionExec from '@actions/exec'
import * as github from '@actions/github'
import {join} from 'path'

import simpleGit, {SimpleGit} from 'simple-git'
const git: SimpleGit = simpleGit()

let silicon = false

async function needsArmFlag(): Promise<boolean> {
  const uname = await actionExec.getExecOutput(`uname`, ['-m'])
  const isArm = uname.stdout === 'arm64'
  let isM1 = false
  try {
    // this command will only succeed on m1 macs.
    await actionExec.exec('arch', ['-arm64', 'echo', 'hi'])
    isM1 = true
  } catch (err) {
    // Must not be an m1 mac
  }
  return isM1 && !isArm
}

async function exec(
  command: string,
  args: string[]
): Promise<actionExec.ExecOutput> {
  if (silicon) {
    args = ['-arm64', command, ...args]
    command = 'arch'
  }

  return await actionExec.getExecOutput(command, args)
}

async function run(): Promise<void> {
  silicon = await needsArmFlag()

  try {
    const PR = core.getInput('PR', {required: false})

    const GH_WORKSPACE = process.env.GITHUB_WORKSPACE as string
    const repository = 'test'

    let pkgName = ''
    let pkgVersion = ''
    if (!PR) {
      pkgName = core.getInput('package', {required: false})
      pkgVersion = core.getInput('version', {required: false})
    }

    process.env.HOME = GH_WORKSPACE

    const octokit = github.getOctokit(core.getInput('GH_TOKEN'))

    let pull

    const files = []

    if (PR) {
      pull = await octokit.rest.pulls.get({
        owner: 'pakket-project',
        repo: repository,
        pull_number: (PR as unknown) as number
      })

      const branch = pull.data.head.ref
      const fork = pull.data.head.repo?.fork

      if (fork === true) {
        await git.remote([
          'add',
          'fork',
          pull.data.head.repo?.clone_url as string
        ])
        await git.fetch('fork')
        await git.checkout(`fork/${branch}`, ['--track'])
      } else {
        await git.fetch('origin', `${branch}:${branch}`)
        await git.addConfig(`branch.${branch}.remote`, 'origin')
        await git.addConfig(`branch.${branch}.merge`, `refs/heads/${branch}`)
        await git.checkout(branch)
      }

      core.info(`Checked out ${pull.data.head.ref} (PR #${PR})`)

      const pullFiles = await octokit.rest.pulls.listFiles({
        owner: 'pakket-project',
        pull_number: (PR as unknown) as number,
        repo: repository
      })

      for (const file of pullFiles.data) {
        files.push(file.filename)
      }
    } else {
      files.push(join('packages', pkgName, pkgVersion, 'package'))
    }

    let pkg = ''
    let version = ''

    for (const f of files) {
      const pathRegex = new RegExp(
        /(packages\/)([^/]*)\/([^/]*)\/([^\n]*)/g
      ).exec(f)

      if (pathRegex && pkg === '' && version === '') {
        pkg = pathRegex[2]
        version = pathRegex[3]

        const outputDir = join(GH_WORKSPACE, 'temp', `${pkg}-${version}`)

        const buildOutput = await exec('sudo', [
          'pakket-builder',
          'build',
          join(GH_WORKSPACE, 'packages', pkg),
          version,
          '-o',
          outputDir
        ])

        let checksum = ''
        const stdout = buildOutput.stdout.split('\n')
        for (const line of stdout) {
          const regex = new RegExp(/checksum: ([A-Fa-f0-9]{64})/g).exec(line)
          if (regex) {
            checksum = regex[1]
          }
        }

        let arch = ''
        if (silicon) {
          arch = 'silicon'
        } else {
          arch = 'intel'
        }

        const tarPath = join(outputDir, pkg, `${pkg}-${version}-${arch}.tar.xz`)
        const destDir = join(
          'containers',
          'caddy',
          'core-packages',
          pkg,
          version
        )

        try {
          await exec('ssh', ['mirror', 'mkdir', '-p', destDir])
          await exec('scp', [tarPath, `mirror:${destDir}`])
          core.info('Uploaded package to mirror')
        } catch (err) {
          core.setFailed('Failed to upload the package to the mirror')
        }

        try {
          await git.addConfig('user.email', 'bot@pakket.sh')
          await git.addConfig('user.name', 'Pakket Bot')
          await git.addConfig('pull.rebase', 'true')

          await git.add('./packages')
          await git.commit(`Add checksum for ${pkg} (${version}, ${arch})`)
          await git.pull()
          await git.push()
          core.info('Pushed checksum to repository')
        } catch (err) {
          if (PR) {
            await octokit.rest.issues.createComment({
              body: `Uploading ${arch} checksum failed.\nChecksum: ${checksum}`,
              issue_number: (PR as unknown) as number,
              owner: 'pakket-project',
              repo: 'core'
            })
          }
          core.setFailed('Failed to push checksum to repository')
        }

        if (PR) {
          await octokit.rest.issues.createComment({
            body: `Successfully packaged and uploaded ${pkg} (for ${arch}) to the mirror.`,
            issue_number: (PR as unknown) as number,
            owner: 'pakket-project',
            repo: 'core'
          })
        }
      }
    }
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
