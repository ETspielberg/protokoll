import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProtokollRequest} from './model/ProtokollRequest';
import {Manifestation} from './model/Manifestation';
import {GetterService} from './service/getter.service';
import {Message} from 'primeng/primeng';
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
import {BibliographicInformation} from './model/BibliographicInformation';
import {MenuItem} from 'primeng/api';
import {Statistics} from './model/Statistics';
import {TranslateService} from './translate';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  providers: [GetterService]
})

export class AppComponent implements OnInit, OnDestroy {

  constructor(private getterService: GetterService,
              private outer: Router,
              private route: ActivatedRoute,
              private analyzrService: AnalyzerService,
              private translateService: TranslateService) {
  }

  busy: boolean;

  messages: Message[];

  manifestations: Manifestation[];

  public options: Option;

  public filterList: Map<string, boolean>;

  private filteredItems: Map<string, Item[]>;

  private filteredEvents: Map<string, Event[]>;

  private filteredManifestations: Map<string, Manifestation>;

  private plotData: Map<string, Datapoint[]>;

  private plotUserData: Map<string, Datapoint[]>;

  public uniqueCollections: string[];

  public uniqueMaterials: string[];

  public uniqueSubLibraries: string[];

  public statsCollection: Map<string, number>;

  public statsMaterials: Map<string, number>;

  public statsManifestations: Map<string, number>;

  public statsSublibraries: Map<string, number>;

  public protokollRequest: ProtokollRequest;

  public selectedManifestations: Manifestation[];

  public selectedEvents: Event[];

  public selectedItems: Item[];

  manifestationsFound: boolean;

  primaryLoad: boolean;

  private yearsOfLoans: number;

  private yearsOfRequests: number;

  public eventanalysiss: Eventanalysis[];

  public show: Map<string, boolean>;

  public isAnalyzed: boolean;

  private subscription: Subscription;

  items: MenuItem[];

  activeItem: MenuItem;

  activePart: string;

  statistics: Statistics[];

  staticBuffer: number;

  deletionProposal: number;

  activeAnalysis: Eventanalysis;

