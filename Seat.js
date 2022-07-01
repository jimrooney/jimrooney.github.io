class Seat {
  constructor(station) {
    this.data = station
    this.weightClass = station.weightClass || 0
  }
  getNode() {
    const newDiv = document.createElement("div")
    this.node = newDiv
    newDiv._script = this
    newDiv.className = "Pax"
    //newDiv.addEventListener("click",this.click()) --- doesn't work... needs to be wrapped ()=>
    newDiv.addEventListener("click", () => this.click())

    this.showWeightClass()
    return newDiv
  }
  click() {
    this.changeClass()
  }
  changeClass() {
    this.weightClass++
    if (this.weightClass == 4) {
      this.weightClass = 0
    }
    this.data.weightClass = this.weightClass
    this.showWeightClass()
    root.update()
  }
  showWeightClass(){
    this.node.className = ""
    switch (this.weightClass){
      case 1: 
      this.node.classList.add("Adult")
      this.data.weight = 86
      break
      case 2: 
      this.node.classList.add("Child")
      this.data.weight = 43
      break
      case 3: 
      this.node.classList.add("AdultInfant")
      this.data.weight = 101
      break
      default: 
      this.data.weight = 0
      // Empty Seat
      break
        }
  this.node.classList.add("Pax")
  }
}
