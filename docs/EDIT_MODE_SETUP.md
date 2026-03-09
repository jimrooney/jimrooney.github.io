# Edit Mode Setup (Apps Script Web App)

The site now saves the entire dashboard as one JSON blob in a single sheet cell.

- Read path:
  - frontend first tries `LinksJson!A1`
  - if that cell is missing or empty, it falls back to the legacy row-based `Links` sheet
- Write path:
  - exiting edit mode posts one `set_links_json` request
  - Apps Script writes the JSON string into `LinksJson!A1`

## JSON Shape

The saved document looks like:

```json
{
  "version": 1,
  "items": [
    { "type": "section", "title": "Planning" },
    { "type": "link", "label": "Weather", "href": "https://windy.com", "icon": "mdi:weather-windy" },
    { "type": "html", "html": "<div>Custom block</div>" }
  ]
}
```

Supported item types:

- `section`: starts a titled section
- `link`: normal dashboard button/icon tile
- `html`: raw HTML block inserted into the current section

## Frontend Payload

`index.html` now sends:

```json
{
  "action": "set_links_json",
  "token": "your-shared-token",
  "sheet": "LinksJson",
  "row": 1,
  "col": 1,
  "json": "{\n  \"version\": 1,\n  \"items\": []\n}"
}
```

- `sheet` defaults to `LinksJson`
- `row` and `col` default to `1`
- `json` is the entire dashboard state

## Apps Script `Code.gs`

Use this in your script project attached to the spreadsheet:

```javascript
const SPREADSHEET_ID = "1ZQDN58WT5hdFVYiJA7yIJocm4vbc0Gw8ecJUj1pkYwg";
const SHARED_TOKEN = "replace_me";

function doOptions() {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || "{}");
    if (body.token !== SHARED_TOKEN) {
      return jsonResponse({ ok: false, error: "Unauthorized" });
    }

    const action = String(body.action || "");
    const sheetName = String(body.sheet || "LinksJson");
    const row = Number(body.row || 1);
    const col = Number(body.col || 1);
    const json = String(body.json || "");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return jsonResponse({ ok: false, error: "Sheet not found" });
    }

    if (action === "set_links_json") {
      if (!json) {
        return jsonResponse({ ok: false, error: "json is required" });
      }
      JSON.parse(json);
      sheet.getRange(row, col).setValue(json);
      return jsonResponse({ ok: true, action: action, sheet: sheetName, row: row, col: col });
    }

    return jsonResponse({ ok: false, error: "Unsupported action" });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Sheet Setup

1. Create a sheet tab named `LinksJson`.
2. Put the JSON document in cell `A1`.
3. Keep the legacy `Links` tab during migration if you want the frontend fallback.

## Deploy Steps

1. Open Apps Script.
2. Paste code above into `Code.gs`.
3. Set your own long `SHARED_TOKEN`.
4. Deploy:
   - `Deploy -> New deployment`
   - Type: `Web app`
   - Execute as: `Me`
   - Who has access: `Anyone`
5. Copy the Web App URL.
6. On your site, enable `Edit Mode`, then click `Configure Save API` and paste:
   - Web App URL
   - same shared token

## Notes

- Save happens once when edit mode exits.
- If the Save API is not configured, you can still edit locally and discard queued changes on exit.
- The old row-based Apps Script actions are no longer used by the frontend.
