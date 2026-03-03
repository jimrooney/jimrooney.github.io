# Edit Mode Setup (Apps Script Web App)

This project can now send icon edits from `index.html` to a Google Apps Script web app.

The frontend posts JSON as a plain text body (`Content-Type: text/plain`) to avoid browser preflight/CORS issues.

## Frontend Payload

`index.html` sends:

```json
{
  "action": "set_icon",
  "token": "your-shared-token",
  "sheet": "Links",
  "row": 12,
  "icon": "mdi:airplane"
}
```

- `row` is 1-based sheet row index.
- `icon` is written to column C.
- For row deletion, payload is:

```json
{
  "action": "delete_row",
  "token": "your-shared-token",
  "sheet": "Links",
  "row": 12
}
```

## Apps Script `Code.gs`

Use this in your script project attached to the spreadsheet:

```javascript
const SPREADSHEET_ID = "1ZQDN58WT5hdFVYiJA7yIJocm4vbc0Gw8ecJUj1pkYwg";
const SHARED_TOKEN = "jr_icon_edit_2026_3f8cc9b17d5a4e7ea28c1d9f6ab340c2f71e5a9448b64d2c";

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

    const action = String(body.action || "set_icon");
    const sheetName = String(body.sheet || "Links");
    const row = Number(body.row);
    const icon = String(body.icon || "");

    if (!row || row < 1) {
      return jsonResponse({ ok: false, error: "Invalid row" });
    }

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return jsonResponse({ ok: false, error: "Sheet not found" });
    }

    if (action === "delete_row") {
      if (row > sheet.getLastRow()) {
        return jsonResponse({ ok: false, error: "Row out of range" });
      }
      sheet.deleteRow(row);
      return jsonResponse({ ok: true, action: action, row: row });
    }

    if (action === "set_icon") {
      // Column C = icon
      sheet.getRange(row, 3).setValue(icon);
      return jsonResponse({ ok: true, action: action, row: row, icon: icon });
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

- If you redeploy as a new version, update the URL in the site config.
- Keep the token private. Anyone with URL + token can write icons.
- Edit mode now supports:
  - setting/clearing column C icon values
  - deleting entire link rows from the sheet
