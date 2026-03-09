const SPREADSHEET_ID = "1ZQDN58WT5hdFVYiJA7yIJocm4vbc0Gw8ecJUj1pkYwg";
const SHARED_TOKEN = "jr_icon_edit_2026_3f8cc9b17d5a4e7ea28c1d9f6ab340c2f71e5a9448b64d2c";

function doOptions() {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    if (body.token !== SHARED_TOKEN) {
      return jsonResponse({ ok: false, error: "Unauthorized" });
    }

    const action = String(body.action || "set_icon");
    const sheetName = String(body.sheet || "Links");
    const row = Number(body.row);
    const col = Number(body.col || 1);
    const targetRow = Number(body.targetRow);
    const title = String(body.title || "").trim();
    const label = String(body.label || "").trim();
    const href = String(body.href || "").trim();
    const icon = String(body.icon || "");
    const json = String(body.json || "");

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return jsonResponse({ ok: false, error: "Sheet not found" });
    }

    if (action === "add_link") {
      if (!label || !href) {
        return jsonResponse({ ok: false, error: "label and href are required" });
      }
      sheet.appendRow([label, href, icon || ""]);
      return jsonResponse({ ok: true, action: action });
    }

    if (action === "insert_section_break") {
      if (!targetRow || targetRow < 1) {
        return jsonResponse({ ok: false, error: "Invalid targetRow" });
      }
      const hrHtml = sectionBreakHtml(title);
      sheet.insertRowsBefore(targetRow, 1);
      sheet.getRange(targetRow, 1, 1, 3).setValues([["HTML", hrHtml, ""]]);
      return jsonResponse({ ok: true, action: action, targetRow: targetRow });
    }

    if (action === "set_links_json") {
      const jsonRow = Number(body.row || 1);
      if (jsonRow < 1 || col < 1) {
        return jsonResponse({ ok: false, error: "Invalid row/col" });
      }
      if (!json) {
        return jsonResponse({ ok: false, error: "json is required" });
      }
      JSON.parse(json);
      sheet.getRange(jsonRow, col).setValue(json);
      return jsonResponse({ ok: true, action: action, row: jsonRow, col: col, sheet: sheetName });
    }

    if (!row || row < 1) {
      return jsonResponse({ ok: false, error: "Invalid row" });
    }

    if (action === "delete_row") {
      if (row > sheet.getLastRow()) {
        return jsonResponse({ ok: false, error: "Row out of range" });
      }
      sheet.deleteRow(row);
      return jsonResponse({ ok: true, action: action, row: row });
    }

    if (action === "move_row") {
      if (!targetRow || targetRow < 1) {
        return jsonResponse({ ok: false, error: "Invalid targetRow" });
      }
      if (row > sheet.getLastRow() || targetRow > sheet.getLastRow()) {
        return jsonResponse({ ok: false, error: "Row out of range" });
      }
      if (row !== targetRow && row + 1 !== targetRow) {
        moveRowBefore(sheet, row, targetRow);
      }
      return jsonResponse({ ok: true, action: action, row: row, targetRow: targetRow });
    }

    if (action === "set_section_title") {
      const currentLabel = String(sheet.getRange(row, 1).getValue() || "").trim();
      if (currentLabel !== "HTML") {
        return jsonResponse({ ok: false, error: "Row is not an HTML section break" });
      }
      sheet.getRange(row, 2).setValue(sectionBreakHtml(title));
      return jsonResponse({ ok: true, action: action, row: row, title: title });
    }

    if (action === "set_label") {
      if (!label) {
        return jsonResponse({ ok: false, error: "label is required" });
      }
      // Column A = label
      sheet.getRange(row, 1).setValue(label);
      return jsonResponse({ ok: true, action: action, row: row, label: label });
    }

    if (action === "set_href") {
      if (!href) {
        return jsonResponse({ ok: false, error: "href is required" });
      }
      // Column B = URL
      sheet.getRange(row, 2).setValue(href);
      return jsonResponse({ ok: true, action: action, row: row, href: href });
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

function moveRowBefore(sheet, fromRow, targetRow) {
  const numCols = sheet.getLastColumn();
  const rowValues = sheet.getRange(fromRow, 1, 1, numCols).getValues();
  sheet.deleteRow(fromRow);
  const insertAt = fromRow < targetRow ? targetRow - 1 : targetRow;
  sheet.insertRowsBefore(insertAt, 1);
  sheet.getRange(insertAt, 1, 1, numCols).setValues(rowValues);
}

function sectionBreakHtml(title) {
  const safeTitle = String(title || "").trim();
  return safeTitle ? `<hr data-title="${safeTitle}" />` : "<hr />";
}
