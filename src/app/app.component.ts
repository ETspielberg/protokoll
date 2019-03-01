import {Component, OnDestroy, OnInit} from '@angular/core';
import {ProtokollRequest} from './model/ProtokollRequest';
import {PrintManifestation} from './model/PrintManifestation';
import {GetterService} from './service/getter.service';
import {Message} from 'primeng/primeng';
import {Item} from './model/Item';
import {Event} from './model/Event';

import {ActivatedRoute, Params, Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import 'rxjs/add/operator/switchMap';
import {BibliographicInformation} from './model/BibliographicInformation';
import {MenuItem, MessageService, SelectItem} from 'primeng/api';
import {TranslateService} from './translate';
import {ClipboardService} from 'ngx-clipboard';
import {DigitalManifestation} from './model/DigitalManifestation';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  providers: [GetterService]
})

export class AppComponent implements OnInit, OnDestroy {

  constructor(public getterService: GetterService,
              private router: Router,
              private route: ActivatedRoute,
              private translateService: TranslateService,
              private clipboardService: ClipboardService,
              private messageService: MessageService) {
  }

  index = 0;

  public printManifestations: Map<string, PrintManifestation>;

  public digitalManifestations: Map<string, DigitalManifestation>;

  printData: Map<string, number[][]>;

  digitalData: Map<string, number[][]>;

  title: string;

  isPrint = false;

  isDigital = false;

  busy: boolean;

  messages: Message[];

  protokollRequest: ProtokollRequest;

  public filterList: Map<string, boolean>;

  private filteredItems: Map<string, Item[]>;

  private filteredEvents: Map<string, Event[]>;

  private filteredManifestations: Map<string, PrintManifestation>;

  private filteredDigitalManifestations: Map<string, DigitalManifestation>;

  private queriedIdentifiers: Set<string>;

  public uniqueCollections: string[];

  public uniqueMaterials: string[];

  public statsCollection: Map<string, number>;

  public statsMaterials: Map<string, number>;

  public statsManifestations: Map<string, number>;

  public selectedManifestations: PrintManifestation[];

  public selectedEvents: Event[];

  public selectedItems: Item[];

  primaryLoad = true;

  isElectronic: boolean;

  public show: Map<string, boolean>;

  private subscription: Subscription;

  items: MenuItem[] = [];

  activeItem: MenuItem;

  activePart: string;

  counterFound: boolean;

  status = 'ready';

  chartDetail = 'overview';

  chartDetails = ['overview', 'groups'];


  chartDetailsOptions: SelectItem[] = [];

  private tabs: string[] = ['graph', 'usage', 'bibliography', 'information', 'items', 'events', 'analysis'];

  ngOnInit(): void {
    this.translateService.use('de');
    this.chartDetails.forEach(entry => this.chartDetailsOptions.push(
      {
        label: this.translateService.instant(entry),
        value: entry
      }
    ));
    this.tabs.forEach(entry => {
      return this.items.push({
        label: this.translateService.instant('tab.' + entry),
        icon: 'fa-plus',
        id: entry,
        command: event => this.activePart = entry
      });
    });
    this.activeItem = this.items[0];
    this.activePart = this.activeItem.id;
    this.resetVariables();
    this.protokollRequest = new ProtokollRequest();
    this.route.queryParams.subscribe((params: Params) => {
        if (params['shelfmark'] !== undefined) {
          this.protokollRequest.shelfmark = params['shelfmark'];
          this.protokollRequest.update();
          if (params['exact'] !== undefined) {
            this.protokollRequest.exact = ('true' === params['exact']);
          }
          if (params['collections'] !== undefined) {
            this.protokollRequest.collections = params['collections'];
          }
          if (params['materials'] !== undefined) {
            this.protokollRequest.shelfmark = params['materials'];
          }
          this.collect();
        }
      }
    );
  }

  collect() {
    this.busy = true;
    this.queriedIdentifiers = new Set<string>();
    this.printManifestations = new Map<string, PrintManifestation>();
    this.digitalManifestations = new Map<string, DigitalManifestation>();
    this.status = 'collecting';
    this.protokollRequest.update();
    this.isElectronic = (this.protokollRequest.getType() === 'ebook');
    if (this.isElectronic) {
      this.getDigitalManifestation();
    } else {
      this.getAllPrintManifestations();
    }
  }

