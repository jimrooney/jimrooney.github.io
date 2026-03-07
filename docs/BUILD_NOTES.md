# Build Notes

## 2026-03-07

### Editable Label In Icon Modal
- Added an editable `Label` field to the icon chooser modal in edit mode.
- Added `Save Label` action (and Enter key submit) to persist label updates.
- Frontend now posts `action: "set_label"` to update column A for the selected row.
- Updated Apps Script setup docs with `set_label` payload and handler example.

### Editable Link URL In Icon Modal
- Added an editable `Link` URL field to the icon chooser modal in edit mode.
- Added `Save Link` action (and Enter key submit) to persist URL updates.
- Frontend now posts `action: "set_href"` to update column B for the selected row.
- Updated Apps Script setup docs with `set_href` payload and handler example.

## 2026-03-05

### Publish Sound Automation
- Added `scripts/publish.ps1` to standardize publish steps (commit + push).
- Added publish-complete sound playback for `C:\Home\Jim\System\sounds\gotthis.wav`.
- Updated `AI_CONTEXT.md` so publish now explicitly requires running the script and playing the sound.

### Sound Routing Update
- Switched publish-complete sound from `garage.wav` to `gotthis.wav`.
- Added agent rule: use `garage.wav` only when a blocking user prompt/decision is required.
- Added agent rule: use `gotthis.wav` at completion checkpoints (task finished and validated, awaiting user direction).

### Publish Workflow Clarification
- Updated `AI_CONTEXT.md` to mark publish handling as an explicit agent rule.
- Clarified that when the user says `publish`, the agent should execute the documented workflow exactly.

## 2026-03-04

### Section Containers Replacing Raw `<hr>` Lines
- Reworked link rendering to create bordered section containers instead of rendering raw separator lines.
- Sheet `HTML` rows containing `<hr>` now start a new section.
- Empty sections are removed automatically unless they contain a section title.

### Titled Section Bars
- Added section title parsing for `<hr>` separator rows.
- Supported title sources:
  - `data-title` attribute on `<hr>`
  - `title` attribute on `<hr>`
  - fallback text in the same HTML cell
- Added a full-width styled title bar (`.section-title`) with a compact, darker blue look.

### Edit Mode UI Trim
- `Configure Save API` button now appears only while edit mode is on.
- Removed instructional status text shown on edit mode toggle.

### Drag-and-Drop Reordering (Edit Mode)
- Added drag/drop support for link tiles while edit mode is enabled.
- Drop target is highlighted to show insertion point.
- Frontend sends `action: "move_row"` with `row` and `targetRow`, then reloads links from the sheet on success.
- Updated insertion logic to match right-side drop marker (drop after hovered tile).

### Edit Mode Quick Entry/Exit
- Added long-press activation on link tiles (works with touch and mouse hold).
- Added click-off behavior to exit edit mode when clicking outside buttons/controls/modal.

### HUD Visual Pass
- Applied a futuristic HUD-style theme refresh with neon cyan accents, darker glass panels, and techno typography.
- Added layered radial ring/glow background treatment across the page.
- Added header-specific image background support using `images/hud-title-bg.png`.
- Tuned the global ring treatment back to the flatter version while keeping the new HUD palette and component styling.

### Edit Mode Content Creation
- Added `Add Button` control (visible in edit mode) to append new links to the sheet.
- Added `+ Title Bar` control for untitled sections to create/update section titles in the sheet.
- Added Apps Script action support docs for:
  - `add_link`
  - `set_section_title`
  - `insert_section_break`

### Android/Touch Reorder Support
- Added pointer-based touch drag reorder flow for edit mode to support browsers where HTML5 drag/drop is unreliable (for example Android Brave).
- Kept desktop drag/drop behavior intact.

## 2026-03-03

### Navbar Link Click Area Fix
- Moved button styling class (`BlueBox`) to the anchor element so the full visible button area is clickable.
- Preserved spacing and hover behavior with targeted CSS updates.

### Sheet-Driven Icons
- Added optional icon support using Google Sheet column C.
- Expected icon value formats:
  - Iconify ID (example: `lucide:plane`, `mdi:airplane`)
  - Direct image URL
- If column C is empty, renderer falls back to text-only link.

### Icon + Label Rendering
- Icon rows render icon above label, with small label text and fixed icon size.
- Added inline layout guards for icon rows to reduce cache-related visual drift.
- Tightened icon button horizontal spacing to remove excess side padding.

### Icon Chooser Utility
- Added `icon-chooser.html` to pick icons and copy icon ID or URL.
- Added icon source selector aligned with in-page edit modal sets.
- Added full-set browsing toggle with pagination controls (`Previous` / `Next`).
- Replaced broken `solar-bold` set with working `ph` (Phosphor) set.

### Button Visual Style
- Replaced hatched button background with solid light blue (`#9cb9e6`).

### Edit Mode Enhancements
- Added in-page edit mode controls to update icon values directly in the sheet.
- Added per-link delete control (dash-in-circle) in edit mode to delete rows from the sheet.
- Added modal link to open `icon-chooser.html` in a separate tab.

### Visual Refresh (Option A)
- Updated homepage to a dark aviation-themed gradient background.
- Added elevated header panel and updated title/tagline:
  - `JimRooney.com`
  - `Welcome to the house of Jim`
- Refined tile buttons, editor controls, and modal styling to match the new visual direction.

### Design Exploration Assets
- Added SVG mockups for UI direction exploration:
  - `images/ui-mockup-option-a.svg`
  - `images/ui-mockup-option-b.svg`
  - `images/ui-mockup-option-c.svg`
