---
name: github-workflow
description: >
  Enforces the Git/GitHub workflow for this project: every change must reference a Jira
  ticket, work happens on a branch named after the Jira ticket, and changes are committed
  and pushed before a PR is opened. Use this skill whenever the user wants to make any
  change to the repo — editing a file, adding an endpoint, fixing a bug, updating docs —
  or asks how to start working on something, create a branch, commit, or open a PR.
  Also trigger for prompts like "work on FER-123", "make a change for ticket X", or
  "push this up".
---

## Workflow for every change

### Step 1 — Get the Jira ticket

Ask the user for the Jira ticket ID if they haven't provided one (format: `FER-123`).
Every change, no matter how small, must be tied to a ticket.

### Step 2 — Check for an existing branch

```powershell
git branch --list "FER-123"          # local
git ls-remote --heads origin FER-123 # remote
```

- If the branch **already exists locally**, check it out:
  ```powershell
  git checkout FER-123
  ```
- If the branch **exists on remote but not locally**, track it:
  ```powershell
  git checkout --track origin/FER-123
  ```
- If the branch **does not exist**, create it from the latest `main`:
  ```powershell
  git checkout main
  git pull origin main
  git checkout -b FER-123
  ```

Branch name must match the Jira ticket ID exactly (e.g. `FER-123`) — no prefixes, no descriptions appended.

### Step 3 — Make the changes

Do the work. Follow the API conventions skill (`api-conventions`) when editing OpenAPI files.

### Step 4 — Commit

Every commit message must include the ticket ID:

```
FER-123: <short description of what changed>
```

Examples:
- `FER-123: add GET /sales/invoices endpoint`
- `FER-123: fix missing 404 response on trips by ID`
- `FER-123: add Invoice schema`

Stage only the files relevant to this ticket — avoid `git add .` if unrelated files are modified.

```powershell
git add <specific files>
git commit -m "FER-123: <description>"
```

### Step 5 — Push the branch

```powershell
git push -u origin FER-123
```

### Step 6 — Open a PR (when the work is ready)

```powershell
gh pr create `
  --title "FER-123: <short description>" `
  --body "Closes FER-123`n`n## Changes`n- <bullet points>" `
  --base main `
  --head FER-123
```

PR title format: `FER-123: <short description>` — same pattern as the commit message.

---

## Quick reference

| Situation | Command |
|---|---|
| New ticket, new branch | `git checkout main && git pull && git checkout -b FER-123` |
| Resume existing branch (local) | `git checkout FER-123` |
| Resume existing branch (remote only) | `git checkout --track origin/FER-123` |
| Commit | `git commit -m "FER-123: description"` |
| Push | `git push -u origin FER-123` |
| Open PR | `gh pr create --title "FER-123: ..." --base main` |

---

## Rules summary

- No commits directly to `main`.
- Every commit message starts with the Jira ticket ID.
- Branch name = Jira ticket ID, nothing else.
- Reuse an existing branch if one already exists for the ticket.
- One ticket → one branch → one PR.
