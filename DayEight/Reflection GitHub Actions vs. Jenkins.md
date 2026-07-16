# GitHub Actions vs. Jenkins — Comparison Notes

**Based on:** the Playwright CI doc (playwright.dev/docs/ci) covered earlier, plus general CI/CD knowledge for context.

---

## Quick framing

Both are ways to automatically run your Playwright tests whenever code changes. The Playwright doc treats them the same way under the hood — "install deps, install Playwright, run tests" — but _how_ you get there, and who manages the infrastructure, is where they really diverge.

---

## What's similar

- **Same core recipe.** Both ultimately do: check out code → install Node dependencies → install Playwright + browsers (or use the pre-built Docker image) → run `npx playwright test`. The Playwright-specific commands don't change based on the CI tool.
- **Both support Docker.** GitHub Actions can run jobs inside a container (`jobs.<job_id>.container`), and Jenkins pipelines can use a Docker agent (`agent { docker { image ... } }`) — in both cases pointing at Playwright's official image (`mcr.microsoft.com/playwright:...`) so you don't have to hand-install browser dependencies.
- **Both support sharding.** GitHub Actions uses a matrix strategy; Jenkins can do the equivalent with its own parallel-stage mechanisms (the Playwright doc itself only shows the GitHub Actions sharded example in detail, but the same `--shard=x/y` flag works anywhere).
- **Both are "config as code."** You describe the pipeline in a file that lives in your repo (`.github/workflows/playwright.yml` vs. Jenkins' `Jenkinsfile` using Groovy), rather than clicking through a UI to define steps.

---

## What's different

||GitHub Actions|Jenkins|
|---|---|---|
|**Hosting**|Fully managed by GitHub — you don't run or maintain the runner infrastructure (unless you choose self-hosted runners)|Self-hosted by default — you install and maintain Jenkins itself, plus its agents/build machines|
|**Config format**|YAML (`.github/workflows/*.yml`)|Groovy-based `Jenkinsfile` (declarative or scripted pipeline syntax)|
|**Setup shown in the doc**|Fairly elaborate — multiple full examples: push/PR trigger, sharded run, containerized run, deployment-triggered run, fail-fast with `--only-changed`|Minimal — just one short example showing a Docker agent running `npm ci` and `npx playwright test` inside a single stage|
|**Triggers**|Rich built-in trigger types tied directly to GitHub events — `push`, `pull_request`, `deployment_status`, etc., with no extra plumbing needed|Triggers usually need explicit configuration (e.g., polling SCM, webhooks, or plugins) since Jenkins isn't natively tied to a specific git host|
|**Artifacts**|Built-in `actions/upload-artifact` step, tightly integrated into the platform's UI (you view the Playwright HTML report or blob reports right from the Actions tab)|Typically needs the `PublishTestResults`-style plugin equivalents, or your own archiving step, to surface reports in the Jenkins UI|
|**Ecosystem/plugins**|Marketplace of reusable "Actions" you drop into a workflow (e.g., `actions/setup-node`)|Plugin ecosystem, but plugins are typically installed and managed by whoever administers the Jenkins server — more central admin overhead|
|**Where it fits**|Natural fit if your code already lives on GitHub — practically zero infrastructure to stand up|Common in orgs that need on-prem/self-hosted CI, tighter infrastructure control, or already have Jenkins entrenched from before cloud-native CI tools existed|

---

## Practical takeaway

If you're comparing them purely from what the Playwright doc shows: **GitHub Actions gets far more attention and depth in the docs** (multiple advanced patterns), while **Jenkins gets a bare-minimum example**, mostly because Jenkins pipelines vary so much depending on how a given org has already set things up (plugins, agents, existing Jenkinsfile conventions) — there's less of a "standard" Jenkins pattern to document, whereas GitHub Actions is a single consistent platform Playwright's maintainers can write concrete examples against.

The underlying lesson either way: **the CI provider is mostly just plumbing.** The actual test-running logic (`workers: 1` on CI, sharding via `--shard`, reporters like `blob` for merging) stays identical regardless of which platform is wrapped around it.