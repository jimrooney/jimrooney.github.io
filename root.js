var root = {
  airplanes: new Airplanes(),
  test: function () {


    // if (window.indexedDB || self.IndexedDB){
    //   $("Log").innerHTML = `Supported ${window.indexedDB} ${self.IndexedDB}`
    //   return
    // }



    // if (!('indexedDB' in window)) {
    //   $("Log").innerHTML = 'IndexedDB is not supported'
    //   return
    // }

  //check for support
  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }

  const idb = window.indexedDB
  var dbPromise = idb.open('test-db2', 1, function(upgradeDb) {
    console.log('making a new object store');
    if (!upgradeDb.objectStoreNames.contains('firstOS')) {
      upgradeDb.createObjectStore('firstOS');
    }
  });









    $("Log").innerHTML = "Done"
    return

    if(window.IndexedDB){
      $("Log").innerHTML = 'IndexedDB is supported'
  }  else {
    $("Log").innerHTML = 'IndexedDB is not supported'
  }


  },
  IOSCheck(){
    const isIos = () => {
      const userAgent = window.navigator.userAgent.toLowerCase()
      return /iphone|ipad|ipod/.test(userAgent)
    }
    // Detects if device is in standalone mode
    const isInStandaloneMode = () =>
      "standalone" in window.navigator && window.navigator.standalone

    // Checks if should display install popup notification:
    if (isIos() && !isInStandaloneMode()) {
      $("Log").innerHTML = "iOS True, not installed"
    }
    if (isIos() && isInStandaloneMode) {
      $("Log").innerHTML = "iOS True, Installed"
    }
  },
  log: function (text) {
    //!elementID? elementID = "Log" : null
    elementID = "Log"
    $(elementID).innerHTML = text
    //$(elementID).innerHTML = text
  },
  element: (elementID) => {
    return $(elementID)
  },
  empty: (elementID) => {
    $(elementID).innerHTML = ""
  },
  JSONTable(json) {
    // const regex = /},/gi
    // return json.replace(regex, "}<BR>")
  },
  setPlane(plane) {
    this.airplanes.loadPlanes()
    this.empty("Container")
    this.plane = this.airplanes.getPlane(plane)
    this.update()
  },
  update() {
    // Color Bar
    document.getElementById("Log").style.background = this.plane.regcolor

    // Clear airplane container
    const container = document.getElementById("Container")
    container.innerHTML = ""
    const node = document.createElement("div")

    // Fuel
    $("Fuel").innerHTML = "" // Clear fuel selector
    $("Fuel").appendChild(this.plane.fuelSelector)
    const F = this.plane.stations.filter((station) =>
      station.type.includes("fuel")
    )
    const FQ = F.reduce((acc, station) => station.liters, 0)
    $("fuel").value = FQ || 0
    //
    // -- Seats --
    //
    const seats = this.plane.getSeats() // [{Station},{Station}]
    seats.forEach((seat) => {
      const s = new Seat(seat)
      node.appendChild(s.getNode())
    })
    container.appendChild(node)
    //
    // Show WB Table
    //
    const WB = this.plane.getWeightAndBalance()
    console.log("WB: ", WB)
    $("Out").innerHTML = ""
    $("Out").appendChild(WB.table)
  },
}
