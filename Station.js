  //
  // Weight in KG
  // Arm in Meter
  //
  class Station {
    constructor(data) {
      this.type = data.type || ""
      this.weight = data.weight > 0 ? data.weight : 0
      this.arm = data.arm || 0
      this.id = data.id
    }
    set moment(x) {
      // ignore
    }
    get moment() {
      this._moment = this.weight * this.arm
      if (this._moment < 0) {
        console.log(
          "Bad Moment, weight: %o arm: %o moment: %o",
          this.weight,
          this.arm,
          this._moment
        )
      }
      return this._moment
    }
  }