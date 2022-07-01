class C206 extends Airplane {
    constructor(...args) {
      super(...args)

      //this.type = this.constructor.name // "C206"
      this.limits = {
        weight: {
          empty: 0,
          MAUW: 1719,
          Landing: 1632.933,
          Ramp: 1726.373,
          Takeoff: 1718.661,
        },
        // fwd1/2 [limit in M ,@ weight in kg]
        CG: {
          forward: 0.8382,
          aft: 1.26492,
          bounds: [{ fwd1: [0.8382, 1133.981], fwd2: [1.07188, 1632.933] }],
        },
      }
      ;(this.fuel = {
        capacity: 330,
        burnRate: 76,
        factor: 0.72,
        type: "100LL",
      }),
        (this.stations = [
          new Station({ type: ["seat"], arm: 0.9398, id: 1 }),
          new Station({ type: ["seat"], arm: 0.9398, id: 2 }),
          new Station({ type: ["seat"], arm: 1.778, id: 3 }),
          new Station({ type: ["seat"], arm: 1.778, id: 4 }),
          new Station({ type: ["seat"], arm: 2.54, id: 5 }),
          new Station({ type: ["seat"], arm: 2.54, id: 6 }),
          new Station({ type: ["fuel"], arm: 1.1811, id: "fuel" }),
        ])
    }
  }