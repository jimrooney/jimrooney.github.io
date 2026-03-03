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

## Utility Page
- `icon-chooser.html` is a local helper for selecting icon IDs/URLs.
- Supports multiple icon sources and search filtering.

