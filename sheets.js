class DataLoader {
    constructor(options) {
      const sheetID = "1ZQDN58WT5hdFVYiJA7yIJocm4vbc0Gw8ecJUj1pkYwg"
      const base = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?`
      const sheetName = "Links"
      const query = encodeURIComponent("Select *")
      this.url = `${base}&sheet=${sheetName}&tq=${query}`
      this.data = []
      document.addEventListener("DOMContentLoaded", () => this.load())
    }
  
    load() {
      console.log("Fetching...")
      console.log("URL: ", this.url)
      fetch(this.url)
        .then((res) => res.text())
        .then((rep) => {
/* The line `//   console.log("reply: ", rep)` is a commented out line of code. It is not doing
anything in the code. It is likely used for debugging purposes, where the developer can uncomment
the line to print the `rep` variable to the console for inspection. */
        //   console.log("reply: ", rep)
          const jsData = JSON.parse(rep.substring(47).slice(0, -2)) // remove extra (non-JSON) formatting
          console.log("data loaded: ", jsData)
          this.data = jsData
          root.onload(jsData.table)
        })
    }
  }
  const myDataLoader = new DataLoader()