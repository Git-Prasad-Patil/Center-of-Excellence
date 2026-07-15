# Playwright: Sharding — Notes

**Source:** playwright.dev/docs/test-sharding

---

## What sharding actually is

Playwright already parallelizes tests across CPU cores on a single machine. Sharding takes this further: it splits your whole test suite into separate chunks ("shards"), and each shard can run **on a completely separate machine/CI job**. The point is purely speed — if you split into 4 shards and run them simultaneously, your suite finishes roughly 4x faster (wall-clock time), even though the total compute work is the same.

## How to shard

Just pass `--shard=x/y`:

```bash
npx playwright test --shard=1/4
npx playwright test --shard=2/4
npx playwright test --shard=3/4
npx playwright test --shard=4/4
```

Each of those would typically run as a separate CI job in parallel.

One caveat: Playwright can only shard tests that are actually parallelizable — by default, sharding happens at the **test file** level.

## Balancing shards — the part that's easy to overlook

This is the most practically important section. Whether shards end up balanced (each doing roughly equal work) depends on whether `fullyParallel: true` is set:

- **With `fullyParallel: true`** — individual tests (not whole files) get distributed across shards. This gives much more even balancing, since Playwright can spread things at the test level rather than the file level.
- **Without `fullyParallel`** — whole files get assigned to shards. If your test files vary a lot in size (some have 2 tests, others have 50), some shards will end up doing way more work than others, wasting the whole point of sharding.

**Practical takeaway:** turn on `fullyParallel: true` if you're sharding and want balanced load — otherwise you need to manually keep your test files similarly sized, which is more maintenance overhead.

## Merging reports from multiple shards

Since each shard produces its own report, you need a way to stitch them back into one combined report. The recommended approach:

1. Set the reporter to `'blob'` when running on CI:
    
    ```js
    export default defineConfig({  reporter: process.env.CI ? 'blob' : 'html',});
    ```
    
2. Each shard produces its own blob report (naming includes the shard number, so they won't collide).
3. Collect all blob reports into one directory (e.g. `all-blob-reports`).
4. Run:
    
    ```bash
    npx playwright merge-reports --reporter html ./all-blob-reports
    ```
    
    This produces one unified HTML report, as if the whole suite had run in one place.

## GitHub Actions example (the full pattern)

The doc walks through a complete two-job pattern:

1. A `playwright-tests` job using a matrix (`shardIndex: [1,2,3,4]`, `shardTotal: [4]`) — each matrix combination runs `--shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}` and uploads its blob report as an artifact.
2. A separate `merge-reports` job that depends on the first (`needs: [playwright-tests]`), downloads all the blob report artifacts, merges them, and uploads the final combined HTML report.

Worth noting: the merge job is set to run `if: ${{ !cancelled() }}` — meaning it still tries to merge and report even if some shards failed, rather than silently skipping.

## Merging reports across environments (different use case)

This is a subtly different problem from sharding: instead of splitting one suite across machines, you might be running the _same_ suite against multiple environments (e.g. staging vs. prod) and want to tell those results apart in a merged report. The fix is to tag each run with an environment label via `testConfig.tag`, which gets picked up automatically by the blob reporter and the merge tool.

## The merge-reports CLI itself

`npx playwright merge-reports path/to/blob-reports-dir` merges everything in that folder. A couple of extra options:

- `--reporter` — can pass multiple, comma-separated (e.g. `html,github`)
- `--config` — lets you point to a separate config file just for the merge step (useful if you want different output options than what generated the blob reports)
- If merging reports generated on different operating systems, you need an explicit merge config to resolve which directory should be treated as the test root.

---

### Takeaway

Sharding is really a two-part story: **splitting** (the `--shard` flag, and getting the balance right via `fullyParallel`) and **recombining** (blob reporter + `merge-reports`). Skipping the `fullyParallel` setting is the most likely way teams accidentally end up with lopsided, inefficient shards.