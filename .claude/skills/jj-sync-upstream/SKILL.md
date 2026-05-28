---
name: jj-sync-upstream
description: Fetch the upstream remote and merge upstream/main into this fork's main, surfacing any conflicts for manual resolution. Use when the user says "sync upstream", "merge upstream", "pull from upstream", or "update from upstream".
allowed-tools: Bash(jj:*)
---

## Context

This repo is a fork of `Frankencoin-ZCHF/frankencoin-dapp` (remote `upstream`). The fork has substantial rebranded UI on top of upstream, so syncing is always a real merge — never a fast-forward.

- Remotes: !`jj git remote list`
- New upstream commits not yet in main: !`jj log -r 'main..main@upstream' --limit 20`
- Fork commits past last upstream sync: !`jj log -r 'main@upstream..main' --limit 10`

$ARGUMENTS

## Your task

Merge `main@upstream` into this fork's `main`, walking the user through any conflicts. Do **not** push.

## Steps

1. **Pre-check the working copy.** If `@` has uncommitted changes, ask the user to commit (`jj commit`) or move off (`jj new main`) first. Working copy must be clean before merging.

2. **Fetch upstream**:
   ```bash
   jj git fetch --remote upstream
   ```

3. **Check for new commits**:
   ```bash
   jj log -r 'main..main@upstream' --limit 20
   ```
   If the result is empty, report "already synced through `<main@upstream commit>`" and stop. Nothing to do.

4. **Create the merge commit**:
   ```bash
   jj new main main@upstream -m "chore: merge upstream/main into main"
   ```
   This 3-way merges and marks conflicts in any file changed on both sides.

5. **Surface and resolve conflicts**. Run `jj st` and list each conflicted file. For each file:
   - Read the conflict markers.
   - Propose a resolution that **preserves the fork's rebrand and UX changes** while incorporating upstream's behavior/logic changes — but show the user the proposed edit and wait for confirmation. Never auto-resolve silently.
   - Once the user confirms, edit the file in-place to remove markers. jj clears the conflict automatically when markers are gone.

   If `jj st` shows zero conflicts (rare for this fork), skip ahead.

6. **Move the bookmark** once `jj st` is clean:
   ```bash
   jj bookmark set main -r @
   ```

7. **Rebase any in-progress work** that branched off the previous main:
   ```bash
   jj rebase -s <change-id> -d main
   ```
   Repeat for each sibling commit if the user had a stack.

8. **Stop before push.** Show:
   ```bash
   jj log --limit 10
   ```
   and tell the user to inspect the merge, then push themselves with `jj git push --bookmark main` when ready.

## Guidelines

- **Never push automatically** — even if the merge is clean. The user pushes when they're ready.
- **Never force-push.**
- Default merge pair is `main` ↔ `main@upstream`. If the user names a different pair (e.g. "sync from upstream feat/foo"), use what they say.
- Bias conflict resolution toward the fork's rebrand — different copy ("Dashboard", "Get ZCHF"), redesigned components, navy/Swiss palette — while keeping upstream's bug fixes and new logic.
- If the user is unsure about a specific conflict, surface both sides and ask.

## Troubleshooting

### "The first merge produced conflicts in 19+ files I didn't expect"

This usually means a previous sync was applied as a **squash commit** rather than a merge — so `main@upstream` exists in the fork's history as *content* but not as an *ancestor*. The 3-way merge then diffs against an ancient common ancestor and conflicts on the entire rebrand surface.

The one-time fix (already applied on 2026-05-28 in commit `ec0783f0` "chore: record upstream merge through f7bbe7c0"):

```bash
jj new main main@upstream -m "chore: record upstream merge through <upstream-commit>"
jj restore --from main      # tree becomes identical to main; no code changes
jj bookmark set main -r @
```

This records the ancestry relationship without modifying any code. From that point forward, `jj new main main@upstream` only conflicts on files that genuinely changed since the recorded merge point.

This should not recur unless someone reintroduces a squash-style sync.
