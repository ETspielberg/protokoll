import {Counter} from './Counter';

export class EbookCounter extends Counter {

  constructor(
    public id: string,
    public onlineIsbn: string,
    public printIsbn: string,
    public doi: string,
    public proprietary: string,
    public abbreviation: string,
    public title: string,
    public publisher: string,
    public platform: string,
    public type: string,
    public year: number,
    public month: number,
    public totalRequests: number,
    public htmlRequests?: number,
    public htmlRequestsMobile?: number,
    public pdfRequests?: number,
    public pdfRequestsMobile?: number,
    public psRequests?: number,
    public psRequestsMobile?: number,
    public epubRequests?: number,
    public sectionRequests?: number
  ) { super(id, platform, month, year, totalRequests, publisher, title); }
}
