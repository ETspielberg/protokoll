export class Dataset {

    constructor(
        public name: string,
        public data: number[][],
        public type?: string,
        public yAxis?: number,
        public color?: string,
        public zIndex?: number,
    ) {}
}
