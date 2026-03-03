# Architecture

## Overview
- This site renders a link dashboard from a Google Sheet (`Links` tab) using the Google Visualization endpoint (`gviz/tq`).
- Client-side code pulls rows and converts each row into either:
  - raw HTML block (`label === "HTML"`)
  - normal link button
  - icon link button (if icon column is present)

## Data Contract (Google Sheet)
- Column A: `label`
- Column B: `href`
- Column C: `icon` (optional)

### Section Break Rows
- Rows with `label === "HTML"` and `<hr>` in column B are treated as section breaks.
- Optional section title can be supplied as:
  - `<hr data-title="Favorites">`
  - `<hr title="Favorites">`
  - text in the same HTML cell alongside `<hr>` (fallback)
- Renderer groups links into bordered `.links-section` containers, one per section break.

### Icon Column Behavior
- Empty C: render text button.
- Non-empty C:
  - If value contains `:` treat as Iconify ID and build URL: `https://api.iconify.design/{id}.svg`
  - Otherwise treat value as direct image URL.

## Rendering Rules
- Button style class is applied to anchor tags so click area matches visual area.
- Icon rows render:
  - icon graphic
  - small label text beneath icon
- Accessibility:
  - icon links keep `title` and `aria-label` from column A label.

## Edit Mode Workflow
- Edit mode is toggled client-side in `index.html`.
- Edit mode can also be enabled by long-pressing a link tile (touch or mouse hold).
- `Configure Save API` button is visible only while edit mode is enabled.
- Clicking outside tiles/controls exits edit mode.
- In edit mode:
  - drag-and-drop on link tiles reorders rows in the sheet via `action: "move_row"`
  - clicking a link opens an icon modal
  - selecting an icon posts `action: "set_icon"` to Apps Script
  - delete button posts `action: "delete_row"` to Apps Script
- API configuration (endpoint + token) is stored in browser `localStorage`.

## Apps Script Contract
- Frontend sends plain text JSON body to avoid browser preflight issues.
- Supported actions:
  - `set_icon`: writes icon value to column C
  - `delete_row`: deletes a row from the target sheet
  - `move_row`: moves one row before another target row
- Deployment and server code are documented in `docs/EDIT_MODE_SETUP.md`.

## Utility Page
- `icon-chooser.html` is a local helper for selecting icon IDs/URLs.
- Supports the same icon sets as in-page modal:
  - `mdi`, `lucide`, `heroicons-solid`, `heroicons-outline`, `tabler`, `fa6-solid`, `material-symbols`, `ion`, `ph`
- Supports search and full library browsing with pagination.

## Visual Direction
- Current homepage styling uses the Option A aviation ops-deck direction:
  - dark HUD-style gradient and ring overlays
  - elevated header panel with optional image background (`images/hud-title-bg.png`)
  - cyan glow accents and high-contrast rounded action tiles
