# Build Notes

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
- Added icon source selector with multiple sets, including filled sets.

### Button Visual Style
- Replaced hatched button background with solid light blue (`#9cb9e6`).

