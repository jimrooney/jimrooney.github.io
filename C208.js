class C208 extends Airplane {
  constructor(...args) {
    super(...args)

    //this.type = this.constructor.name // "C208"
    this.limits = {
      weight: { empty: 0, MAUW: 3994.7, ramp: 4010, Landing: 3855.5 },
      // fwd1/2 [limit in M ,@ weight in kg]
      CG: {
        forward: 4.699,
        aft: 5.19176,
        bounds: [
          { fwd1: [4.699, 2948.35], fwd2: [4.90982, 3628.739] }, // 185 in at 6500 lbs - 194.5 in at 8000 lbs
          { fwd1: [4.9403, 3628.739], fwd2: [5.05968, 3994.788] },
        ],
      },
    }
    ;(this.fuel = {
      capacity: 1283.3,
      burnRate: 182,
      factor: 0.8,
      type: "JetA",
    }),
      (this.stations = [
        new Station({ type: ["seat", "crew"], arm: 3.4417, id: 1 }),
        new Station({ type: ["seat", "crew"], arm: 3.4417, id: 2 }),

        new Station({ type: ["seat"], arm: 4.3307, id: 3 }),
        new Station({ type: ["seat"], arm: 4.3307, id: 4 }),

        new Station({ type: ["seat"], arm: 5.0927, id: 5 }),
        new Station({ type: ["seat"], arm: 5.0927, id: 6 }),

        new Station({ type: ["seat"], arm: 5.8547, id: 7 }),
        new Station({ type: ["seat"], arm: 5.8547, id: 8 }),

        new Station({ type: ["seat"], arm: 6.6167, id: 9 }),
        new Station({ type: ["seat"], arm: 6.6167, id: 10 }),

        new Station({ type: ["seat"], arm: 7.3787, id: 11 }),
        new Station({ type: ["seat"], arm: 7.3787, id: 12 }),

        new Station({ type: ["seat"], arm: 8.69696, id: 13 }),
        new Station({ type: ["seat"], arm: 8.69696, id: 14 }),

        new Station({ type: ["fuel"], arm: 5.175758, id: "Fuel" }),
        new Station({ type: ["cargo"], arm: 3.44, limit: 113 }),
        new Station({ type: ["cargo", "podBay"], arm: 4.62534, id: "bay1" }),
        new Station({ type: ["cargo", "podBay"], arm: 5.92836, id: "bay2" }),
        new Station({ type: ["cargo", "podBay"], arm: 3.36296, id: "bay3" }),
        new Station({ type: ["cargo", "podBay"], arm: 7.30504, id: "bay4" }),
      ])
  }
}
