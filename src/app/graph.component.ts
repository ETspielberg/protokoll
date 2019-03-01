import {Component, Input, OnInit} from '@angular/core';
import {Option} from './model/Option';
import {Dataset} from './model/Dataset';
import {TranslateService} from './translate';

import * as Highcharts from 'highcharts';
import {SelectItem} from 'primeng/api';

@Component({
  selector: 'app-graph',
  templateUrl: 'graph.component.html'
})
export class GraphComponent implements OnInit {

  Highcharts = Highcharts;

  chartConstructor = 'chart';

  updateFlag = false; // optional boolean
  oneToOneFlag = true; // optional boolean, defaults to false
  runOutsideAngular = false; // optional boolean, defaults to false

  private graphTitle: string;

  options: Option;

  mode = 'print';

  modes = ['print', 'digital', 'both'];

  modeOptions: SelectItem[] = [];

  private printData = new Map<string, number[][]>();
  private digitalData = new Map<string, number[][]>();

  private usergroupRegExp: RegExp = new RegExp('^[0-9]{2}');

  constructor(private translateService: TranslateService) {
  }

  ngOnInit() {
    this.modes.forEach(entry => this.modeOptions.push(
      {
        label: this.translateService.instant(entry),
        value: entry
      }
    ));
    if (this.printData) {
      this.setOptions();
    }
  }

  @Input()
  get print() {
    this.setOptions();
    return this.printData;
  }

  set print(val) {
    this.printData = val;
    if (this.printData) {
      this.setOptions();
    }

  }

  @Input()
  get digital() {
    this.setOptions();
    return this.digitalData;
  }

  set digital(val) {
    this.digitalData = val;
    if (this.digitalData) {
      this.setOptions();
    }
  }

  @Input()
  get title() {
    return this.graphTitle;
  }

  set title(val) {
    this.graphTitle = val;
  }

  setOptions() {
    this.options = new Option(this.graphTitle, '', this.mode);
    switch (this.mode) {
      case 'print': {
        this.updateChartObjectFromMap(this.printData);
        break;
      }
      case 'digital': {
        console.log('digital data: ' + this.digitalData);
        this.updateChartObjectFromMap(this.digitalData);
        break;
      }
      case 'both': {
        this.updateChartObjectFromMap(this.printData);
        this.updateChartObjectFromMap(this.digitalData);
        break;
      }
    }
  }

  updateChartObjectFromMap(map: Map<string, number[][]>) {
    if (map) {
      map.forEach((value: number[][], key: string) => {
        const datapoints = value;
        datapoints.push([new Date().getTime(), datapoints[datapoints.length - 1][1]]);
        const dataset: Dataset = new Dataset(this.translateService.instant('series.' + key), datapoints);
        if (key === 'loans') {
          dataset.color = '#4572A7';
          dataset.zIndex = 2;
          dataset.yAxis = 0;
          dataset.type = 'area';
        } else if (key === 'stock') {
          dataset.color = '#dfe4f2';
          dataset.zIndex = 1;
          dataset.yAxis = 0;
          dataset.type = 'area';
        } else if (key === 'requests') {
          dataset.color = '#89A54E';
          dataset.zIndex = 3;
          dataset.yAxis = 0;
          dataset.type = 'area';
        } else if (key === 'cald') {
          dataset.color = '#80699B';
          dataset.zIndex = 4;
          dataset.yAxis = 0;
          dataset.type = 'area';
        } else if (key.startsWith('978')) {
          dataset.color = '#AA4643';
          dataset.zIndex = 0;
          dataset.yAxis = 1;
          dataset.type = 'column';
        } else {
          dataset.type = 'area';
          dataset.yAxis = 0;
        }
        this.options.series.push(dataset);
      });
    }
  }

}
