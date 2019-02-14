export class Counter {

  constructor(public id: string,
              public platform: string,
              public month: number,
              public year: number,
              public totalRequests: number,
              public publisher: string,
              public title: string)
  {}
}
