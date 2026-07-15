# Notes: Claude Code — Overview (Claude Code Docs)

Source: https://code.claude.com/docs/en/overview

## What it is

Claude Code is described as an agentic coding tool: it reads your codebase, edits files, runs commands, and integrates with your development tools, and it's available in your terminal, IDE, desktop app, and browser. It's positioned as understanding your whole codebase and working across multiple files/tools to actually get tasks done, not just answer questions about code.

## Where you can run it

It's not tied to one surface — same engine, several front doors:

- **Terminal** — the full CLI. Install via the native installer (curl/irm one-liners for Mac/Linux/WSL and Windows), Homebrew, or WinGet. Native installs auto-update in the background; Homebrew and WinGet don't (you update those manually).
- **VS Code** — an extension with inline diffs, @-mentions, plan review, and conversation history built into the editor. Also works in Cursor.
- **Desktop app** — standalone app (Mac/Windows/Windows ARM64) for visual diff review, running multiple sessions side by side, and scheduling recurring tasks. Requires a paid subscription.
- **Web** — run it in-browser with no local setup, at claude.ai/code. Useful for kicking off long tasks and checking back later, or working on repos you don't have cloned locally.
- **JetBrains** — plugin for IntelliJ, PyCharm, WebStorm etc. (still needs the CLI installed underneath it).

One practical note buried in the install instructions: if you see the error "The token '&&' is not a valid statement separator," you're in PowerShell, not CMD — which is exactly the error I ran into earlier when chaining `mkdir && cd` in PowerShell.

## What you can actually use it for

The doc lists these as the core use cases:

- **Automating tedious work** — writing tests for untested code, fixing lint errors project-wide, resolving merge conflicts, updating dependencies, writing release notes.
- **Building features / fixing bugs** — describe what you want in plain language; for bugs, paste the error and it traces root cause across the codebase.
- **Git workflows** — staging changes, writing commit messages, opening PRs directly.
- **MCP (Model Context Protocol)** — connects to external tools/data (Google Drive, Jira, Slack, custom tooling) so Claude Code can act across your actual toolchain, not just the local repo.
- **Customization** — a `CLAUDE.md` file at the project root that's read at the start of every session (coding standards, architecture decisions, preferred libraries, review checklists). It also builds "auto memory" on its own as it works. Reusable **skills** (like `/review-pr`) and **hooks** (shell commands that run before/after actions, e.g. auto-formatting after edits) extend this further.
- **Agent teams** — multiple Claude Code agents can work on different parts of a task in parallel, coordinated by a lead agent. For fully custom orchestration there's an Agent SDK.
- **Scripting/piping** — follows Unix philosophy; you can pipe logs into it (`tail -200 app.log | claude -p "..."`) or chain it with other CLI tools in CI.
- **Scheduling** — recurring tasks (morning PR reviews, overnight CI failure analysis) via Routines (cloud-run, keeps going even if your machine is off), Desktop scheduled tasks (local), or `/loop` for quick in-session polling.
- **Cross-device continuity** — sessions aren't locked to one surface; you can start on web/mobile and pull a task into your terminal with `claude --teleport`, or hand a terminal session to the Desktop app with `/desktop`.

## Relevance to Day 7 / BEE

This overview is really the "prerequisite layer" underneath BEE — BEE is a *plugin* that runs on top of this same Claude Code engine, so everything here (CLAUDE.md, skills, hooks, MCP) is the substrate BEE's commands and specialist agents are built from.
