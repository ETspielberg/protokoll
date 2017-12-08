/**
 * Created by etspi on 25.06.2017.
 */

export class Eventanalysis {

  constructor(public meanRelativeLoan: number,
              public lastStock: number,
              public maxLoansAbs: number,
              public maxNumberRequest: number,
              public daysRequested: number,
              public numberRequests: number) {
  }
}
