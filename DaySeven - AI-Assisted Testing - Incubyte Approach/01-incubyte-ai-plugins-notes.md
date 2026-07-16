# Notes: incubyte/ai-plugins (GitHub)

Source: https://github.com/incubyte/ai-plugins

Two Claude Code plugins live in this repo, built by Incubyte.

## Bee — AI Development Workflow Navigator

- Spec-driven development that **scales the process to match the task** — it triages by size/risk first, then routes you through only the stages that task actually needs.
- Full workflow it can walk you through: triage → context gathering → spec → architecture → code → test → verify → review.
- Ships with **10 commands** and **26 specialist agents** (each presumably handling one stage/domain of that workflow).
- Has session resume, so a workflow can be picked back up across separate conversations instead of losing progress.
- Design-system awareness baked in for UI work.
- A collaboration loop built around inline `@bee` annotations — you can leave comments and BEE responds to them directly in context.
- Entry point: `/bee:sdd`

There's also a "grill-me" skill bundled in (`bee/skills/grill-me`) — it acts like a colleague pressure-testing your plan, keeps a running log of decisions in `.claude/bee-context.local.md`, and drops into a quick mini-brainstorm (web search + 2-3 concrete options) if you genuinely don't know an answer, rather than letting you hand-wave past a gap.

## Learn — Build to Learn

- Tagline: learn any technology by building a real project with it.
- Claude guides step-by-step, but **you write every line of code yourself** — not a generate-it-for-you tool.
- Project-based curriculum generation, adaptive pacing by skill level, progress tracking across sessions, knowledge-check quizzes.
- Entry point: `/learn:start`

## Install

```
/plugin marketplace add incubyte/claude-plugins
/plugin install bee@incubyte-plugins
/plugin install learn@incubyte-plugins
```

These are typed inside a running Claude Code session (not a regular shell). After installing, run `/reload-plugins` to make them active.

## Gap I noticed

GitHub blocks automated browsing of its repo file-tree pages, so the exact mapping of the 26 specialist agents to workflow stages, and the full list of BEE's 10 commands, isn't visible from the README alone — that detail only surfaces once the plugin is installed and you run it, or by browsing the repo manually in a browser.
