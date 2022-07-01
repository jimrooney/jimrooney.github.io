class Airplanes {
  constructor() {}
  getPlane(reg) {
    // *** Need logic here to not only get the type of plane, but the specific WB data for that rego.
    // for now, we'll just hardcode the rego to type

    //this.loadPlanes()

    let type
    switch (reg) {
      case "PPR":
      case "MMZ":
        type = "C208"
        break
      case "JTK":
        type = "C206"
        break
      case "LOR":
        type = "GA8"
        break
    }

    let plane
    switch (type) {
      case "C206":
        plane = new C206(reg)
        break
      case "C208":
        plane = new C208(reg)
        break
      case "GA8":
        plane = new GA8(reg)
        break
      default:
        plane = new C206(reg)
        break
    }
    const _plane = data.airplanes.find((p) => p.reg == reg)

    plane = Object.assign(plane, _plane) // merge plane data
    plane.fuelSelector = this.getFuelSelector(plane)
    return plane
  }
  getFuelSelector(plane) {
    //const values = ["dog", "cat", "parrot", "rabbit"]
    const N = 60
    const values = [...Array(N).keys()]

    const select = document.createElement("select")
    select.name = "fuel"
    select.id = "fuel"

    for (const val of values) {
      const option = document.createElement("option")
      option.value = val * 10
      option.text = val * 10
      select.appendChild(option)
    }

    const label = document.createElement("label")
    label.innerHTML = "Fuel Litres: "
    label.htmlFor = "fuel"

    label.appendChild(select)
    const _this = this
    select.onchange = function () {
      plane.changeFuel(this.value)
    }
    return label
  }
  loadPlanes() {
    console.log("Json: ", data.airplanes)
  }
}
