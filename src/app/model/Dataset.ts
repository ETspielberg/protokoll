export class Dataset {

    constructor(
        public name: string,
        public data: number[][],
        public color?: string,
        public zIndex?: number,
    ) {}
}
