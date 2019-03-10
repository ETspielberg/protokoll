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
import {MenuItem, MessageService, SelectItem} from 'primeng/api';
import {TranslateService} from './translate';
import {ClipboardService} from 'ngx-clipboard';
import {DigitalManifestation} from './model/DigitalManifestation';
import {EbookCounter} from './model/EbookCounter';
import {PrimoData} from './model/PrimoData';


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

  public primoData: Map<string, PrimoData>;

  printData: Map<string, number[][]>;

  digitalData: Map<string, number[][]>;

  title: string;

  isPrint = false;

  isDigital = false;

  busy: boolean;

  messages: Message[];

  protokollRequest: ProtokollRequest;

  public filterList: object;

  private filteredItems: Map<string, Item[]>;

  private filteredEvents: Map<string, Event[]>;

  private filteredManifestations: Map<string, PrintManifestation>;

  private selectedDigitalUsage: Map<string, EbookCounter>;

  private queriedIdentifiers: Set<string>;

  public uniqueCollections: string[];

  public uniqueMaterials: string[];

  public statsCollection: Map<string, number>;

  public statsMaterials: Map<string, number>;

  public statsManifestations: Map<string, number>;

  public selectedPrintManifestations: PrintManifestation[];

  public selectedDigitalManifestations: DigitalManifestation[];

  public selectedEvents: Event[];

  public selectedItems: Item[];

  primaryLoad = true;

  isElectronic: boolean;

  public show: object;

  private subscription: Subscription;

  items: MenuItem[] = [];

  activeItem: MenuItem;

  activePart: string;

  counterFound: boolean;

  status = 'ready';

  chartDetail = 'overview';

  chartDetails = ['overview', 'groups'];

  chartDetailsOptions: SelectItem[] = [];

  private tabs: string[] = ['graph', 'bibliography', 'information', 'usage', 'items', 'events', 'analysis'];

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
    this.status = 'collecting';
    this.reset();
    this.protokollRequest.update();
    this.isElectronic = (this.protokollRequest.getType() === 'ebook');
    if (this.isElectronic) {
      this.getDigitalManifestation();
    } else {
      this.getAllPrintManifestations();
    }
    this.filterTabs();
  }

  collectPrimoResponses() {
    this.queriedIdentifiers.forEach(
      identifier => {
        if (!this.primoData.has(identifier)) {
          this.getterService.getPrimoResponse(identifier).subscribe(
            data => {
              data.electronic.forEach(
                entry => {
                  if (!this.primoData.has(entry.isbn)) {
                    this.primoData.set(entry.isbn, entry);
                  }
                }
              );
              data.print.forEach(
                entry => {
                  if (!this.primoData.has(entry.recordId)) {
                    this.primoData.set(entry.recordId, entry);
                  }
                }
              );
              this.extendManifestations();
            }
          );
        }
      });
  }

  filterTabs() {
    if (!this.printData) {
      this.items.filter((entry) => entry.id !== ('information' || 'items' || 'events' || 'analysis'));
    } else if (!this.digitalData) {
      this.items.filter((entry) => entry.id !== ('usage'));
    }
  }

  reset() {
    this.queriedIdentifiers = new Set<string>();
    this.primoData = new Map<string, PrimoData>();
    this.printManifestations = new Map<string, PrintManifestation>();
    this.digitalManifestations = new Map<string, DigitalManifestation>();
    this.filteredManifestations = new Map<string, PrintManifestation>();
    this.filteredItems = new Map<string, Item[]>();
    this.filteredEvents = new Map<string, Event[]>();
    this.selectedDigitalUsage = new Map<string, EbookCounter>();
    this.selectedPrintManifestations = [];
    this.selectedDigitalManifestations = [];
    this.selectedItems = [];
    this.selectedEvents = [];
    this.messages = [];
    this.isElectronic = false;
    this.activePart = 'graph';
    this.counterFound = false;
    this.isPrint = false;
    this.filterList = {};
    this.show = {};
    this.show['editions'] = true;
    this.show['collections'] = true;
    this.show['materials'] = true;
    this.show['usergroups'] = false;
    this.show['filter'] = true;
    this.show['digital'] = true;
  }

  getAllPrintManifestations() {
    this.getterService.getAllPrintManifestations(this.protokollRequest).subscribe(
      data => {
        if (data.length === 0) {
          this.sendMessage('error', 'nothingFound');
        } else {
          data.forEach(entry => {
            this.printManifestations.set(entry.titleID, entry);
            this.filterList[entry.titleID] = true;
            this.queriedIdentifiers.add(entry.titleID);
            let isbn = entry.bibliographicInformation.isbn.replace(/-/gi, '');
            if (isbn.trim() !== '') {
              if (isbn.length > 13) {
                if (isbn.startsWith('978')) {
                  isbn = isbn.substring(0, 13);
                } else {
                  isbn = isbn.substring(0, 10);
                }
              }
              this.queriedIdentifiers.add(isbn);
            }
          });
          this.index = data.length - 1;
          this.initializePrintFilterLists();
          this.collectPrimoResponses();

          this.isPrint = true;
        }
        this.primaryLoad = false;
      },
      error => {
        this.sendMessage('error', 'error');
        this.primaryLoad = false;
        console.log(error);
      }
    );
  }

  getDigitalManifestation() {
    this.getterService.getAllDigitalManifestations(this.protokollRequest).subscribe(
      data => {
        if (data.length === 0) {
          this.sendMessage('error', 'nothingFound');
        } else {
          this.isDigital = true;
          data.forEach(record => {
            this.digitalManifestations.set(record.identifier, record);
            this.queriedIdentifiers.add(record.identifier);
            this.filterList[record.identifier] = true;
          });
          this.index = data.length - 1;
          this.collectPrimoResponses();
          this.convertCounterIntoPlotData();
        }
        this.primaryLoad = false;
      },
      error => {
        this.sendMessage('error', 'error');
        this.primaryLoad = false;
        console.log(error);
      }
    );
  }

  extendManifestations() {
    let newPrintData = false;
    let newDigitalData = false;
    this.primoData.forEach((value, key) => {
        if ('digital' === value.type) {
          if (!this.digitalManifestations.has(value.isbn)) {
            this.getterService.getDigitalManifestation(value.isbn).subscribe(
              dm => {
                if (dm.usage.length > 0) {
                  this.filterList[dm.identifier] = true;
                  this.digitalManifestations.set(dm.identifier, dm);
                  newDigitalData = true;
                } else {
                  this.sendMessage('warning', 'noUsage');
                }
              }, error => this.sendMessage('alert', 'noConnection'),
              () => this.convertCounterIntoPlotData()
            );
          }
        } else if ('print' === value.type) {
          if (!this.printManifestations.has(value.recordId)) {
            this.getterService.getPrintManifestation(value.recordId).subscribe(
              pm => {
                newPrintData = true;
                this.printManifestations.set(value.recordId, pm);
              },
                  error => this.sendMessage('warning', 'noUsage'),
              () => this.initializePrintFilterLists()
            );
          }
        }
      }
    );
  }

  initializePrintFilterLists() {
    const uniqueCollections = new Set<string>();
    const uniqueMaterials = new Set<string>();
    this.selectedDigitalUsage = new Map<string, EbookCounter>();
    this.digitalManifestations.forEach((value) => {
      this.selectedDigitalManifestations.push(value);
    });
    this.printManifestations.forEach((value) => {
      this.selectedPrintManifestations.push(value);
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
    this.convertCounterIntoPlotData();
    this.busy = false;
  }

  updateFilteredLists() {
    this.statsCollection = new Map<string, number>();
    this.statsMaterials = new Map<string, number>();
    this.statsManifestations = new Map<string, number>();
    this.selectedDigitalUsage = new Map<string, EbookCounter>();
    this.selectedDigitalManifestations = [];
    if (this.printManifestations.size > 0) {
      this.uniqueCollections.forEach(collection => this.statsCollection.set(collection, 0));
      this.uniqueMaterials.forEach(material => this.statsMaterials.set(material, 0));
      this.filteredManifestations = new Map<string, PrintManifestation>();
      this.filteredItems = new Map<string, Item[]>();
      this.filteredEvents = new Map<string, Event[]>();
      this.selectedPrintManifestations = [];
      this.selectedItems = [];
      this.selectedEvents = [];
      this.printManifestations.forEach(
        (value, key) => {
          this.statsManifestations.set(key, 0);
          if (this.filterList[key]) {
            this.selectedPrintManifestations.push(value);
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
  }

  updatePlotData() {
    this.printData = new Map<string, number[][]>();
    if (this.selectedPrintManifestations.length === 1) {
      const manifestation: PrintManifestation = this.filteredManifestations[this.selectedPrintManifestations[0].titleID];
      this.title = manifestation.shelfmark + ' (' + manifestation.edition + '. Auflage)';
    } else {
      let title = '';
      this.selectedPrintManifestations.forEach(manifestation => title = title + manifestation.shelfmark + ', ');
      this.title = title.substr(0, title.length - 2);
    }
    switch (this.chartDetail) {
      case 'overview': {
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
        for (const event of this.selectedEvents) {
          if (event.type === 'request' || event.type === 'hold' || event.type === 'cald' || event.type === 'caldDelivery') {
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
      if (this.filterList[key]) {
        this.title = value.title;
        let list: number[][] = [];
        for (const counter of value.usage) {
          const date = new Date(counter.year, counter.month, 15);
          const values: number[] = [date.getTime(), counter.totalRequests];
          list.push(values);
        }
        list = list.sort((n1, n2) => n1[0] - n2[0]);
        this.digitalData.set(key, list);
        this.selectedDigitalManifestations.push(value);
        for (const counter of value.usage) {
          const keyTest = counter.year + '-' + counter.month;
          if (this.selectedDigitalUsage.has(keyTest)) {
            this.selectedDigitalUsage.get(keyTest).totalRequests += counter.totalRequests;
          } else {
            this.selectedDigitalUsage.set(keyTest, counter);
          }
        }
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

  getIdentifiers(key: string): string {
    if (this.printManifestations.has(key)) {
      return this.printManifestations.get(key).shelfmark;
    } else if (this.digitalManifestations.has(key)) {
      return this.digitalManifestations.get(key).identifier;
    } else {
      return '';
    }
  }

  sendMessage(level: string, error: string) {
    this.messages.push({
      severity: level, summary: 'Fehler: ',
      detail: this.translateService.instant('message.' + error)
    });
    this.activePart = '';
    this.status = level;
    this.busy = false;
  }
}
