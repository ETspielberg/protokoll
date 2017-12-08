import {Injectable} from '@angular/core';
import {Eventanalysis} from '../model/Eventanalysis';
import {Stockcontrol} from '../model/Stockcontrol';
import {Datapoint} from '../model/Datapoint';

@Injectable()
export class AnalyzerService {

  public eventanalysis: Eventanalysis;

  calculateAnalsis(plotData: Map<string, Datapoint[]>, yearsOfLoans: number, yearsOfRequests: number): Eventanalysis {
    this.eventanalysis = new Eventanalysis(0, 0, 0, 0, 0, 0);
    const dayInMillis = 3600 * 24 * 1000;
    const yearInMillis = 365 * dayInMillis;
    const today = new Date().getTime();
    const startDateLoans = today - yearsOfLoans * yearInMillis;
    const startDateRequests = today - yearsOfRequests * yearInMillis;
    const loans = plotData['loans'];
    const stock = plotData['stock'];
    this.eventanalysis.lastStock = stock[stock.length - 1];
    const requests = plotData['requests'];
    let timeLoaned = 0;
    let timeStock = 0;
    let timeRequests = 0;
    let lastTimeLoans = startDateLoans;
    let lastTimeRequests = startDateRequests;
    for (const datapoint of loans) {
      if (datapoint.x > startDateLoans) {
        timeLoaned += (datapoint.x - lastTimeLoans) * datapoint.y;
        lastTimeLoans = datapoint.x;
        if (datapoint.y > this.eventanalysis.maxLoansAbs) {
          this.eventanalysis.maxLoansAbs = datapoint.y;
        }
      }
    }
    for (const datapoint of stock) {
      if (datapoint.x > startDateLoans) {
        timeStock += (datapoint.x - lastTimeLoans) * datapoint.y;
        lastTimeLoans = datapoint.x;
      }
    }
    if (timeStock !== 0) {
      this.eventanalysis.meanRelativeLoan = timeLoaned / timeStock;
    }
    let lastValue = 0;
    for (const datapoint of requests) {
      if (datapoint.x > startDateRequests) {
        timeRequests = (datapoint.x - lastTimeRequests) * datapoint.y;
        if (datapoint.x > lastValue) {
          this.eventanalysis.numberRequests++;
        }
        if (datapoint.y > this.eventanalysis.maxNumberRequest) {
          this.eventanalysis.maxNumberRequest = datapoint.y;
        }
        lastTimeRequests = datapoint.x;
        lastValue = datapoint.y;
      }
    }
    this.eventanalysis.daysRequested = timeRequests / dayInMillis;
    return this.eventanalysis;
  }
}
