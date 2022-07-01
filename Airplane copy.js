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

    // this.burn = {
    //   // climb:
    //   // cruise:
    //   // descent:
    // }
    this.limit = {
      // cg: [forard,aft]
      // weight: [TO,LND,Ramp]
      // fuel: (capacity)
    }
    this.stations = [
      // {
      // accepts: ["crew","pax","cargo","seat","fuel","other"(controls/pods)] // perhaps more "others" details? *************
      // type: (any of the accepts)
      // weight:
      // arm:
      // limit:
      // }
    ]
    this.load = [
      // {
      //   id: // this.getNextLoadId() ... simple counter.
      //   station:
      //   type:
      //   weight:
      // },
      // {},
      // {}
    ]
    this.state = state // *** (maybe fixed with new {WB} object) breaks things if not set last (maybe because getFuelWeight() depends on it?)
    // if (!!stations) {
    //   this.updateStations(stations)
    // }
  }
  updateStations(stations) {
    // console.log("this.stations: ", this.stations)
    // console.log("replace with: ", stations)
    // // clear old stations and repopulate (could maybe do selective later so you can just pass in seats)
    // this.stations = []
    // stations.forEach((station) => {
    //   this.stations.push(new Station(station))
    // })
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
  getLoadedPlane(CellData) {
    const liters = this.getFuelQuantity(CellData)
    this.fuel = liters // this is setting weight not liters ***
    CellData.passengers.forEach((pax) => this.seatPax(pax)) // seat pax
    return this
  }
  getSeats() {
    const ret = this.stations.reduce((acc,station)=>{
      if  (station.type.includes("seat")){
        acc.push(station)
      }
      return acc
    },[])
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
    const liters = this.getFuelQuantity(CellData)
    const weight = liters * this.fuel.factor || 0
    return weight
  }
  getFuelEndurance(liters) {
    const decimal = liters / this.fuel.burnRate
    const hrs = time.decimalToHours(decimal)
    return {
      decimal: decimal,
      hrs: hrs,
      string: `${hrs.join(":")}(hrs)`,
    }
  }

  // -----------------------------------------------------------------------------------------------
  // Get Weight and Balance
  // -----------------------------------------------------------------------------------------------
  //
  //---------------------------------------
  // calculate CG based on load (WAM)
  // returns {wb} Object
  // --------------------------------------
  //
  // Given a load ({passengers, fuel}), return a WB object
  // If not given, load from {state}
  //
  getWB(ARGS) {
    /*
        {
          sad: {txt: 'Declared Weights', SAD: 'Declared', class: 'declaredWeights'}
          passengers: [{Pax},{Pax},{Pax}]
          fuel: {quantity: x, weight x,}
        }
      */
    let data = ARGS // eventually just swap ARGS for data (once we're done rooting out all the ARGS uses)

    // Build data.fuel (copy by value) with default 0 liters.
    data.fuel = {
      ...{ liters: data.PCF?.fuel || data.liters || 0 },
      ...this.fuel,
      ...data.fuel,
    }
    data.fuel.kg = this.getFuelWeight(data.fuel.liters) // needs to be done after we have the "for sure" fuel quantity ***
    // if no passengers, look into state (is this necessary?) ***
    if (!!data.passengers) {
      data.passengers = this.state.data[this.cell.cellID]?.passengers
    }
    // Probably can remove this but need to remove PIC check first (dependant on it) ***
    // Seat passengers
    if (!data.passengers) {
      //if none are passed in
      this.state.data[this.cell.cellID]?.passengers?.forEach((pax) => {
        this.seatPax(pax)
      })
    }
    //
    // copy so we don't change the original data
    //
    let stations = Array.from(this.stations)
    let fuelStation = stations.find((station) => station.type.includes("fuel"))
    fuelStation.liters = data.fuel.liters // load in fuel liters from data object
    stations.forEach((station) => {
      station.moment = station.weight * station.arm
    })
    // ---------------------------
    // override the plane's moment
    // ---------------------------
    // *** I don't think there's ever a plane station, so this gets called every time.
    const planeStation = stations.filter((station) =>
      station.type.includes("airplane")
    )
    // -----------------------------
    // if no plane station, make one
    // -----------------------------
    if (planeStation.length <= 0) {
      //
      // Since our airplane data moments inexplicably don't equal weight*arm, we need a seperate Station object for them.
      //
      let station = new Station({
        type: ["airplane"],
        weight: this.weight,
        arm: this.arm,
      })
      station.moment = this.moment
      stations.push(station)
    }
    // ---------------------------
    // Sum all Weights and Moments
    // ---------------------------
    let pob = stations.filter(
      (station) => station.type.includes("seat") && !!station.weight
    ) // only occupied seats
    const cargo = stations.filter(
      (station) => station.type.includes("cargo") && station.weight > 0
    )
    pob = this.convertToSAD(pob, data.SAD)

    const ZFW = stations.filter((station) => !station.type.includes("fuel")) // Everything but fuel
    const fuel = stations.filter((station) => station.type.includes("fuel"))

    // update fuel station
    const fuelQuantity = fuel.reduce((acc, station) => station.liters, 0)
    fuel[0].weight = fuelQuantity * this.fuel.factor // only one fuel station ***

    const CREW = pob.filter((station) => {
      if (!!station.pax) {
        station.pax.find((pax) => !!pax && pax.label == "Role") // only return pax with Roles (crew)
      }
    })
    //
    // Find the PIC (Flies Left Seat, so find works, but could also search by matching seat number) ****
    //
    const PIC = CREW.find((station) =>
      station.pax.find((pax) => pax.label == "Role" && pax.value == "PIC")
    )
    const PAX = pob.filter((x) => !CREW.includes(x)) // Filter out Crew

    const POB_Weight = pob.reduce(
      (total, station) => total + parseFloat(station.weight),
      0
    )
    const CREW_Weight = CREW.reduce(
      (total, station) => total + parseFloat(station.weight),
      0
    )

    const PAX_Weight = POB_Weight - CREW_Weight
    const ZFW_Weight = ZFW.reduce(
      (total, station) => total + parseFloat(station.weight),
      0
    )

    const totalWeight = stations.reduce(
      (total, station) => total + parseFloat(station.weight),
      0
    )
    const totalMoment = stations.reduce(
      (total, station) => total + parseFloat(station.moment),
      0
    )

    //
    const CG = totalMoment / totalWeight
    const roundCG = Math.round((CG + Number.EPSILON) * 1000) / 1000
    const roundAUW = Math.round((totalWeight + Number.EPSILON) * 100) / 100
    let isBalanced = this.isBalanced(totalWeight, CG)
    //
    // Build {wb} Object
    //
    let WAM = [
      stations.reduce((acc, x) => {
        acc.push(x.weight)
        return acc
      }, []),
      stations.reduce((acc, x) => {
        acc.push(x.arm)
        return acc
      }, []),
      stations.reduce((acc, x) => {
        acc.push(x.moment)
        return acc
      }, []),
    ]
    WAM = utility.transpose(WAM)

    const wb = {
      SAD: data.SAD,
      stations: stations,
      POB: pob,
      crew: {
        stations: CREW,
        pic: PIC,
      },
      TotalWeight: totalWeight,
      TotalMoment: totalMoment,
      CG: CG,
      cg: {
        position: CG,
        balanced: isBalanced,
        fwdLimit: this.getForwardCGLimit(totalWeight, this.limits.CG.bounds[0]),
        imperial: {
          TotalWeight: totalWeight * 2.2,
          CG: CG * 39.3701,
          fuelWeight: (totalWeight - ZFW_Weight) * 2.2,
        },
      },
      weights: {
        crew: CREW_Weight,
        pob: POB_Weight,
        pax: PAX_Weight,
        zfw: ZFW_Weight,
        auw: totalWeight,
        fuel: totalWeight - ZFW_Weight,
      },
      fuel: {
        liters: fuelQuantity,
        kg: fuelQuantity * data.fuel.factor,
        endurance: this.getFuelEndurance(data.fuel.liters), // fuelQuantity / data.fuel.burnRate,
      },
      rounded: {
        AUW: roundAUW,
        CG: roundCG,
      },
      WAM: WAM,
    }
    return wb
  }

  getNextLoadId() {
    // return highest ID in current load + 1
    let count = 0
    this.load.forEach((element) => {
      if (element.id >= count) {
        count = element.id + 1
      }
    })
    return count
  }







/*

  /|
h/ | o
/__|
  a
o = weight
h = slope
a = CG

const rad = Math.atan(o/a)
First use trig to calculate the "rad" (angle.. in radians)

h = o2 / Math.sin(rad)
Use trig again to calculate the hypotenuse for any given "o" (opposite length... the weight in this case)

Once I have the opposite and hypotenuse, I can use the Pythagorean Theorem to calculate the "a" length (the CG limit in this case)

a = Math.sqrt(h*h - o*o) // Adjacent

getForwardLimit(weight){
  ** o1 and a1 come from the plane's limit chart **
  const rad = Math.atan(o1/a1)
  const h = weight / Math.sin(rad)
  const limit = Math.sqrt(h*h - weight*weight)
  return limit
}

*/
  getForwardCGLimit(weight, bounds) {
    //
    // Need parseInt and check weight is valid before anything
    //
    // bounds [limit,weight] (coordinates on the plotted WB chart)
    //
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
  getCGLimit(weight) {
    // returns [foward,aft] limits for a given weight
    // Defaults to simple [forward,aft] limits unless overridden with more complex calculations.
    let forward = this.getForwardCGLimit(weight)
    let aft = this.limits.CG.aft
    return [forward, aft]
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
  sortStations(args) {
    const stations = args.stations || Array.from(this.stations)
    const seats = stations.filter((station) => station.type.includes("seat"))
  }
}
