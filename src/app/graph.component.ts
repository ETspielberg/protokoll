import {Component, Input} from '@angular/core';
import {Option} from './model/Option';
import {Dataset} from './model/Dataset';
import {TranslateService} from './translate';

@Component({
  selector: 'app-graph',
  templateUrl: 'graph.component.html'
})

export class GraphComponent {

  graphTitle: string;

  isElectronicMedium: boolean;

  private plotData: Map<string, number[][]>;

  private groupedData: Map<string, number[][]>;

  options: Option;

  showGroups: boolean;

  constructor(private translateService: TranslateService) {
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
    if (this.isElectronicMedium) {
      this.options = new Option({text: 'Anzahl Zugriffe'}, [],
        {title: {text: 'Anzahl'}, min: 0, allowDecimals: false},
        {
          type: 'datetime',
          dateTimeLabelFormats: {month: '%B %Y'}
        },
        {defaultSeriesType: 'column', zoomType: 'xy'},
        ['#AA4643', '#4572A7', '#89A54E', '#80699B',
          '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92']);
      this.options.lang = {
        months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
          'Juli', 'August', 'September', 'Oktober', 'November',
          'Dezember'],
        shortMonths: ['Jan', 'Feb', 'März', 'Apr', 'Mai', 'Jun',
          'Jul', 'Aug', 'Sep', 'Okt', 'Nov',
          'Dez']
      };
      this.options.plotOptions = {
        column: {
          stacking: 'normal'
        }
      };
    } else {
      this.options = new Option({text: ''}, [],
        {title: {text: 'Anzahl'}, min: 0, allowDecimals: false},
        {type: 'datetime'},
        {defaultSeriesType: 'area', zoomType: 'xy'},
        ['#AA4643', '#4572A7', '#89A54E', '#80699B',
          '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92']);
    }
    this.options.exporting = {enabled: true};
    this.options.title = {text: this.graphTitle};
    if (this.showGroups) {
      this.updateChartObjectFromMap(this.groupedData);
    } else {
      this.updateChartObjectFromMap(this.plotData);
    }
  }

  updateChartObjectFromMap(map: Map<string, number[][]>) {
    console.log(map);
    for (const key in map) {
      const datapoints = map[key];
      datapoints.push([new Date().getTime(), datapoints[datapoints.length - 1][1]]);
      const dataset: Dataset = new Dataset(this.translateService.instant('series.' + key), datapoints);
      if (key === 'loans') {
        dataset.color = '#4572A7';
        dataset.zIndex = 1;
      } else if (key === 'stock') {
        dataset.color = '#7e91a7';
        dataset.zIndex = 0;
      } else if (key === 'requests') {
        dataset.color = '#89A54E';
        dataset.zIndex = 2;
      } else if (key === 'cald') {
        dataset.color = '#80699B';
        dataset.zIndex = 3;
      }
      this.options.series.push(dataset);
    }
  }

}
