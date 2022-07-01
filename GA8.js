//
// Max weight in cargo area 680kg
//
class GA8 extends Airplane {
  constructor(...args) {
    super(...args)
    /*

1219 mm (48 in) aft of datum at 1089 kg (2400 lb) and below;
1448 mm (57 in) aft of datum at 1905 kg (4200 lb), linear variation
between these points.

*/
    //this.type = this.constructor.name // "GA8"
    this.limits = {
      weight: { empty: 0, MAUW: 1905, ramp: 1905, Landing: 1860 },
      // fwd1/2 [limit in M ,@ weight in kg]
      CG: {
        forward: 1.219,
        aft: 1.626,
        bounds: [{ fwd1: [1.219, 1089], fwd2: [1.448, 1905] }],
      },
    }
    ;(this.fuel = {
      capacity: 330,
      burnRate: 60,
      factor: 0.72,
      type: "100LL",
    }),
      (this.stations = [
        new Station({ type: ["seat"], arm: 0.965, id: 1 }),
        new Station({ type: ["seat"], arm: 0.965, id: 2 }),
        new Station({ type: ["seat"], arm: 1.772, id: 3 }),
        new Station({ type: ["seat"], arm: 1.772, id: 4 }),
        new Station({ type: ["seat"], arm: 2.523, id: 5 }),
        new Station({ type: ["seat"], arm: 2.523, id: 6 }),
        new Station({ type: ["seat"], arm: 3.247, id: 7 }),
        new Station({ type: ["seat"], arm: 3.247, id: 8 }),
        new Station({ type: ["fuel"], arm: 1.715, limit: 330, id: "fuel" }),
        new Station({
          type: ["cargo", "backShelf"],
          arm: 0,
          limit: 113,
          id: "BackShelf",
        }),
        new Station({
          type: ["cargo", "podBay"],
          arm: 1.5665,
          limit: 120,
          id: "PodBay1",
        }),
        new Station({
          type: ["cargo", "podBay"],
          arm: 2.3445,
          limit: 100,
          id: "PodBay2",
        }),
      ])
  }
}
