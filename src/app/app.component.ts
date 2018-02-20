import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProtokollRequest} from './model/ProtokollRequest';
import {Manifestation} from './model/Manifestation';
import {GetterService} from './service/getter.service';
import {DataTable, Message} from 'primeng/primeng';
import {Item} from './model/Item';
import {Event} from './model/Event';

import {ActivatedRoute, Params, Router} from '@angular/router';
import {Option} from './model/Option';
import {Dataset} from './model/Dataset';
import {Datapoint} from './model/Datapoint';
import {AnalyzerService} from './service/analyzer.service';
import {Eventanalysis} from './model/Eventanalysis';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  providers: [GetterService]
})

export class AppComponent implements OnInit, OnDestroy  {

  constructor(private getterService: GetterService,
              private outer: Router,
              private route: ActivatedRoute,
              private analyzrService: AnalyzerService) {
  }

  busy: boolean;

  messages: Message[];

  manifestations: Manifestation[];

  private options: Option;

  private filterList: Map<string, boolean>;

  private filteredItems: Map<string, Item[]>;

  private filteredEvents: Map<string, Event[]>;

  private filteredManifestations: Map<string, Manifestation>;

  private plotData: Map<string, Datapoint[]>;

  private uniqueCollections: string[];

  private uniqueMaterials: string[];

  public protokollRequest: ProtokollRequest;

  public selectedManifestations: Manifestation[];

  private selectedEvents: Event[];

  private selectedItems: Item[];

  private showUsergroups: boolean;

  manifestationsFound: boolean;

  primaryLoad: boolean;

  private yearsOfLoans: number;

  private yearsOfRequests: number;

  public eventanalysis: Eventanalysis;

  public show: Map<string, boolean>;

  public isAnalyzed: boolean;

  private subscription: Subscription;

  ngOnInit(): void {

    this.resetVariables();
    this.route.queryParams.subscribe( (params: Params) => {
      if (params['shelfmark'] !== undefined) {this.protokollRequest.shelfmark = params['shelfmark']; }
      if (params['exact'] !== undefined) {this.protokollRequest.exact = ('true' ===  params['exact']); }
      if (params['collections'] !== undefined) {this.protokollRequest.collections = params['collections']; }
      if (params['materials'] !== undefined) {this.protokollRequest.shelfmark = params['materials']; }
      if (this.protokollRequest.shelfmark !== '') {
        this.getFullManifestations();
      }
      }
    );
  }

  resetVariables() {
    this.filteredManifestations = new Map<string, Manifestation>();
    this.filteredItems = new Map<string, Item[]>();
    this.filteredEvents = new Map<string, Event[]>();
    this.selectedManifestations = [];
    this.selectedItems = [];
    this.selectedEvents = [];
    this.protokollRequest = new ProtokollRequest('', '', '', false);
    this.manifestationsFound = false;
    this.filterList = new Map<string, boolean>();
    this.show = new Map<string, boolean>();
    this.show['items'] = true;
    this.show['events'] =  true;
    this.show['editions'] = true;
    this.show['collections'] =  true;
    this.show['materials'] = true;
    this.show['graph'] = true;
    this.show['bibliography'] = true;
    this.yearsOfRequests = 2;
    this.yearsOfLoans = 5;
    this.primaryLoad = true;
  }

  getFullManifestations() {
    this.isAnalyzed = false;
    this.busy = true;
    this.manifestations = [];
    this.getterService.getFullManifestation(this.protokollRequest.shelfmark, this.protokollRequest.exact).subscribe(
      data => {
        this.manifestations = data;
        this.initializeLists();
        this.primaryLoad = false;
      },
      error => {
        this.busy = false;
        this.primaryLoad = false;
        this.messages.push({severity: 'error', summary: 'Fehler: ', detail: 'Es konnten keine Auflagen gefunden werden.  Bitte eine gültige Signatur eingeben.'});
      }
    );
  }

  initializeLists() {
    this.manifestationsFound = this.manifestations.length > 0;
    const uniqueCollections = new Set<string>();
    const uniqueMaterials = new Set<string>();

    for (const manifestation of this.manifestations) {
      this.filterList[manifestation.titleID] = true;
      this.selectedManifestations.push(manifestation);
      for (const collection of manifestation.collections) {
        if (!uniqueCollections.has(collection)) {
          uniqueCollections.add(collection);
          this.filterList[collection] = true;
        }
      }
      for (const material of manifestation.materials) {
        if (!uniqueMaterials.has(material)) {
          uniqueMaterials.add(material);
          this.filterList[material] = true;
        }
      }
    }
    this.includeSelectionFromHttpParamters();
    this.uniqueMaterials = Array.from(uniqueMaterials).sort();
    this.uniqueCollections = Array.from(uniqueCollections).sort();
    this.update();
  }