  resetVariables() {
    this.filteredManifestations = new Map<string, PrintManifestation>();
    this.filteredItems = new Map<string, Item[]>();
    this.filteredEvents = new Map<string, Event[]>();
    this.selectedManifestations = [];
    this.selectedItems = [];
    this.selectedEvents = [];
    this.messages = [];
    this.isElectronic = false;
    this.activePart = 'graph';
    this.counterFound = false;
    this.isPrint = false;
    this.filterList = new Map<string, boolean>();
    this.show = new Map<string, boolean>();
    this.show['editions'] = true;
    this.show['collections'] = true;
    this.show['materials'] = true;
    this.show['usergroups'] = false;
    this.show['filter'] = true;
  }

  getAllPrintManifestations() {
    this.busy = true;
    this.resetVariables();
    this.getterService.getAllPrintManifestations(this.protokollRequest).subscribe(
      data => {
        if (data.length === 0) {
          this.sendError('nothingFound');
        } else {
          data.forEach(entry => this.printManifestations.set(entry.titleID, entry));
          this.index = data.length - 1;
          this.initializePrintFilterLists();
          this.extendPrintManifestations();
          this.isPrint = true;
        }
        this.primaryLoad = false;
      },
      error => {
        this.sendError('error');
        this.primaryLoad = false;
        console.log(error);
      }
    );
  }

  getDigitalManifestation() {
    this.busy = true;
    this.resetVariables();
    this.getterService.getAllDigitalManifestations(this.protokollRequest).subscribe(
      data => {
        if (data.length === 0) {
          this.sendError('nothingFound');
        } else {
          this.isDigital = true;
          data.forEach(entry => this.digitalManifestations.set(entry.identifier, entry));
          this.index = data.length - 1;
          this.convertCounterIntoPlotData();
          this.extendDigitalManifestations();
        }
        this.primaryLoad = false;
        this.convertCounterIntoPlotData();
        this.extendDigitalManifestations();
      },
      error => {
        this.sendError('error');
        this.primaryLoad = false;
        console.log(error);
      }
    );
  }

  extendPrintManifestations() {
    this.printManifestations.forEach(
      (value, key) => {
        let isbn = value.bibliographicInformation.isbn.replace(/-/gi, '');
        if (isbn.trim() !== '') {
          if (isbn.length > 13) {
            if (isbn.startsWith('978')) {
              isbn = isbn.substring(0, 13);
            } else {
              isbn = isbn.substring(0, 10);
            }
          }
          if (!this.queriedIdentifiers.has(isbn)) {
            this.queriedIdentifiers.add(isbn);
            this.getterService.getPrimoResponse(isbn).subscribe(
              data => data.electronic.forEach(
                record => {
                  if (!this.queriedIdentifiers.has(record.isbn)) {
                    this.getterService.getDigitalManifestation(record.isbn).subscribe(
                      dm => this.digitalManifestations.set(dm.identifier, dm)
                    );
                  }
                }
              )
            );
          }
        }
      });
  }

  extendDigitalManifestations() {
    const recordIds = [];
    this.digitalManifestations.forEach(
      (value, key) => {
        if (key.trim() !== '') {
          recordIds.push(this.getterService.getPrimoResponse(key).subscribe(
            data => data.print.forEach(
              record => this.getterService.getPrintManifestation(record.recordId).subscribe(
                pm => this.printManifestations.set(record.recordId, pm)
              )
            )));
        }
      }
    );
  }

  sendError(error: string) {
    this.messages.push({
      severity: 'warn', summary: 'Fehler: ',
      detail: this.translateService.instant('message.' + error)
    });
    this.activePart = '';
    this.status = 'error';
    this.busy = false;
  }

  initializeDigitalFilterLists() {
    this.digitalManifestations.forEach((value, key) => {
      console.log(key);
    });
  }

