import {Dataset} from './Dataset';

export class Option {

    constructor(
        public title: object,
        public series: Dataset[],
        public yAxis?: object,
        public xAxis?: object,
        public chart?: object,
        public colors?: string[],
        public plotOptions?: object,
        public lang?: object,
        public tooltip?: object,
        public exporting?: object
    ) {}
}
