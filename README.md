# check-vulnerabilities

A github action that checks for open dependabot alerts in the repository before allowing a workflow to proceed.

## Usage

```yaml
- name: Check for Dependabot alerts
  uses: ketch-com/check-vulnerabilities@v0.0.3
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    fail-threshold: 'moderate' # You can set this to 'low', 'moderate', 'high', or 'critical'
```
