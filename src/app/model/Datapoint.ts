export class Datapoint {

    constructor(
        public x: number,
        public y: number
    ) {}

    getData(): number[] {
      return [this.x, this.y];
    }
}
