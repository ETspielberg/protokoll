import {Dataset} from './Dataset';

export class Option {

  public title: object;
  public series: Dataset[];
  public mode: string;
  public yAxis?: object;
  public xAxis?: object;
  public chart?: object;
  public colors?: string[];
  public subtitle?: object;
  public plotOptions?: object;
  public lang?: object;
  public tooltip?: object;
  public exporting?: object;

  private monthlyAxis: object = {
    type: 'datetime',
    dateTimeLabelFormats: {month: '%B %Y'}
  };
  private dailyAxis: object = {
    type: 'datetime',
    dateTimeLabelFormats: {month: '%B %Y'}
  };


  constructor(title: string, subtitle: string, mode: string) {
    this.series = [];
    this.chart = {
      zoomType: 'xy'
    };
    this.xAxis = {
      type: 'datetime',
      dateTimeLabelFormats: {month: '%B %Y'}
    };
    this.title = {
      text: title
    };
    this.subtitle = {
      text: subtitle
    };

        this.yAxis = [
          {
            title:
              {
                text: 'Anzahl'
              },
            min: 0,
            allowDecimals: false,
            opposite: false
          }, {
            title:
              {
                text: 'Zugriffe'
              },
            min: 0,
            allowDecimals: false,
            opposite: true
          }
        ];
    this.colors = [
      '#AA4643',
      '#4572A7',
      '#89A54E',
      '#80699B',
      '#3D96AE',
      '#DB843D',
      '#92A8CD',
      '#A47D7C',
      '#B5CA92'];
    this.lang = {
      months: [
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember'],
      shortMonths: [
        'Jan',
        'Feb',
        'März',
        'Apr',
        'Mai',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Okt',
        'Nov',
        'Dez']
    };
    this.tooltip = {
      dateTimeLabelFormats: {
        month: '%B %Y'
      }
    };
    this.exporting = {enabled: true};
    this.title = {text: title};
  }
}
