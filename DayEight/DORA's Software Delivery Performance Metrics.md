# DORA's Software Delivery Performance Metrics — Notes

**Source:** dora.dev — "DORA's software delivery performance metrics" (by Nathen Harvey)

---

## What this is about

DORA (the long-running DevOps research program, now run by Google Cloud) has identified **five metrics** that reliably predict how well a team is doing at delivering software — and interestingly, these same metrics also correlate with team wellbeing and overall organizational performance. They're not just "nice to track," DORA's research backs them as genuinely predictive.

Worth noting: this is actually version two of the model. It started as "four keys" and has since evolved to five metrics as the research matured (e.g., MTTR got replaced with the more precise "Failed Deployment Recovery Time"). There's a separate article on dora.dev that covers that history if I want to dig into it later.

One useful framing: these metrics work as **leading indicators** for org performance and employee wellbeing, but as **lagging indicators** for your actual delivery practices — i.e., they tell you the result of what you've already been doing, not what to do next.

---

## The two buckets: Throughput vs. Instability

The five metrics split cleanly into two groups.

### 1. Throughput — how much change moves through the system

- **Change lead time** — time from a commit landing in version control to that change actually being deployed in production.
- **Deployment frequency** — how often deployments happen (or conversely, the time between them).
- **Failed deployment recovery time** — when a deployment fails and needs urgent action, how long it takes to recover.

### 2. Instability — how well those deployments actually go

- **Change fail rate** — the percentage of deployments that need immediate intervention (rollback or hotfix).
- **Deployment rework rate** — the percentage of deployments that are unplanned, i.e., triggered as a reaction to a production incident rather than as planned work.

Together, throughput + instability give a high-level read on delivery health — and notably, they apply regardless of your tech stack or how complicated your deployment process is.

---

## Key insight worth remembering

The big finding from DORA's research: **speed and stability aren't a tradeoff.** Teams that are fast also tend to be stable, and teams that are slow also tend to be less stable. High performers are good across all five metrics at once — it's not "pick two."

Dave Farley's framing captures this well — he argues the real long-term tradeoff isn't speed vs. stability, but rather ending up with better software delivered faster, or worse software delivered slower.

Also important: these metrics are meant to be applied **per application/service**, not blended across an entire org. A mobile app and a mainframe system have wildly different contexts, so comparing their numbers directly is misleading.

---

## Common pitfalls to avoid

The article calls out several traps teams fall into when adopting these metrics:

- **Turning a metric into a goal** — e.g., mandating "deploy X times a day" invites teams to game the number instead of actually improving (classic Goodhart's Law problem).
- **Picking one metric to rule them all** — complex systems need multiple metrics held in tension, not a single score.
- **Hiding behind regulation** — using "we're in a regulated industry" as an excuse to avoid improving at all.
- **Comparing apples to oranges** — measuring wildly different applications against each other.
- **Siloed ownership** — if only one team (say, ops) owns these metrics, it breeds finger-pointing instead of shared responsibility. All five should be visible across dev, ops, and release teams together.
- **Competing on the metrics** — the point is your own team's improvement over time, not beating another team's score.
- **Over-investing in measurement tooling before you've had the conversation** — sometimes a good discussion, or a lightweight tool (like DORA's own "Quick Check"), gets you further than building elaborate data pipelines up front.

---

## Practical next steps suggested

The guide recommends a pretty simple, repeatable loop for teams wanting to actually improve these numbers:

1. **Baseline** your current performance (using the DORA Quick Check).
2. **Talk through friction points** in your delivery process as a team — mapping the value stream can help here.
3. **Commit as a team** to fixing the single biggest bottleneck — not everything at once.
4. **Turn that into a real plan**, possibly with smaller leading-indicator measures (e.g., code review turnaround time).
5. **Actually do the work** — there's no shortcut; it usually means changing how the team works, not just measuring harder.
6. **Check progress** via Quick Check, conversation, and retrospectives.
7. **Repeat** the cycle.

One especially practical lever mentioned throughout: **reducing batch size** — making changes smaller. Smaller changes are easier to reason about, easier to move through the pipeline, and easier to recover from if something breaks. This single habit tends to improve both throughput and stability simultaneously.

---

### My takeaway

This piece is really a "measure to learn, not to judge" argument. The five metrics are useful because they're balanced (fast + stable together), applied at the right level (per-service, not org-wide), and treated as a conversation-starter rather than a scoreboard. The recurring thread tying this back to the CI notes from earlier: small batches and fast feedback keep showing up as the practical fix for almost everything.