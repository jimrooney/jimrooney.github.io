# AI Context

This repository hosts **jimrooney.github.io**, a static website deployed with GitHub Pages.

The site uses plain HTML, CSS, and JavaScript with no build system.

## Important Files

- ARCHITECTURE.md → explains the overall site structure
- BUILD_NOTES.md → development notes and changelog
- EDIT_MODE_SETUP.md → describes edit-mode behavior
- icon-chooser.html → UI tool for browsing Iconify icon libraries

## Development Rules

When modifying this project:

- Prefer **small targeted edits**
- Do not rewrite files unnecessarily
- Maintain the current modular JavaScript structure
- Do not introduce frameworks or build tools unless requested
- This site must remain compatible with GitHub Pages static hosting

## Publish Workflow (Agent Rule)

Agent instruction:  
When the user says **publish**, execute the following workflow exactly:

1. Update BUILD_NOTES.md if any changes were made
2. Update ARCHITECTURE.md if architecture changed
3. Run `scripts/publish.ps1` to commit and push
4. Ensure publish completion sound plays via `scripts/play-sound.ps1` (randomized `.wav`)

Prefer one clean commit per publish.

## Prompt/Decision Alert (Agent Rule)

If a user prompt/decision is required to continue and cannot be safely assumed, play:

- `C:\Home\Projects\Code\Codex\Scripts\play-sound.ps1 needs-input`

Then ask the blocking question.

## Completion Checkpoint Alert (Agent Rule)

A "completion checkpoint" is when a requested task is finished, validated, and waiting on user direction (for example review or publish).

At completion checkpoints, play:

- `C:\Home\Projects\Code\Codex\Scripts\play-sound.ps1` (randomized `task-complete` sound from `C:\Home\Projects\Code\Codex\Sounds\task-complete`)

## Security

- Never commit API secrets
- OAuth client IDs are acceptable
- This repository is public

## Purpose of AI Context

This file provides persistent project knowledge so the AI understands the repository even in new chat sessions.
