//
// Loads data from the jimrooney.com spreadsheet.
// 
class DataLoader {
    constructor(options) {
      this.sheetID = options?.sheetID || "1ZQDN58WT5hdFVYiJA7yIJocm4vbc0Gw8ecJUj1pkYwg"
      this.base = `https://docs.google.com/spreadsheets/d/${this.sheetID}/gviz/tq?`
      this.sheetName = options?.sheetName || "Links"
      this.query = encodeURIComponent("Select *")
      this.data = []
      document.addEventListener("DOMContentLoaded", () => this.load())
    }
  
    load() {
      console.log("Fetch")
      const url = `${this.base}&sheet=${this.sheetName}&tq=${this.query}`

      fetch(url)
        .then((res) => res.text())
        .then((rep) => {
        //   console.log("reply: ", rep)
          const jsData = JSON.parse(rep.substring(47).slice(0, -2)) // remove extra (non-JSON) formatting
          console.log("data loaded: ", jsData)
          this.data = jsData
          root.onload(jsData.table)
        })
    }
  }
  const myDataLoader = new DataLoader()