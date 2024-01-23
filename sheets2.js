const sheetID = "1ZQDN58WT5hdFVYiJA7yIJocm4vbc0Gw8ecJUj1pkYwg"
const base = `https://docs.google.com/spreadsheets/d/${sheetID}/gviz/tq?`
const sheetName = "Links"
const query = encodeURIComponent("Select *")
const url = `${base}&sheet=${sheetName}&tq=${query}`
const data = []
document.addEventListener("DOMContentLoaded", init)

function init() {
  console.log("Ready")
  fetch(url)
    .then((res) => res.text())
    .then((rep) => {
      console.log(rep)
      const jsData = JSON.parse(rep.substring(47).slice(0, -2)) // remove extra (non-JSON) formatting
      console.log(jsData)
      const colz = []
      jsData.table.cols.forEach((heading) => {
        console.log(heading)
        if (heading.id) {
            console.log("HL: ", heading.label)
          colz.push(heading.label.toLowerCase().replace(/\s+/g, "-"))
        }
      })
      jsData.table.rows.forEach((main) => {
        console.log("main: ", main)
        const row = {};
        colz.forEach((ele,ind)=>{
            console.log("ele: ", ele)
            row[ele] = main.c[ind]
        })
        data.push(row)
      })
      console.log("Data " , data)
    })
}
