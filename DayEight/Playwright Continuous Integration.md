# Playwright: Continuous Integration — Notes

**Source:** playwright.dev/docs/ci

---

## The basics

Getting Playwright running on CI comes down to three steps:

1. Make sure the CI agent can actually run browsers — either use Playwright's official Docker image (easiest on Linux), or install the OS-level dependencies yourself via the CLI.
2. Install Playwright (`npm ci`, then `npx playwright install --with-deps`).
3. Run the tests (`npx playwright test`).

## Workers — dial down parallelism on CI

This is a genuinely useful, slightly counterintuitive tip: Playwright recommends setting `workers: 1` on CI (rather than letting it use multiple workers like it does locally). The reasoning: on a typical CI runner you don't have a ton of spare CPU, so running tests sequentially keeps each test's execution stable and reproducible rather than having tests compete for limited resources and potentially producing flaky results.

```js
export default defineConfig({
  workers: process.env.CI ? 1 : undefined,
});
```

If you're running on a beefier self-hosted CI machine, you can enable parallel workers — and if you want to go even further, you can shard your tests across multiple separate CI jobs/machines (covered in the Sharding doc).

## CI provider configs

The doc gives ready-to-use config snippets for a long list of providers. The common thread across nearly all of them: use Playwright's pre-built Docker image (`mcr.microsoft.com/playwright:<version>-noble`) so you don't have to hand-install browser dependencies.

- **GitHub Actions** — the most detailed section. Covers: basic run-on-push/PR workflow, a sharded variant, running inside a container, triggering tests after a deployment (useful for testing a live preview URL, e.g. from Vercel), and a "fail-fast" pattern using `--only-changed` to run likely-affected tests first for quicker PR feedback (with the caveat that this is a heuristic — you still need a full run afterward).
- **Azure Pipelines** — Windows/macOS agents need no extra setup; Linux agents should use the Docker image. Also shows how to publish results via `PublishTestResults` (needs the JUnit reporter configured) and how to shard using a pipeline matrix.
- **CircleCI** — same idea as GitHub Actions, but sharding needs a small adjustment since CircleCI's parallelism index starts at 0 (so you add 1 before passing it to `--shard`).
- **Jenkins, Bitbucket Pipelines, GitLab CI, Google Cloud Build, Drone** — all follow the same basic pattern: point the job at Playwright's Docker image and run the test command. GitLab CI gets its own sharding section using the `parallel` keyword (or `parallel:matrix` for combining multiple projects × multiple shards).

## Caching browsers — actually not recommended

A slightly unusual piece of advice: Playwright says **don't bother caching browser binaries** between CI runs. The time it takes to restore a cache is often about the same as just downloading the binaries fresh — and on Linux you still need to separately install OS dependencies, which aren't cacheable anyway. If you do want to cache anyway, they point to which directories to target, keyed against the Playwright version.

## Debugging & headed mode notes

- Set `DEBUG=pw:browser` to get verbose logs if you're seeing "Failed to launch browser" errors.
- Playwright runs headless by default. Running headed on Linux CI agents needs Xvfb (a virtual display) — Playwright's own Docker image and GitHub Action come with Xvfb pre-installed, and you just prefix your test command with `xvfb-run`.

---

### Takeaway

Nothing exotic here — it's a practical "plug this into your CI provider" reference. The two ideas worth remembering beyond copy-pasting a config: **cap workers at 1 on CI unless you know you have spare capacity**, and **don't bother caching browser binaries**, since both are counter to what you might instinctively try to optimize.