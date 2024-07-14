const core = require("@actions/core");
const github = require("@actions/github");

async function run() {
  try {
    const token = core.getInput("github-token");
    const failThreshold = core.getInput("fail-threshold");
    const octokit = github.getOctokit(token);
    const context = github.context;

    const severityLevels = ["low", "moderate", "high", "critical"];
    const thresholdIndex = severityLevels.indexOf(failThreshold);
    if (thresholdIndex === -1) {
      core.setFailed(
        `Invalid fail-threshold value: ${failThreshold}. Must be one of ${severityLevels.join(
          ", "
        )}`
      );
      return;
    }

    const { data: alerts } = await octokit.request(
      "GET /repos/{owner}/{repo}/dependabot/alerts",
      {
        owner: context.repo.owner,
        repo: context.repo.repo,
      }
    );

    const highOrCriticalAlerts = alerts.filter(
      (alert) => severityLevels.indexOf(alert.severity) >= thresholdIndex
    );

    if (highOrCriticalAlerts.length > 0) {
      core.setFailed(
        `There are ${highOrCriticalAlerts.length} dependabot alerts with severity ${failThreshold} or higher.`
      );
    } else {
      console.log(
        `No dependabot alerts with severity ${failThreshold} or higher found.`
      );
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