  includeSelectionFromHttpParamters() {
    if (!(typeof this.protokollRequest.collections === 'undefined' || this.protokollRequest.collections.trim() === '')) {
      console.log(this.protokollRequest.collections);
      let individualCollections: string[] = [];
      if (this.protokollRequest.collections.indexOf(' ') > -1) {
        individualCollections = this.protokollRequest.collections.split(' ');
      } else {
        individualCollections.push(this.protokollRequest.collections);
      }
      console.log(this.uniqueCollections);
      for (const f of this.uniqueCollections) {
        let fitting = false;
        for (const m of individualCollections) {
          if (f.startsWith(m.trim().toUpperCase())) {
            fitting = true;
          }
        }
        this.filterList[f] = fitting;
      }
    }
  }

  update() {
    this.updateFilteredLists();
    this.updatePlotData();
    this.busy = false;
  }

  updateFilteredLists() {
    this.filteredManifestations = new Map<string, Manifestation>();
    this.filteredItems = new Map<string, Item[]>();
    this.filteredEvents = new Map<string, Event[]>();
    this.selectedManifestations = [];
    this.selectedItems = [];
    this.selectedEvents = [];
    for (const m of this.manifestations) {
      if (this.filterList[m.titleID]) {
        this.selectedManifestations.push(m);
        this.filteredManifestations[m.titleID] = m;
        const filteredItemsInd: Item[] = [];
        const filteredEventsInd: Event[] = [];
        for (const item of m.items) {
          if (this.filterList[item.collection] && this.filterList[item.material]) {
            filteredItemsInd.push(item);
            this.selectedItems.push(item);
            for (const event of item.events) {
              filteredEventsInd.push(event);
              this.selectedEvents.push(event);
              if (event.endEvent != null) {
                this.selectedEvents.push(event.endEvent);
              }
            }
          }
        }
        this.filteredItems[m.titleID] = filteredItemsInd;
        this.filteredEvents[m.titleID] = filteredEventsInd;
      }
    }
    this.selectedEvents.sort(function (firstEvent, secondEvent) {
      return firstEvent.time === secondEvent.time ? 0 : +(firstEvent.time > secondEvent.time) || -1;
    });
  }

  updatePlotData() {
    this.options = new Option({text: ''}, [],
      {title: {text: 'Anzahl'}, min: 0, allowDecimals: false},
      {type: 'datetime'},
      {defaultSeriesType: 'line', zoomType: 'xy'},
      ['#AA4643', '#4572A7', '#89A54E', '#80699B',
        '#3D96AE', '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92']);
    this.plotData = new Map<string, Datapoint[]>();
    for (const event of this.selectedEvents) {
      if (this.showUsergroups) {
        this.addDatapoint(event, event.borrowerStatus);
      } else {
        if (event.type === 'loan' || event.type === 'return') {
          this.addDatapoint(event, 'loans');
        } else if (event.type === 'request' || event.type === 'hold') {
          this.addDatapoint(event, 'requests');
        } else if (event.type === 'inventory' || event.type === 'deletion') {
          this.addDatapoint(event, 'stock');
        } else if (event.type === 'cald' || event.type === 'caldDelivery') {
          this.addDatapoint(event, 'CALD');
        }
      }
      if (this.selectedManifestations.length === 1) {
        const manifestation: Manifestation = this.filteredManifestations[this.selectedManifestations[0].titleID];
        this.options.title = {text: manifestation.shelfmark + ' (' + manifestation.edition + '. Auflage)'};
      } else {
        let title = '';
        for (const manifestation in this.selectedManifestations) {
          title = title + this.manifestations[manifestation].shelfmark + ', ';
        }
        this.options.title = {text: title.substr(0, title.length - 2)};
      }
    }
    this.updateChartObject();
  }

  updateChartObject() {
    for (const key in this.plotData) {
      const datapoints = this.plotData[key];
      datapoints.push(new Datapoint(new Date().getTime(), datapoints[datapoints.length - 1][1]));
      const dataset: Dataset = new Dataset(key, datapoints);
      this.options.series.push(dataset);
    }
  }

  addDatapoint(event: Event, classOfEvent: string) {
    if (event.time > 0) {
      let list: number[][];
      if ((typeof this.plotData[classOfEvent] === 'undefined')) {
        list = [];
        list.push([event.time, 1]);
      } else {
        list = this.plotData[classOfEvent];
        const lastDatapoint = list[list.length - 1];
        list.push([event.time, lastDatapoint[1]]);
        list.push([event.time, lastDatapoint[1] + event.delta]);
      }
      this.plotData[classOfEvent] = list;
    }
  }

  toggleShow(part: string) {
    this.show[part] = !this.show[part] ;
  }

  calculateAnalysis() {
    this.eventanalysis = this.analyzrService.calculateAnalsis(this.plotData, this.yearsOfLoans, this.yearsOfRequests);
    this.isAnalyzed = true;
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
