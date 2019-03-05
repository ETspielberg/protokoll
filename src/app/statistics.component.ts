import {Component, Input} from '@angular/core';
import {Datapoint} from './model/Datapoint';
import {Statistics} from './model/Statistics';

@Component({
  selector: 'app-statistics',
  templateUrl: 'statistics.component.html'
})

export class StatisticsComponent {

  private plotData: Map<string, Datapoint[]>;

  private statistics: Map<number, Statistics>;

  public statisticsList: Statistics[];

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
    this.statistics = new Map<number, Statistics>();
    this.statisticsList = [];
    const stocks = this.plotData.get('stock');
    if (typeof stocks !== 'undefined') {
      const requests = this.plotData.get('requests');
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
        year++;
      }
      this.calculateStatistics();
    }
  }

  public calculateStatistics(): void {
    const actualYear = new Date().getFullYear();
    this.fillAnalysisFields(this.plotData, 'loans', actualYear);
    this.fillAnalysisFields(this.plotData, 'cald', actualYear);
    this.fillAnalysisFields(this.plotData, 'stock', actualYear);
    this.fillAnalysisFields(this.plotData, 'requests', actualYear);
    this.statistics.forEach(
      entry => this.statisticsList.push(entry)
    );
  }

  private fillAnalysisFields(plotData: Map<string, Datapoint[]>, type: string, actualYear: number) {
    const series = plotData.get(type);
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
