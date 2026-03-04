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
4. Ensure publish completion sound plays: `C:\Home\Jim\System\sounds\garage.wav`

Prefer one clean commit per publish.

## Security

- Never commit API secrets
- OAuth client IDs are acceptable
- This repository is public

## Purpose of AI Context

This file provides persistent project knowledge so the AI understands the repository even in new chat sessions.
