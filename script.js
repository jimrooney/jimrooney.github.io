// Register the serviceworker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").then(function () {
    console.log("Service Worker Registered")
  })
}

// jQuery style DOM selector... cuz it's easier
function $(x) {
  return document.getElementById(x)
}

// Prototype .clear() onto all DOM elements
HTMLElement.prototype.empty = function () {
  while (this.firstChild) {
    this.removeChild(this.firstChild)
  }
}
function init() {
  return
  root.plane = new C208({ reg: "test" })
  console.log("Instance: ", root.plane.constructor.name)

  const getMethods = Object.keys(document)
  // console.log("Names: ", getMethods)
  // console.log("Plane: ", root.plane)
  const seats = root.plane.getSeats()

  // console.log("Seats: ", seats)

  const container = $("Container")
  const node = document.createElement("div")
  node.addEventListener("click", () => {
    //console.log("Plane: ", root.plane)
  })

  seats.forEach((seat) => {
    const s = new Seat(seat)
    node.appendChild(s.getNode())
  })

  // const textnode = document.createTextNode("More")
  // node.appendChild(textnode)
  container.appendChild(node)
}
function sendMail() {}
