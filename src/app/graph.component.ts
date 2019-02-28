import {Component, Input, OnInit} from '@angular/core';
import {Option} from './model/Option';
import {Dataset} from './model/Dataset';
import {TranslateService} from './translate';

import * as Highcharts from 'highcharts';

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

  graphTitle: string;

  isElectronicMedium: boolean;

  private plotData: Map<string, number[][]>;

  private groupedData: Map<string, number[][]>;

  options: Option;

  private usergroupRegExp: RegExp = new RegExp('^[0-9]{2}');

  showGroups: boolean;

  constructor(private translateService: TranslateService) {
  }

  ngOnInit() {
    if (this.plotData) {
      this.setOptions();
    }
  }

  @Input()
  get data() {
    return this.plotData;
  }

  set data(val) {
    this.plotData = val;
    this.setOptions();
  }

  @Input()
  get title() {
    return this.graphTitle;
  }

  set title(val) {
    this.graphTitle = val;
  }

  @Input()
  get isElectronic() {
    return this.isElectronicMedium;
  }

  set isElectronic(val) {
    this.isElectronicMedium = val;
  }

  @Input()
  get groups() {
    return this.groupedData;
  }

  set groups(val) {
    this.groupedData = val;
    this.setOptions();
  }

  setOptions() {
    this.options = new Option(this.graphTitle, '');
    if (this.showGroups) {
      this.updateChartObjectFromMap(this.groupedData);
    } else {
      this.updateChartObjectFromMap(this.plotData);
    }
  }

  updateChartObjectFromMap(map: Map<string, number[][]>) {
    for (const key in map) {
      const datapoints = map[key];
      datapoints.push([new Date().getTime(), datapoints[datapoints.length - 1][1]]);
      let dataset: Dataset = new Dataset(this.translateService.instant('series.' + key), datapoints);
      if (this.isElectronicMedium) {
        dataset = new Dataset(this.translateService.instant(key), datapoints);
      }
      if (key === 'loans') {
        dataset.color = '#4572A7';
        dataset.zIndex = 2;
        dataset.yAxis = 0;
        dataset.type = 'area';
      } else if (key === 'stock') {
        dataset.color = '#7e91a7';
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
      } else {
        dataset.color = '#AA4643';
        dataset.zIndex = 0;
        dataset.yAxis = 1;
        dataset.type = 'column';
      }

      this.options.series.push(dataset);
    }
  }

}
