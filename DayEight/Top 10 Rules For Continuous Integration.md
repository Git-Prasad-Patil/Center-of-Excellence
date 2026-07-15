# Top 10 Rules For Continuous Integration — Notes

**Source:** Dave Farley, "Top 10 Rules For Continuous Integration" (YouTube)

> Note: My screenshot/chapter list started at Rule 2, so Rule 1 is missing below — will add once I have it. Timestamps are included so I can jump back to any section while rewatching.

---

## Rule 1 — _(missing — add once confirmed)_

_(Likely candidate based on common CI wisdom: "Commit to trunk at least once a day" or "Don't break the build" — need to verify from the video itself rather than guessing.)_

---

## Rule 2 — Wait for the Results! `(8:03)`

Don't commit your change and immediately walk away or move on to something else. Stick around long enough to see whether the build and tests actually pass. If you don't wait, you won't know you've broken something until it's too late — and by then someone else may have built on top of your broken code.

## Rule 3 — Fix or Revert Failures Within 10 Minutes `(8:47)`

If your commit breaks the build, you've got a short window — about 10 minutes — to fix it. If you can't fix it that fast, revert the change instead of leaving the build broken. A broken build blocks everyone else on the team, so speed matters here more than pride in the fix.

## Rule 4 — If a Team Mate Breaks the Rules, Revert Their Changes `(9:53)`

This isn't about policing people personally — it's about protecting the team's ability to keep working. If someone else's commit breaks the build and they're not around (or not fixing it fast enough), it's on you (or whoever's available) to revert it so the pipeline stays green for everyone else.

## Rule 5 — If Someone Else Notices You Caused a Failure Before You Notice, It's a "Build Sin!" `(10:32)`

Basically: pay attention to your own commits. If a teammate has to point out that _you_ broke the build before you've even noticed, that's a sign you're not watching the pipeline closely enough after committing (ties back to Rule 2 — wait for the results).

## Rule 6 — Once Commit Passes, Move On to Your Next Task `(11:42)`

Once your change is confirmed green, don't linger — move forward. This keeps the flow of work efficient and avoids people sitting idle "just in case," which slows the whole team down.

## Rule 7 — If Any Test Fails, It Is the Responsibility of the Committer `(12:10)`

Whoever's commit triggered the failure owns fixing it. It's not something to hand off to "whoever's free" by default — the person who introduced the change is closest to the context and should take responsibility first.

## Rule 8 — It Is the Responsibility of Everyone Who May Be Responsible to Agree Who Will Fix a Failure `(13:03)`

When it's not immediately clear who caused a failure (e.g., a few commits landed close together), the people who _could_ be responsible need to quickly agree among themselves who's going to fix it — rather than everyone assuming someone else will handle it.

## Rule 9 — Monitor the Progress of Your Change `(14:37)`

Similar spirit to Rule 2, but broader — keep an eye on your change as it moves through the pipeline, not just the first build step. Continuous Integration isn't "commit and forget"; it's an active process of watching your code prove itself.

## Rule 10 — Address Any Pipeline Failure Immediately `(16:23)`

Any failure anywhere in the pipeline — not just the initial build — needs immediate attention. Letting failures sit (even ones further down the pipeline) undermines the whole point of CI: fast, reliable feedback.

---

### Overall takeaway

Most of these rules aren't really about tools or automation — they're about **team discipline and communication**. The recurring theme: commit small, watch closely, fix fast (or revert), and take ownership immediately rather than letting broken states linger. CI works only when the _people_ practicing it are disciplined about these habits, not just when the pipeline itself is well built.