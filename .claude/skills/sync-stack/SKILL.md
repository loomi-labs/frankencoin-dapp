---
name: sync-stack
description: Sync all three Frankencoin repos (dapp, api, ponder) with their upstream at Frankencoin-ZCHF. Detects breaking-change signals (env vars, Dockerfile, CI workflows, Prisma schema, Ponder schema) and opens a PR for review instead of pushing to main when found. Use when the user says "sync the stack", "sync all repos", or "stack sync".
allowed-tools: Bash(jj:*), Bash(gh:*), Bash(cd:*), Bash(diff:*), Bash(test:*), Bash(ls:*), Bash(cat:*), Bash(date:*), Bash(grep:*), Bash(echo:*)
---

## Context

This skill syncs the three Frankencoin repos with their upstreams at `Frankencoin-ZCHF`:

- `/home/rapha/repos/frankencoin-dapp` ← `Frankencoin-ZCHF/frankencoin-dapp`
- `/home/rapha/repos/frankencoin-api` ← `Frankencoin-ZCHF/frankencoin-api`
- `/home/rapha/repos/ponder` ← `Frankencoin-ZCHF/ponder`

The `upstream` remote on api and ponder is **set up manually** as a one-time task — this skill never adds remotes. If `upstream` is missing on any repo, **notify the user prominently** in the final summary; do not silently skip.

The per-repo merge mechanics mirror `/jj-sync-upstream` (single-repo version). This skill is the multi-repo wrapper that also decides between "push to main" and "open a PR".

$ARGUMENTS

## Your task

Sync all three repos with upstream in parallel. For each repo:
- If new upstream commits are present, merge them.
- Inspect the merge for breaking-change signals (paths listed below).
- If clean → push to `main`. If breaking → push a sync branch and open a PR.

Always finish with a 3-line summary showing the outcome per repo.

## Pre-flight

```bash
test -d /home/rapha/repos/frankencoin-dapp && test -d /home/rapha/repos/frankencoin-api && test -d /home/rapha/repos/ponder
gh auth status
```

If any check fails, stop and tell the user what's missing.

## Per-repo recipe

For each of `frankencoin-dapp`, `frankencoin-api`, `ponder`, run inside that repo (use `cd` or `jj --repository <path>`):

### 1. Check for `upstream`

```bash
jj git remote list
```

If `upstream` is not listed: **do not skip silently**. Record the repo's outcome as `NEEDS SETUP — no 'upstream' remote configured` and move on to the next repo. Surface this prominently in the final summary so the user knows to add it manually.

### 2. Pre-check working copy

If `jj st` shows uncommitted changes in `@`, mark the repo `aborted — dirty working copy` and move on.

### 3. Fetch

```bash
jj git fetch --all-remotes
```

### 4. Compare upstream to main

```bash
jj log -r 'main..main@upstream' --limit 1
```

If empty → mark `already synced`, skip to step 7.

### 5. Merge

```bash
jj new main main@upstream -m "chore: merge upstream/main into main"
```

If `jj st` shows conflicts after the merge: **stop processing this repo**. Mark it `conflicts — resolve via /jj-sync-upstream in <repo>` and continue with the others. Do not push or open a PR for a conflicted repo.

### 6. Detect breaking-change signals

```bash
jj diff --from main@origin --to @ --name-only
```

Match the output against this list:

| Pattern | Applies to |
|---|---|
| `.env.example` | any |
| `Dockerfile`, `docker-compose.*ya?ml` | any |
| `.github/workflows/**` | any |
| `prisma/schema.prisma` | api |
| `schema/**`, `ponder.schema.ts`, `ponder.config.ts` | ponder |

Collect every matched path with a short reason ("env vars changed", "Docker build changed", "Prisma schema changed", etc.).

### 7. Push decision

**No signals matched:**

```bash
jj bookmark set main -r @
jj git push --bookmark main
```

Mark the repo `synced — pushed to main`.

**At least one signal matched:**

The PR ALWAYS targets **our fork** (the `origin` remote), NEVER the `upstream` (`Frankencoin-ZCHF`) repo — the sync proposes upstream's commits *into* our fork, so the PR base is the fork's `main`. Derive the fork's `owner/repo` from the `origin` URL rather than hardcoding it:

```bash
BRANCH="sync/upstream-$(date +%Y-%m-%d-%H%M%S)"
jj bookmark set "$BRANCH" -r @
jj git push --bookmark "$BRANCH"
# Derive the fork repo slug from origin (e.g. git@github.com:loomi-labs/frankencoin-api.git → loomi-labs/frankencoin-api)
FORK_REPO=$(jj git remote list | grep '^origin ' | sed -E 's#.*[:/]([^/]+/[^/]+?)(\.git)? *$#\1#')
gh pr create --repo "$FORK_REPO" --base main --head "$BRANCH" \
  --title "chore: sync upstream — review needed" \
  --body "$(cat <<'EOF'
Automated upstream sync. The following files need review before merge:

- [ ] `<path>` — <reason>
- ...

If a `.env.example` or Dockerfile change requires a deploy config update, coordinate that before merging.
EOF
)"
```

Mark the repo `PR opened — <url>`.

## Orchestration

Run the three repo recipes in parallel. The cleanest way is to **dispatch three subagents in a single message**, each handling one repo. Each subagent returns one summary line:

- `dapp:    synced — pushed to main`
- `api:     PR opened — https://github.com/loomi-labs/frankencoin-api/pull/123`
- `ponder:  NEEDS SETUP — no 'upstream' remote configured`

After all three return, print a final table:

```text
Repo    | Outcome
--------|--------
dapp    | ...
api     | ...
ponder  | ...
```

Any repo with `NEEDS SETUP`, `conflicts`, or `aborted` gets a follow-up callout below the table telling the user exactly what to do next.

## Guidelines

- **Never** push to main when any breaking-change signal is present — always open a PR.
- **Always** open PRs against **our fork** (`origin`), never against `upstream`/`Frankencoin-ZCHF`. Derive the repo slug from the `origin` remote; do not hardcode or guess `<owner>/<repo>`.
- **Never** force-push.
- **Never** add the `upstream` remote — that's a manual one-time setup. Notify the user instead.
- The skill never runs Prisma migrations, Ponder codegen, or deploys — those follow the PR review.
- If a repo's path doesn't exist on disk, abort the whole skill and tell the user.

## Troubleshooting

### A repo reports "NEEDS SETUP"

Add the missing remote in that repo:

```bash
cd <repo-path>
jj git remote add upstream https://github.com/Frankencoin-ZCHF/<repo-name>.git
jj git fetch --remote upstream
```

Then re-run `/sync-stack`.

### A repo reports "conflicts"

Cross-repo conflict resolution is out of scope for this skill. Run `/jj-sync-upstream` inside that single repo to walk through the conflicts interactively, then re-run `/sync-stack`.

### First merge produces unexpectedly many conflicts

The previous sync may have been a squash rather than a true merge. See the troubleshooting section in `/jj-sync-upstream`'s SKILL.md for the recording-merge fix.
