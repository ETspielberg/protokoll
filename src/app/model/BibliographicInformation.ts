/**
 * Created by Eike on 17.07.2017.
 */

export class BibliographicInformation {

    constructor(
      public titleId: string,
      public isbn: string,
      public recKey: string,
      public doi: string,
      public authors: string[],
      public title: string,
      public subtitle: string,
      public publisher: string,
      public place: string,
      public year: string,
      public edition: string,
      public series: string,
      public volume: number,
      public keywords: string[],
      public type: string,
      public otherIdentifier: string,
      public fullDescription: string
    ) {}
}
