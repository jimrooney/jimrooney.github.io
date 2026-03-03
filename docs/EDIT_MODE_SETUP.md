# Edit Mode Setup (Apps Script Web App)

This project can now send icon edits from `index.html` to a Google Apps Script web app.

The frontend posts JSON as a plain text body (`Content-Type: text/plain`) to avoid browser preflight/CORS issues.

## Frontend Payload

`index.html` sends:

```json
{
  "token": "your-shared-token",
  "sheet": "Links",
  "row": 12,
  "icon": "mdi:airplane"
}
```

- `row` is 1-based sheet row index.
- `icon` is written to column C.

## Apps Script `Code.gs`

Use this in your script project attached to the spreadsheet:

```javascript
const SPREADSHEET_ID = "1ZQDN58WT5hdFVYiJA7yIJocm4vbc0Gw8ecJUj1pkYwg";
const SHARED_TOKEN = "replace-with-long-random-token";

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

    // Column C = icon
    sheet.getRange(row, 3).setValue(icon);
    return jsonResponse({ ok: true, row: row, icon: icon });
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
6. On your site, click `Configure Save API` and paste:
   - Web App URL
   - same shared token

## Notes

- If you redeploy as a new version, update the URL in the site config.
- Keep the token private. Anyone with URL + token can write icons.
- Current edit mode only writes column C (`icon`) and leaves columns A/B untouched.
