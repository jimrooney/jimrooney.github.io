# Architecture

## Overview
- This site renders a link dashboard from Google Sheets using the Google Visualization endpoint (`gviz/tq`).
- The frontend now prefers a single JSON blob in `LinksJson!A1` and falls back to the legacy row-based `Links` tab if the JSON sheet is absent.
- Client-side code normalizes data into an in-memory `items` array containing:
  - `section`
  - `link`
  - `html`

## Data Contract (Preferred JSON)
- Stored in `LinksJson!A1`.
- Shape:
  - `version`
  - `items[]`

### Item Types
- `section`
  - `title`
- `link`
  - `label`
  - `href`
  - `icon` (optional)
- `html`
  - `html`

## Legacy Data Contract (Fallback Sheet)
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
- The header also contains a fixed home icon link that routes through `toru-home.html`.
- `toru-home.html` is a static helper page for Toru Home navigation:
  - if served over plain HTTP, it probes the local LAN target briefly and redirects there when reachable
  - if served over HTTPS, it falls back directly to the Tailscale hostname because browsers generally block reliable HTTPS-to-HTTP reachability probes

## Edit Mode Workflow
- Edit mode is toggled client-side in `index.html`.
- Edit mode can also be enabled by long-pressing a link tile (touch or mouse hold).
- `Configure Save API` button is visible only while edit mode is enabled.
- Clicking outside tiles/controls exits edit mode.
- In edit mode:
  - add-button flow updates the local `items` array
  - untitled sections show `+ Title Bar`, which inserts a local `section` item
  - drag-and-drop on link tiles reorders the DOM immediately and updates the local `items` array
  - clicking a link opens an icon modal
  - modal label/link/icon edits update the local `items` array
  - delete button removes a local `link` item
  - exiting edit mode posts the full JSON document once
- API configuration (endpoint + token) is stored in browser `localStorage`.

## Apps Script Contract
- Frontend sends plain text JSON body to avoid browser preflight issues.
- Supported action:
  - `set_links_json`: writes the entire dashboard document to a single cell
- Deployment and server code are documented in `docs/EDIT_MODE_SETUP.md`.

## Utility Page
- `icon-chooser.html` is a local helper for selecting icon IDs/URLs.
- Supports the same icon sets as in-page modal:
  - `mdi`, `lucide`, `heroicons-solid`, `heroicons-outline`, `tabler`, `fa6-solid`, `material-symbols`, `ion`, `ph`
- Supports search and full library browsing with pagination.

## Publish Workflow
- In this project, `publish` means:
  - update docs for the completed changes
  - commit changes to git
  - push to GitHub (`origin/master`)

## Visual Direction
- Current homepage styling uses the Option A aviation ops-deck direction:
  - dark HUD-style gradient and ring overlays
  - elevated header panel with optional image background (`images/hud-title-bg.png`)
  - cyan glow accents and high-contrast rounded action tiles
