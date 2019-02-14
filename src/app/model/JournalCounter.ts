import {Counter} from './Counter';

export class JournalCounter extends Counter {

    constructor(
        public id: string,
        public onlineIssn: string,
        public printIssn: string,
        public category: string,
        public doi: string,
        public proprietary: string,
        public abbreviation: string,
        public fullName: string,
        public publisher: string,
        public platform: string,
        public type: string,
        public year: number,
        public month: number,
        public htmlRequests: number,
        public htmlRequestsMobile: number,
        public pdfRequests: number,
        public pdfRequestsMobile: number,
        public psRequests: number,
        public psRequestsMobile: number,
        public totalRequests: number
    ) {
      super(id, platform, month, year, totalRequests, publisher, fullName);
    }
}
