class Airplane {
  constructor(data, state, stations) {
    // data.REG data.Weight,data.ARM,data.Moment,data.Type,data.RegColor] *** update with new signature ***
    this.reg = data.reg
    this.regcolor = data.regcolor
    this.weight = data.weight
    this.arm = data.arm
    this.moment = data.moment
    this.type = data.type // this.constructor.name
    this.standardFuel = data.standardfuel || 0
    this.limit = {}
    this.stations = []
    this.load = []
    this.state = state // *** (maybe fixed with new {WB} object) breaks things if not set last (maybe because getFuelWeight() depends on it?)
  }
  get fuel() {
    if (!this._fuel) {
      return {
        capacity: 0,
        type: "100LL",
        factor: 0.72,
        weight: 0,
        burnRate: 60,
      }
    }
    return this._fuel
  }
  set fuel(fuel) {
    if (typeof fuel == "object" && !!fuel.burnRate) {
      this._fuel = { ...this._fuel, ...fuel }
    }
    if (fuel < 0) {
      const fuelStation = this.stations.find((station) =>
        station.type.includes("fuel")
      ) // get the station
      fuelStation.liters = fuel // modify the station
      fuel = { liters: fuel, weight: this.getFuelWeight() } // build the object to modify the fuel object (spread into)
      this._fuel = { ...this._fuel, ...fuel } // merge the new values via spread
    }
  }
  getSeats() {
    const ret = this.stations.reduce((acc, station) => {
      if (station.type.includes("seat")) {
        acc.push(station)
      }
      return acc
    }, [])
    return ret
  }
  getFuelQuantity(CellData) {
    let liters = 0
    if (!!CellData && !!CellData.PCF) {
      liters = CellData.PCF.liters || CellData.PCF.fuel
    }
    return liters
  }
  getFuelWeight(CellData) {
    return 0
    // const liters = this.getFuelQuantity(CellData)
    // const weight = liters * this.fuel.factor || 0
    // return weight
  }
  // *** could also just use plane.fuel = (setter/getter)
  changeFuel(quantity){
    const fuel = this.stations.find((station) => station.type.includes("fuel"))
    fuel.liters = parseInt(quantity)
    root.update()
  }
  getWeightAndBalance() {
    const result = {}
    const stations = this.stations //Array.from(this.stations) // dont think this is neccessary ***
    let fuelStation = stations.find((station) => station.type.includes("fuel"))


    fuelStation.liters = fuelStation.liters || 0 // load in fuel *** (hardcoding in a value for now)
    stations.forEach((station) => {
      station.moment = station.weight * station.arm
    })
    const planeStation = stations.find((station) =>
      station.type.includes("Airplane")
    )
    if (!planeStation) {
      // Airplane Station
      stations.push({
        id: 0,
        type: ["Airplane"],
        weight: this.weight,
        arm: this.arm,
        moment: this.moment,
      })
    }
    // ---------------------------
    // Sum all Weights and Moments
    // ---------------------------
    //
    // Occupied seats (POB)
    //
    const pob = stations.filter(
      (station) => station.type.includes("seat") && !!station.weight
    )
    // Cargo
    const cargo = stations.filter(
      (station) => station.type.includes("cargo") && station.weight > 0
    )
    // Fuel
    const ZFW = stations.filter((station) => !station.type.includes("fuel")) // Everything but fuel
    const fuel = stations.filter((station) => station.type.includes("fuel"))
    // sum fuel
    const fuelQuantity = fuel.reduce((acc, station) => station.liters, 0)
    fuel[0].weight = fuelQuantity * this.fuel.factor // only one fuel station ***
    // Total Crew
    const CREW = pob.filter((station) => {
      if (!!station.pax) {
        station.pax.find((pax) => !!pax && pax.label == "Role") // only return pax with Roles (crew)
      }
    })

    const PIC = stations.find((station) => station.id === 1) // Pilot Seat
    const PAX = pob.filter((x) => !CREW.includes(x)) // Filter out Crew

    // Sum all occupied seats
    const POB_Weight = pob.reduce(
      (total, station) => total + parseFloat(station.weight),
      0
    )
    // Sum Crew
    const CREW_Weight = CREW.reduce(
      (total, station) => total + parseFloat(station.weight),
      0
    )
    // Only Pax weight
    const PAX_Weight = POB_Weight - CREW_Weight
    // Zero Fuel Weight
    const ZFW_Weight = ZFW.reduce(
      (total, station) => total + parseFloat(station.weight),
      0
    )
    console.log("Stations: ", stations)
    // Total Weight
    const totalWeight = stations.reduce(
      (total, station) => total + parseFloat(station.weight),
      0
    )
    console.log("TotalWeight: ", totalWeight)
    // Total Moment
    const totalMoment = stations.reduce(
      (total, station) => total + parseFloat(station.moment),
      0
    )
    // CG
    result.CG = totalMoment / totalWeight
    // Rounding
    const roundCG = Math.round((result.CG + Number.EPSILON) * 1000) / 1000
    const roundAUW = Math.round((totalWeight + Number.EPSILON) * 100) / 100

    result.isBalanced = this.isBalanced(totalWeight, result.CG)
    result.wam = stations.map((a) => [a.weight, a.arm, a.moment]) // Just WAM

    //
    // Results Table
    //
    result.table = document.createElement("table")
    let tableData = result.wam
      .map(function (value) {
        return `<tr>
                    <td>${value[0]}</td>
                    <td>${value[1]}</td>
                    <td>${value[2]}</td>
                </tr>`
      })
      .join("")
      tableData += `<tr><td>${totalWeight}</td>
                    <td>CG: ${result.CG} </td>
                    <td>${totalMoment}</td></tr>
                    <tr><td>Is Balanced:</td><td></td><td>${result.isBalanced}</td></tr>
                    `
    result.table.innerHTML = tableData

    return result
  }
  isBalanced(totalWeight, CG) {
    const bounds = this.limits.CG.bounds // [{[],[]}] of bounds *** Ugly ***
    //
    // Check extreme bounds
    //
    let balanced = true
    if (CG > this.limits.CG.aft || CG < this.limits.CG.forward) {
      return false
    }
    //
    // Check Weight
    //
    if (totalWeight > this.limits.weight.MAUW) {
      return false
    }
    //
    // Check forward bounds
    //
    bounds.forEach((bound) => {
      const limit = this.getForwardCGLimit(totalWeight, bound)
      const wLower = bound.fwd1[1] // Lower Bound weight
      const wUpper = bound.fwd2[1] // Upper Bound weight

      if (totalWeight <= wUpper && totalWeight >= wLower) {
        balanced = CG > limit
      }
    })
    return balanced
  }

  getForwardCGLimit(weight, bounds) {
    if (!bounds) {
      return
    }
    const fwd1 = bounds.fwd1[0] // 1219
    const fwd2 = bounds.fwd2[0] // 1422
    const weight1 = bounds.fwd1[1] // 1089
    const weight2 = bounds.fwd2[1] // 1814

    const a = fwd2 - fwd1
    const o = weight2 - weight1
    const rad = Math.atan(o / a) // First use trig to calculate the "rad" (angle.. in radians)

    const o2 = weight - weight1 // (problem weight)
    const h2 = o2 / Math.sin(rad) // Use trig again to calculate the hypotenuse for any given "o" (opposite length... the weight in this case)

    const a2 = Math.sqrt(h2 * h2 - o2 * o2) // Adjacent
    const limit = fwd1 + a2 // 1000

    if (o2 < 0) {
      return bounds.fwd1[0]
    } else {
      return limit
    }
  }
  getAftCGLimit(weight) {
    return this.limits.CG.aft // *** For now. will make more complex if needed ***
  }
}
