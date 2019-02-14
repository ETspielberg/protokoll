import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProtokollRequest} from './model/ProtokollRequest';
import {Manifestation} from './model/Manifestation';
import {GetterService} from './service/getter.service';
import {Message} from 'primeng/primeng';
import {Item} from './model/Item';
import {Event} from './model/Event';

import {ActivatedRoute, Params, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/switchMap';
import {BibliographicInformation} from './model/BibliographicInformation';
import {MenuItem} from 'primeng/api';
import {TranslateService} from './translate';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  providers: [GetterService]
})

export class AppComponent implements OnInit, OnDestroy {

  constructor(public getterService: GetterService,
              private router: Router,
              private route: ActivatedRoute,
              private translateService: TranslateService) {
  }

  index = 0;

  plotData: Map<string, number[][]>;

  title: string;

  busy: boolean;

  messages: Message[];

  public filterList: Map<string, boolean>;

  private filteredItems: Map<string, Item[]>;

  private filteredEvents: Map<string, Event[]>;

  private filteredManifestations: Map<string, Manifestation>;

  groupData: Map<string, number[][]>;

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

  isElectronic: boolean;

  public show: Map<string, boolean>;

  private subscription: Subscription;

  items: MenuItem[];

  activeItem: MenuItem;

  activePart: string;

  counterFound: boolean;

  ngOnInit(): void {
    this.primaryLoad = true;
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
    this.resetVariables();
    this.resetProtokollrequest();
    this.route.queryParams.subscribe((params: Params) => {
        if (params['shelfmark'] !== undefined) {
          const shelfmark = params['shelfmark'];
          if (shelfmark.indexOf(':') !== -1) {
            this.protokollRequest.shelfmark = shelfmark.split(':')[1];
            this.protokollRequest.collections = shelfmark.split(':')[0];
          } else if (shelfmark.indexOf('=') !== -1) {
            this.protokollRequest.shelfmark = shelfmark.split('=')[1];
            this.protokollRequest.collections = shelfmark.split('=')[0];
          } else {
            this.protokollRequest.shelfmark = params['shelfmark'];
          }
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
          this.collect();
        }
      }
    );
  }

  resetProtokollrequest() {
    this.protokollRequest = new ProtokollRequest('', '', '', false);
  }

  collect() {
    this.getterService.setProtokollrequest(this.protokollRequest);
    switch (this.getterService.typeOfIdentifier) {
      case 'shelfmark': {
        this.isElectronic = false;
        this.getFullManifestations();
        break;
      }
      case 'barcode': {
        this.isElectronic = false;
        this.getFullManifestations();
        break;
      }
      case 'ebook': {
        this.isElectronic = true;
        this.getCounterData();
        break;
      }
      case 'journal': {
        this.isElectronic = true;
        this.getCounterData();
        break;
      }
    }
  }

  resetVariables() {
    this.filteredManifestations = new Map<string, Manifestation>();
    this.filteredItems = new Map<string, Item[]>();
    this.filteredEvents = new Map<string, Event[]>();
    this.selectedManifestations = [];
    this.selectedItems = [];
    this.selectedEvents = [];
    this.messages = [];
    this.isElectronic = false;
    this.activePart = 'graph';
    this.counterFound = false;
    this.manifestationsFound = false;
    this.getterService.manifestations = [];
    this.manifestationsFound = false;
    this.filterList = new Map<string, boolean>();
    this.show = new Map<string, boolean>();
    this.show['editions'] = true;
    this.show['collections'] = true;
    this.show['materials'] = true;
    this.show['usergroups'] = false;
    this.show['subLibrary'] = true;
    this.show['filter'] = true;
  }

  getFullManifestations() {
    this.busy = true;
    this.resetVariables();
    this.getterService.getFullManifestation().subscribe(
      data => {
        this.getterService.manifestations = data;
        if (this.getterService.manifestations.length === 0) {
          this.messages.push({
            severity: 'warn', summary: 'Fehler: ',
            detail: this.translateService.instant('message.nothingFound')
          });
          this.activePart = '';
          this.busy = false;
          this.index = this.getterService.manifestations.length - 1;
        } else {
          this.initializeLists();
          console.log(this.getterService.counters);
        }
        this.primaryLoad = false;
      },
      error => {
        this.busy = false;
        this.primaryLoad = false;
        console.log(error);
        this.messages.push({
          severity: 'error', summary: 'Fehler: ',
          detail: this.translateService.instant('message.error')
        });
        this.activePart = '';

      }
    );

  }

  getCounterData() {
    this.busy = true;
    this.resetVariables();
    this.getterService.getAllCounters().subscribe(
      data => {
        this.getterService.counters = data;
        if (this.getterService.counters.length === 0) {
          this.messages.push({
            severity: 'warn', summary: 'Fehler: ',
            detail: this.translateService.instant('message.nothingFound')
          });
          this.activePart = '';
          this.busy = false;
          this.index = this.getterService.counters.length - 1;
        }
        this.primaryLoad = false;
        this.convertCounterIntoPlotData();
      },
      error => {
        this.busy = false;
        this.primaryLoad = false;
        this.messages.push({
          severity: 'error', summary: 'Fehler: ',
          detail: this.translateService.instant('message.error')
        });
        this.activePart = '';
      }
    );
  }

  initializeLists() {
    this.manifestationsFound = this.getterService.manifestations.length > 0;
    const uniqueCollections = new Set<string>();
    const uniqueMaterials = new Set<string>();
    const uniqueSublibraries = new Set<string>();
    this.getterService.manifestations.forEach(manifestation => {
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
          fitting = f.startsWith(m.trim().toUpperCase());
          if (fitting) {
            break;
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
    for (const m of this.getterService.manifestations) {
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
              numberSublibrary++;
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
              if (!(event.type === 'inventory' || event.type === 'deletion') && event.borrowerStatus === '12') {
                continue;
              }
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
    if (this.selectedManifestations.length === 1) {
      const manifestation: Manifestation = this.filteredManifestations[this.selectedManifestations[0].titleID];
      this.title = manifestation.shelfmark + ' (' + manifestation.edition + '. Auflage)';
    } else {
      let title = '';
      this.selectedManifestations.forEach(manifestation => title = title + manifestation.shelfmark + ', ');
      this.title = title.substr(0, title.length - 2);
    }
    this.plotData = new Map<string, number[][]>();
    this.groupData = new Map<string, number[][]>();
    for (const event of this.selectedEvents) {
      this.addDatapointToMap(event, event.borrowerStatus, this.groupData);
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

  convertCounterIntoPlotData() {
    this.plotData = new Map<string, number[][]>();
    this.groupData = new Map<string, number[][]>();
    for (const countercollection of this.getterService.counters) {
      console.log(countercollection.identifier);
      let list: number[][] = [];
      for (const counter of countercollection.counters) {
        const date = new Date(counter.year, counter.month);
        const values = [date.valueOf(), counter.totalRequests];
        list.push(values);
      }
      list = list.sort((n1, n2) => n1[0] - n2[0]);
      this.plotData.set(countercollection.identifier, list);
      this.busy = false;
      this.counterFound = true;
    }
  }

  addDatapointToMap(event: Event, classOfEvent: string, map: Map<string, number[][]>) {
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

}
