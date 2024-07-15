import * as core from '@actions/core'
import * as github from '@actions/github'
import {Octokit} from '@octokit/rest'

enum AlertSeverity {
  Low = 'low',
  Moderate = 'moderate',
  High = 'high',
  critical = 'critical'
}

interface DependabotAlert {
  severity: AlertSeverity
}

async function run(): Promise<void> {
  try {
    const token = core.getInput('github-token')
    const failThreshold = core.getInput('fail-threshold') as AlertSeverity
    const octokit = new Octokit({auth: token})
    const context = github.context

    const severityLevels = Object.values(AlertSeverity)
    const thresholdIndex = severityLevels.indexOf(failThreshold)
    if (thresholdIndex === -1) {
      core.setFailed(
        `Invalid fail-threshold value: ${failThreshold}. Must be one of ${severityLevels.join(
          ', '
        )}`
      )
      return
    }

    core.info(
      `Checking for dependabot alerts with severity ${failThreshold} or higher...`
    )

    const {data: alerts} = await octokit.request(
      'GET /repos/{owner}/{repo}/dependabot/alerts',
      {
        owner: context.repo.owner,
        repo: context.repo.repo
      }
    )

    core.info(`Fetched ${alerts.length} alerts.`)

    const overThresholdAlerts = alerts.filter(
      (alert: DependabotAlert) =>
        severityLevels.indexOf(alert.severity) >= thresholdIndex
    )

    if (overThresholdAlerts.length > 0) {
      core.setFailed(
        `There are ${overThresholdAlerts.length} dependabot alerts with severity ${failThreshold} or higher.`
      )
    } else {
      core.info(
        `No dependabot alerts with severity ${failThreshold} or higher found.`
      )
    }
  } catch (error) {
    core.setFailed((error as Error).message)
  }
}

run()
