//
// Loads dashboard data from Google Sheets.
// Prefers a single JSON blob in the LinksJson sheet and falls back to legacy row data in Links.
//
class DataLoader {
  constructor(options) {
    this.sheetID = options?.sheetID || "1ZQDN58WT5hdFVYiJA7yIJocm4vbc0Gw8ecJUj1pkYwg"
    this.base = `https://docs.google.com/spreadsheets/d/${this.sheetID}/gviz/tq?`
    this.sheetName = options?.sheetName || "Links"
    this.jsonSheetName = options?.jsonSheetName || "LinksJson"
    document.addEventListener("DOMContentLoaded", () => this.load())
  }

  async fetchTable(sheetName, queryText) {
    const query = encodeURIComponent(queryText)
    const url = `${this.base}&sheet=${encodeURIComponent(sheetName)}&tq=${query}`
    const response = await fetch(url)
    const payload = await response.text()
    const jsData = JSON.parse(payload.substring(47).slice(0, -2))
    return jsData.table
  }

  async load() {
    try {
      const table = await this.fetchTable(this.jsonSheetName, "Select A limit 1")
      const rawJson = table?.rows?.[0]?.c?.[0]?.v
      if (typeof rawJson === "string" && rawJson.trim()) {
        const parsed = JSON.parse(rawJson)
        if (Array.isArray(parsed?.items)) {
          root.onload({ format: "json", items: parsed.items })
          return
        }
      }
    } catch (_) {
      // Fall back to the legacy row-based sheet when JSON storage is unavailable.
    }

    const table = await this.fetchTable(this.sheetName, "Select *")
    root.onload({ format: "legacy", rows: table?.rows || [] })
  }
}

const myDataLoader = new DataLoader()
