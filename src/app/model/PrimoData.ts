export class PrimoData {

  constructor(public recordId: string,
              public isbn: string,
              public type: string,
              public title: string,
              public authors: string,
              public edition: string,
              public year: string,
              public link: string,
              public thumbnailLink: string,
              public fulltextLink: string) {}
}
