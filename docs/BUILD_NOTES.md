# Build Notes

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
