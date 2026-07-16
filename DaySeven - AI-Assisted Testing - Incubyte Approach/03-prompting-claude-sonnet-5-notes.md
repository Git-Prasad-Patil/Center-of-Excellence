# Notes: Prompting Claude Sonnet 5 (Claude Platform Docs)

Source: https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-sonnet-5

This one's written for developers calling the API, not end-users chatting with Claude — but a lot of it explains *why* Claude Code/BEE behaves the way it does, which is useful context for Day 7.

## Response length calibrates to the task

Sonnet 5 sizes its answer to how complex the question actually is, rather than defaulting to a fixed verbosity — short for simple lookups, longer for open-ended analysis. If you need a consistently terse or consistently detailed style regardless of task, you have to prompt for it explicitly (e.g. "provide concise, focused responses, skip non-essential context").

## Effort parameter (intelligence vs. cost/speed)

This is the big one. Effort has five levels: `max`, `xhigh`, `high` (default), `medium`, `low`.

- `low`/`medium` — the model scopes work strictly to what was literally asked; good for latency/cost, but risks under-thinking on moderately complex tasks.
- `high` (default) — balances usage and intelligence for most cases.
- `xhigh` — recommended for the hardest coding/agentic tasks.
- `max` — no constraint on token spend.

Rough migration mapping: Sonnet 5 at `medium` ≈ Sonnet 4.6 at `high`; Sonnet 5 at `high` ≈ Sonnet 4.6 at `max`.

**Adaptive thinking is on by default** on Sonnet 5 (a change from 4.6, where the same request ran with no thinking at all). You can disable it entirely (`thinking: {type: "disabled"}`), but manual extended thinking with a token budget is no longer supported — that's been fully removed in favor of the effort parameter.

## Tool use

Sonnet 5 is more agentic by default — it reaches for tools and self-verifies more readily than 4.6 did. With thinking turned off, it's *less* likely to reach for a tool unless you nudge it explicitly. Higher effort (`high`/`xhigh`) shows noticeably more tool usage in agentic/search/coding contexts.

## More literal instruction-following

This is a real behavior shift worth remembering: Sonnet 5 does **not** silently generalize an instruction from one example to the rest of a task, and doesn't infer requests you didn't actually make — especially at lower effort. If you want a rule applied broadly, you have to say so explicitly (e.g. "apply this formatting to every section, not just the first").

## Code review harnesses — recall vs. precision

If a review prompt says "only report high-severity issues" or "be conservative," Sonnet 5 tends to follow that more faithfully than earlier models — it may investigate just as thoroughly, find the same bugs, but simply not *report* ones below the stated bar. This can look like a drop in recall even though bug-finding ability hasn't dropped. Recommended fix: separate "find everything, including low-confidence/low-severity items" from a later filtering/verification step, rather than asking the model to filter and find in the same pass.

## Design/frontend defaults

Sonnet 5 can settle into one default visual style on open-ended design briefs. Vague negative instructions ("don't use that color") just shift it to a different fixed default rather than producing real variety — you get better results either by specifying a fully concrete alternative direction, or asking it to propose several distinct directions up front before building.

## Relevance to "prompt engineering for QA / test generation"

The two points that matter most for the Playwright exercise:

1. **Literal instruction-following** — if you want BEE/Claude to generate tests covering edge cases, error states, *and* the happy path, you likely need to say all three explicitly rather than trusting it to infer "edge cases" from "generate tests for this feature."
2. **The recall-vs-precision effect** — the same pattern applies to test review, not just code review. If you ask it to "flag any test gaps," it may under-report borderline gaps unless you explicitly ask for full coverage first, then filter afterward.
