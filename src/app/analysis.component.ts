import {Component, Input} from '@angular/core';
import {Eventanalysis} from './model/Eventanalysis';
import {Datapoint} from './model/Datapoint';

@Component({
  selector: 'app-analysis',
  templateUrl: 'analysis.component.html'
})

export class AnalysisComponent {

  public eventanalysiss: Map<number, Eventanalysis>;

  public analyses: Eventanalysis[];

  public plotData: Map<string, Datapoint[]>;

  public activeAnalysis: Eventanalysis;

  public staticBuffer: number;

  public deletionProposal: number;

  public yearsOfLoans: number;

  @Input()
  get data() {
    if (this.plotData !== null) {
      this.reset();
    }
    return this.plotData;
  }

  set data(val) {
    this.plotData = val;
    if (val !== null) {
      this.reset();
    }
  }

  reset() {
    this.eventanalysiss = new Map<number, Eventanalysis>();
    this.analyses = [];
    this.staticBuffer = 20;
    this.deletionProposal = 0;
    this.yearsOfLoans = 5;
    const stocks = this.plotData['stock'];
    if (typeof stocks !== 'undefined') {
      const requests = this.plotData['requests'];
      const oldDate = new Date(stocks[0][0]);
      let year;
      if (typeof requests !== 'undefined') {
        const oldRequestsDate = new Date(requests[0][0]);
        year = Math.min(oldDate.getFullYear(), oldRequestsDate.getFullYear());
      } else {
        year = Math.min(oldDate.getFullYear());
      }
      const actualYear = new Date().getFullYear();
      while (year <= actualYear) {
        if (actualYear - year > 0 && actualYear - year <= 10) {
          this.eventanalysiss.set(actualYear - year, new Eventanalysis(year, 0, 0, 0));
        }
        year++;
      }
      this.calculateAnalysis();
    }
  }

  public calculateAnalysis() {
    this.eventanalysiss.forEach(
      (value: Eventanalysis, key: number) => {
        const analysis = this.calculateSingleAnalysis(this.plotData, key);
        this.eventanalysiss.set(key, analysis);
      }
    );
    this.analyses = [];
    this.eventanalysiss.forEach(entry => this.analyses.push(entry));
    this.activeAnalysis = this.eventanalysiss.get(this.analyses.length / 2);
    this.calculateDeletionProposal();
  }

  calculateDeletionProposal() {
    if (this.activeAnalysis) {
      const proposal = Math.floor((this.activeAnalysis.lastStock - this.activeAnalysis.maxLoansAbs) * (1 - this.staticBuffer / 100));
      this.deletionProposal = (proposal < 0) ? 0 : proposal;
    }
  }

  private calculateSingleAnalysis(plotData: Map<string, Datapoint[]>, yearsOfLoans: number): Eventanalysis {
    const eventanalysis = this.eventanalysiss.get(yearsOfLoans);
    const dayInMillis = 3600 * 24 * 1000;
    const yearInMillis = 365 * dayInMillis;
    const today = new Date().getTime();
    const startDateLoans = today - yearsOfLoans * yearInMillis;
    const loans = plotData['loans'];
    const stock = plotData['stock'];
    eventanalysis.lastStock = stock[stock.length - 1][1];
    let timeLoaned = 0;
    let timeStock = 0;
    let lastTimeLoans = startDateLoans;
    if (typeof loans !== 'undefined') {
      for (const datapoint of loans) {
        if (datapoint[0] > startDateLoans) {
          timeLoaned += (datapoint[0] - lastTimeLoans) * datapoint[1];
          lastTimeLoans = datapoint[0];
          if (datapoint[1] > eventanalysis.maxLoansAbs) {
            eventanalysis.maxLoansAbs = datapoint[1];
          }
        }
      }
    } else {
      eventanalysis.maxLoansAbs = 0;
    }
    for (const datapoint of stock) {
      if (datapoint[0] > startDateLoans) {
        timeStock += (datapoint[0] - lastTimeLoans) * datapoint[1];
        lastTimeLoans = datapoint[0];
      }
    }
    if (timeStock !== 0) {
      eventanalysis.meanRelativeLoan = timeLoaned / timeStock;
    }
    eventanalysis.years = yearsOfLoans;
    return eventanalysis;
  }
}