  ngOnInit(): void {
    this.translateService.use('de');
    const tabs: string[] = ['graph', 'bibliography', 'information', 'items', 'events', 'analysis'];
    this.items = [];
    tabs.forEach(entry => {
      return this.items.push({
        label: this.translateService.instant('tab.' + entry),
        icon: 'fa-plus',
        id: entry,
        command: event2 => this.activePart = entry
      });
    });
    this.activeItem = this.items[0];
    this.activePart = this.activeItem.id;
    this.staticBuffer = 20;
    this.resetVariables();
    this.route.queryParams.subscribe((params: Params) => {
        if (params['shelfmark'] !== undefined) {
          this.protokollRequest.shelfmark = params['shelfmark'];
        }
        if (params['exact'] !== undefined) {
          this.protokollRequest.exact = ('true' === params['exact']);
        }
        if (params['collections'] !== undefined) {
          this.protokollRequest.collections = params['collections'];
        }
        if (params['materials'] !== undefined) {
          this.protokollRequest.shelfmark = params['materials'];
        }
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
    this.show['editions'] = true;
    this.show['collections'] = true;
    this.show['materials'] = true;
    this.show['usergroups'] = false;
    this.show['subLibrary'] = true;
    this.yearsOfRequests = 2;
    this.yearsOfLoans = 5;
    this.primaryLoad = true;
  }

  getFullManifestations() {
    this.isAnalyzed = false;
    this.busy = true;
    this.manifestations = [];
    this.getterService.getFullManifestation(this.protokollRequest.shelfmark.replace('+', '%2B'), this.protokollRequest.exact).subscribe(
      data => {
        this.manifestations = data;
        this.initializeLists();
        this.primaryLoad = false;
      },
      error => {
        this.busy = false;
        this.primaryLoad = false;
        console.log(error);
        this.messages.push({
          severity: 'error', summary: 'Fehler: ',
          detail: 'Es konnten keine Auflagen gefunden werden.  Bitte eine gültige Signatur eingeben.'
        });
      }
    );
  }

  initializeLists() {
    this.manifestationsFound = this.manifestations.length > 0;
    const uniqueCollections = new Set<string>();
    const uniqueMaterials = new Set<string>();
    const uniqueSublibraries = new Set<string>();
    this.manifestations.forEach(manifestation => {
      this.filterList[manifestation.titleID] = true;
      this.selectedManifestations.push(manifestation);
      manifestation.collections.forEach(collection => {
        if (!uniqueCollections.has(collection)) {
          uniqueCollections.add(collection);
          this.filterList[collection] = (collection !== '???');
        }
      });
      manifestation.materials.forEach(material => {
        if (!uniqueMaterials.has(material)) {
          uniqueMaterials.add(material);
          this.filterList[material] = true;
        }
      });
      manifestation.subLibraries.forEach(subLibrary => {
        if (!uniqueSublibraries.has(subLibrary)) {
          uniqueSublibraries.add(subLibrary);
          this.filterList[subLibrary] = true;
        }
      });
    });
    this.uniqueMaterials = Array.from(uniqueMaterials).sort();
    this.uniqueCollections = Array.from(uniqueCollections).sort();
    this.uniqueSubLibraries = Array.from(uniqueSublibraries).sort();
    this.includeSelectionFromHttpParamters();
    this.update();
  }

  includeSelectionFromHttpParamters() {
    if (!(typeof this.protokollRequest.collections === 'undefined' || this.protokollRequest.collections.trim() === '')) {
      let individualCollections: string[] = [];
      if (this.protokollRequest.collections.indexOf(' ') > -1) {
        individualCollections = this.protokollRequest.collections.split(' ');
      } else {
        individualCollections.push(this.protokollRequest.collections);
      }
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
    this.statsCollection = new Map<string, number>();
    this.statsMaterials = new Map<string, number>();
    this.statsManifestations = new Map<string, number>();
    this.statsSublibraries = new Map<string, number>();
    this.uniqueCollections.forEach(collection => this.statsCollection.set(collection, 0));
    this.uniqueMaterials.forEach(material => this.statsMaterials.set(material, 0));
    this.uniqueSubLibraries.forEach(sublibrary => this.statsSublibraries.set(sublibrary, 0));
    this.filteredManifestations = new Map<string, Manifestation>();
    this.filteredItems = new Map<string, Item[]>();
    this.filteredEvents = new Map<string, Event[]>();
    this.selectedManifestations = [];
    this.selectedItems = [];
    this.selectedEvents = [];
    for (const m of this.manifestations) {
      this.statsManifestations.set(m.titleID, 0);
      if (this.filterList[m.titleID]) {
        this.selectedManifestations.push(m);
        this.filteredManifestations[m.titleID] = m;
        const filteredItemsInd: Item[] = [];
        const filteredEventsInd: Event[] = [];
        for (const item of m.items) {
          if (this.filterList[item.collection] && this.filterList[item.material] && this.filterList[item.subLibrary]) {
            filteredItemsInd.push(item);
            this.selectedItems.push(item);
            if (item.deletionDate === '') {
              let numberSublibrary = this.statsSublibraries.get(item.subLibrary);
              numberSublibrary++
              this.statsSublibraries.set(item.subLibrary, numberSublibrary);
              let numberCollections = this.statsCollection.get(item.collection);
              numberCollections++;
              this.statsCollection.set(item.collection, numberCollections);
              let numberMaterials = this.statsMaterials.get(item.material);
              numberMaterials++;
              this.statsMaterials.set(item.material, numberMaterials);
              let numberManifestations = this.statsManifestations.get(m.titleID);
              numberManifestations++;
              this.statsManifestations.set(m.titleID, numberManifestations);
            }
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
    if (this.show['usergroups']) {
      this.plotUserData = new Map<string, Datapoint[]>();
      for (const event of this.selectedEvents) {
        this.addDatapointToMap(event, event.borrowerStatus, this.plotUserData);
      }
    } else {
      this.plotData = new Map<string, Datapoint[]>();
      for (const event of this.selectedEvents) {
        if (event.type === 'loan' || event.type === 'return') {
          this.addDatapointToMap(event, 'loans', this.plotData);
        } else if (event.type === 'request' || event.type === 'hold') {
          this.addDatapointToMap(event, 'requests', this.plotData);
        } else if (event.type === 'inventory' || event.type === 'deletion') {
          this.addDatapointToMap(event, 'stock', this.plotData);
        } else if (event.type === 'cald' || event.type === 'caldDelivery') {
          this.addDatapointToMap(event, 'cald', this.plotData);
        }
      }
    }
    if (this.selectedManifestations.length === 1) {
      const manifestation: Manifestation = this.filteredManifestations[this.selectedManifestations[0].titleID];
      this.options.title = {text: manifestation.shelfmark + ' (' + manifestation.edition + '. Auflage)'};
    } else {
      let title = '';
      this.selectedManifestations.forEach(manifestation => title = title + manifestation.shelfmark + ', ');
      this.options.title = {text: title.substr(0, title.length - 2)};
    }
    if (this.show['usergroups']) {
      this.updateChartObjectFromMap(this.plotUserData);
    } else {
      this.updateChartObjectFromMap(this.plotData);
    }
    this.analyzrService.reset(this.plotData);
    this.eventanalysiss = this.analyzrService.getAnalysis();
    this.statistics = this.analyzrService.getStatistics();
    this.activeAnalysis = this.eventanalysiss[this.eventanalysiss.length / 2];
    this.calculateDeletionProposal();
  }

  updateChartObjectFromMap(plotData: Map<string, Datapoint[]>) {
    for (const key in this.plotData) {
      const datapoints = plotData[key];
      datapoints.push(new Datapoint(new Date().getTime(), datapoints[datapoints.length - 1][1]));
      const dataset: Dataset = new Dataset(this.translateService.instant('series.' + key), datapoints);
      this.options.series.push(dataset);
    }
  }

  addDatapointToMap(event: Event, classOfEvent: string, map: Map<string, Datapoint[]>) {
    if (event.time > 0) {
      let list: number[][];
      if ((typeof map[classOfEvent] === 'undefined')) {
        list = [];
        list.push([event.time, 1]);
      } else {
        list = map[classOfEvent];
        const lastDatapoint = list[list.length - 1];
        list.push([event.time, lastDatapoint[1]]);
        list.push([event.time, lastDatapoint[1] + event.delta]);
      }
      map[classOfEvent] = list;
    }
  }

  toggleShow(part: string) {
    this.show[part] = !this.show[part];
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  goToPrimo(bibliographicInformation: BibliographicInformation): void {
    const url = 'https://primo.ub.uni-due.de/UDE:UDEALEPH{' + bibliographicInformation.otherIdentifier + '}';
    window.open(url, '_blank');
  }

  calculateDeletionProposal() {
    const proposal = (this.activeAnalysis.lastStock - this.activeAnalysis.maxLoansAbs) * (1 - this.staticBuffer / 100);
    this.deletionProposal = (proposal < 0) ? 0 : proposal;
  }

}