  initializePrintFilterLists() {
    const uniqueCollections = new Set<string>();
    const uniqueMaterials = new Set<string>();
    this.digitalManifestations.forEach((value, key) => {
      this.filterList[key] = true;
    });
    this.printManifestations.forEach((value, key) => {
      this.filterList[key] = true;
      this.selectedManifestations.push(value);
      value.collections.forEach(collection => {
        if (!uniqueCollections.has(collection)) {
          uniqueCollections.add(collection);
          this.filterList[collection] = (collection !== '???');
        }
      });
      value.materials.forEach(material => {
        if (!uniqueMaterials.has(material)) {
          uniqueMaterials.add(material);
          this.filterList[material] = true;
        }
      });
    });
    this.uniqueMaterials = Array.from(uniqueMaterials).sort();
    this.uniqueCollections = Array.from(uniqueCollections).sort();
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
    this.uniqueCollections.forEach(collection => this.statsCollection.set(collection, 0));
    this.uniqueMaterials.forEach(material => this.statsMaterials.set(material, 0));
    this.filteredManifestations = new Map<string, PrintManifestation>();
    this.filteredItems = new Map<string, Item[]>();
    this.filteredEvents = new Map<string, Event[]>();
    this.selectedManifestations = [];
    this.selectedItems = [];
    this.selectedEvents = [];
    this.printManifestations.forEach(
      (value, key) => {
        this.statsManifestations.set(key, 0);
        if (this.filterList[key]) {
          this.selectedManifestations.push(value);
          this.filteredManifestations[key] = value;
          const filteredItemsInd: Item[] = [];
          const filteredEventsInd: Event[] = [];
          for (const item of value.items) {
            if (this.filterList[item.collection] && this.filterList[item.material]) {
              filteredItemsInd.push(item);
              this.selectedItems.push(item);
              if (item.deletionDate === '') {
                let numberCollections = this.statsCollection.get(item.collection);
                numberCollections++;
                this.statsCollection.set(item.collection, numberCollections);
                let numberMaterials = this.statsMaterials.get(item.material);
                numberMaterials++;
                this.statsMaterials.set(item.material, numberMaterials);
                let numberManifestations = this.statsManifestations.get(key);
                numberManifestations++;
                this.statsManifestations.set(key, numberManifestations);
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
          this.filteredItems[key] = filteredItemsInd;
          this.filteredEvents[key] = filteredEventsInd;
        }
      });
    this.selectedEvents.sort(function (firstEvent, secondEvent) {
      return firstEvent.time === secondEvent.time ? 0 : +(firstEvent.time > secondEvent.time) || -1;
    });
  }

  updatePlotData() {
    this.printData = new Map<string, number[][]>();
    if (this.selectedManifestations.length === 1) {
      const manifestation: PrintManifestation = this.filteredManifestations.get(this.selectedManifestations[0].titleID);
      this.title = manifestation.shelfmark + ' (' + manifestation.edition + '. Auflage)';
    } else {
      let title = '';
      this.selectedManifestations.forEach(manifestation => title = title + manifestation.shelfmark + ', ');
      this.title = title.substr(0, title.length - 2);
    }
    switch (this.chartDetail) {
      case 'overview': {
        console.log('preparing data for overview');
        for (const event of this.selectedEvents) {
          if (event.type === 'loan' || event.type === 'return') {
            this.addDatapointToMap(event, 'loans', this.printData);
          } else if (event.type === 'request' || event.type === 'hold') {
            this.addDatapointToMap(event, 'requests', this.printData);
          } else if (event.type === 'inventory' || event.type === 'deletion') {
            this.addDatapointToMap(event, 'stock', this.printData);
          } else if (event.type === 'cald' || event.type === 'caldDelivery') {
            this.addDatapointToMap(event, 'cald', this.printData);
          }
        }
        break;
      }
      case 'groups': {
        console.log('preparing data for grouped view');
        for (const event of this.selectedEvents) {
          if (event.type === 'request' || event.type === 'hold' || event.type === 'cald' || event.type === 'caldDelivery') {
            continue;
          } else if (event.type === 'inventory' || event.type === 'deletion') {
            this.addDatapointToMap(event, 'stock', this.printData);
          } else {
            this.addDatapointToMap(event, event.borrowerStatus, this.printData);
          }
        }
        break;
      }
    }
  }

  convertCounterIntoPlotData() {
    this.digitalData = new Map<string, number[][]>();
    this.digitalManifestations.forEach((value, key) => {
      if (this.filteredDigitalManifestations.get(key)) {
        this.title = value.title;
        let list: number[][] = [];
        for (const counter of value.usage) {
          const date = new Date(counter.year, counter.month, 15);
          const values: number[] = [date.getTime(), counter.totalRequests];
          list.push(values);
        }
        list = list.sort((n1, n2) => n1[0] - n2[0]);
        this.digitalData.set(key, list);
        this.busy = false;
        this.counterFound = true;
      }
    });
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

  copyLink() {
    const url = location.href.split('?')[0] + '?' + this.protokollRequest.asUrlParamters();
    this.clipboardService.copyFromContent(url);
    this.messageService.add({
      severity: 'success',
      summary: 'Link kopiert',
      detail: 'Der Link wurde in die Ziwschenablage eingefügt'
    });
  }

  addDatapointToMap(event: Event, classOfEvent: string, map: Map<string, number[][]>) {
    if (event.time > 0) {
      let list: number[][];
      if ((typeof map.get(classOfEvent) === 'undefined')) {
        list = [];
        list.push([event.time, 1]);
      } else {
        list = map.get(classOfEvent);
        const lastDatapoint = list[list.length - 1];
        list.push([event.time, lastDatapoint[1]]);
        list.push([event.time, lastDatapoint[1] + event.delta]);
      }
      map.set(classOfEvent, list);
    }
  }
}
