import {Injectable} from '@angular/core';
import {Eventanalysis} from '../model/Eventanalysis';
import {Datapoint} from '../model/Datapoint';
import {Statistics} from '../model/Statistics';

@Injectable()
export class AnalyzerService {

  public eventanalysiss: Map<number, Eventanalysis>;

  public statistics: Map<number, Statistics>;

  plotData: Map<string, Datapoint[]>;

  reset(plotData: Map<string, Datapoint[]>) {
    this.plotData = plotData;
    this.statistics = new Map<number, Statistics>();
    this.eventanalysiss = new Map<number, Eventanalysis>();
    const stocks = plotData['stock'];
    const requests = plotData['requests'];
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
      this.statistics.set(year, new Statistics(year, 0, 0, 0, 0, 0, 0));
      if (actualYear - year > 0 && actualYear - year <= 10) {
        this.eventanalysiss.set(actualYear - year, new Eventanalysis(year, 0, 0, 0));
      }
      year++;
    }
  }

  getStatistics(): Statistics[] {
    const actualYear = new Date().getFullYear();
    this.fillAnalysisFields(this.plotData, 'loans', actualYear);
    this.fillAnalysisFields(this.plotData, 'cald', actualYear);
    this.fillAnalysisFields(this.plotData, 'stock', actualYear);
    this.fillAnalysisFields(this.plotData, 'requests', actualYear);
    const stats = [];
    this.statistics.forEach(
      entry => stats.push(entry)
    );
    return stats;
  }

  getAnalysis(): Eventanalysis[] {
    this.calculateAnalysis(this.plotData);
    const analyses: Eventanalysis[] = [];
    this.eventanalysiss.forEach(entry => analyses.push(entry));
    return analyses;
  }

  private calculateSingleAnalysis(plotData: Map<string, Datapoint[]>, yearsOfLoans: number): Eventanalysis {
    const eventanalysis = this.eventanalysiss.get(yearsOfLoans);
    const dayInMillis = 3600 * 24 * 1000;
    const yearInMillis = 365 * dayInMillis;
    const today = new Date().getTime();
    const startDateLoans = today - yearsOfLoans * yearInMillis;
    const loans = plotData['loans'];
    const stock = plotData['stock'];
    eventanalysis.lastStock = stock[stock.length - 1].y;
    let timeLoaned = 0;
    let timeStock = 0;
    let lastTimeLoans = startDateLoans;
    for (const datapoint of loans) {
      if (datapoint[0] > startDateLoans) {
        timeLoaned += (datapoint[0] - lastTimeLoans) * datapoint[1];
        lastTimeLoans = datapoint[0];
        if (datapoint[1] > eventanalysis.maxLoansAbs) {
          eventanalysis.maxLoansAbs = datapoint[1];
        }
      }
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

  private calculateAnalysis(plotData: Map<string, Datapoint[]>) {
    this.eventanalysiss.forEach(
      (value: Eventanalysis, key: number) => {
        const analysis = this.calculateSingleAnalysis(plotData, key);
        this.eventanalysiss.set(key, analysis);
      }
    );
  }

  private fillAnalysisFields(plotData: Map<string, Datapoint[]>, type: string, actualYear: number) {
    const series = plotData[type];
    if (series === undefined) {
      return;
    } else if (series.length === 0) {
      return;
    }
    let oldDatapoint = series[0];
    let amount;
    for (let i = 0; i < series.length; i++) {
      let stat;
      const startDate = new Date(oldDatapoint[0]);
      let year = startDate.getFullYear();
      let finalEndDate;
      if (i === series.length - 1) {
        finalEndDate = new Date();
      } else {
        finalEndDate = new Date(series[i][0]);
      }
      actualYear = finalEndDate.getFullYear();
      while (year < actualYear) {
        const endDate = new Date().setFullYear(year, 12, 31);
        stat = this.statistics.get(year);
        amount = (endDate.valueOf() - startDate.valueOf()) * oldDatapoint[1] / (1000 * 3600 * 24);
        if (type === 'stock') {
          stat.daysStock += amount;
        } else if (type === 'requests') {
          stat.daysRequested += amount;
        } else if (type === 'loans') {
          stat.daysLoaned += amount;
        }
        year++;
        startDate.setFullYear(year, 1, 1);
      }
      stat = this.statistics.get(year);
      if (typeof series[i][1] !== 'undefined') {
        if ((series[i][1] - oldDatapoint[1]) > 0) {
          if (type === 'requests') {
            stat.numberRequests++;
          } else if (type === 'loans') {
            stat.numberLoans++;
          } else if (type === 'cald') {
            stat.numberCald++;
          }
        }
      }
      amount = (finalEndDate.valueOf() - startDate.valueOf()) * oldDatapoint[1] / (1000 * 3600 * 24);
      if (type === 'stock') {
        stat.daysStock += amount;
      } else if (type === 'loans') {
        stat.daysLoaned += amount;
      } else if (type === 'requests') {
        stat.daysRequested += amount;
      }
      oldDatapoint = series[i];
    }
  }
}
