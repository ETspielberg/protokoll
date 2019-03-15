import {Component, OnInit} from '@angular/core';
import {ProtokollRequest} from './model/ProtokollRequest';
import {PrintManifestation} from './model/PrintManifestation';
import {GetterService} from './service/getter.service';
import {Message} from 'primeng/primeng';
import {Item} from './model/Item';
import {Event} from './model/Event';

import {ActivatedRoute, Params, Router} from '@angular/router';
import 'rxjs/add/operator/switchMap';
import {MenuItem, MessageService, SelectItem} from 'primeng/api';
import {TranslateService} from './translate';
import {ClipboardService} from 'ngx-clipboard';
import {DigitalManifestation} from './model/DigitalManifestation';
import {EbookCounter} from './model/EbookCounter';
import {PrimoData} from './model/PrimoData';
import {PrimoResponse} from './model/PrimoResponse';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  providers: [GetterService]
})

export class AppComponent implements OnInit {

  constructor(public getterService: GetterService,
              private router: Router,
              private route: ActivatedRoute,
              private translateService: TranslateService,
              private clipboardService: ClipboardService,
              private messageService: MessageService) {
  }

  printManifestations: Map<string, PrintManifestation>;
  digitalManifestations: Map<string, DigitalManifestation>;
  primoData: Map<string, PrimoData>;
  printData: Map<string, number[][]>;
  digitalData: Map<string, number[][]>;
  private filteredItems: Map<string, Item[]>;
  private filteredEvents: Map<string, Event[]>;
  private filteredManifestations: Map<string, PrintManifestation>;
  private selectedDigitalUsage: Map<string, EbookCounter>;
  statsCollection: Map<string, number>;
  statsMaterials: Map<string, number>;
  statsManifestations: Map<string, number>;

  selectedPrintManifestations: PrintManifestation[];
  selectedDigitalManifestations: DigitalManifestation[];
  selectedEvents: Event[];
  selectedItems: Item[];

  recKeys: Set<string>;

  title: string;

  busy: boolean;
  show: object;
  primaryLoad = true;

  messages: Message[];

  protokollRequest: ProtokollRequest;

  filterList: object;

  public uniqueCollections: string[];
  public uniqueMaterials: string[];

  items: MenuItem[] = [];

  activeItem: MenuItem;

  activePart: string;

  status = 'ready';

  chartDetail = 'overview';

  chartDetails = ['overview', 'groups'];

  chartDetailsOptions: SelectItem[] = [];

  private tabs: string[] = ['graph', 'bibliography', 'information', 'usage', 'items', 'events', 'analysis'];

  ngOnInit(): void {
    this.translateService.use('de');
    this.chartDetails.forEach(entry => this.chartDetailsOptions.push({
      label: this.translateService.instant(entry),
      value: entry
    }));
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
    });
  }

  reset() {
    this.primoData = new Map<string, PrimoData>();
    this.printManifestations = new Map<string, PrintManifestation>();
    this.digitalManifestations = new Map<string, DigitalManifestation>();
    this.filteredManifestations = new Map<string, PrintManifestation>();
    this.filteredItems = new Map<string, Item[]>();
    this.filteredEvents = new Map<string, Event[]>();
    this.selectedDigitalUsage = new Map<string, EbookCounter>();
    this.recKeys = new Set<string>();
    this.selectedPrintManifestations = [];
    this.selectedDigitalManifestations = [];
    this.printData = new Map<string, number[][]>();
    this.digitalData = new Map<string, number[][]>();
    this.selectedItems = [];
    this.selectedEvents = [];
    this.messages = [];
    this.activePart = 'graph';
    this.filterList = {};
    this.show = {};
    this.show['editions'] = true;
    this.show['collections'] = true;
    this.show['materials'] = true;
    this.show['usergroups'] = false;
    this.show['filter'] = true;
    this.show['digital'] = true;
  }

  collect() {
    this.busy = true;
    this.status = 'collecting';
    this.reset();
    this.protokollRequest.update();
    if (this.protokollRequest.getType() === 'ebook') {
      this.getDigitalManifestations();
    } else {
      this.getAllPrintManifestations();
    }
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
            const recKey = entry.bibliographicInformation.recKey;
            if ('' !== recKey) {
              if (!this.recKeys.has(recKey)) {
                this.recKeys.add(recKey);
              }
            }
          });
        }
        this.primaryLoad = false;
      },
      error => {
        this.sendMessage('error', 'error');
        this.primaryLoad = false;
        console.log(error);
      },
      () => {
        this.initializePrintFilterLists();
        this.collectPrimoResponses();
      }
    );
  }

  getDigitalManifestations() {
    this.getterService.getAllDigitalManifestations(this.protokollRequest).subscribe(
      data => {
        if (data.length === 0) {
          this.sendMessage('error', 'nothingFound');
        } else {
          data.forEach(record => {
            this.digitalManifestations.set(record.identifier, record);
            this.filterList[record.identifier] = true;
          });
        }
        this.primaryLoad = false;
      },
      error => {
        this.sendMessage('error', 'error');
        this.primaryLoad = false;
        console.log(error);
      },
      () => {
        this.collectPrimoResponses();
        this.convertCounterIntoPlotData();
      }
    );
  }


  collectPrimoResponses() {
    this.printManifestations.forEach(
      (value, key) => {
        if (!this.primoData.has(key)) {
          let isbn = value.bibliographicInformation.isbn;
          if ('' !== isbn) {
            isbn = isbn.replace(/-/g, '').trim();
            if (isbn.length > 13) {
              if (isbn.startsWith('978')) {
                isbn = isbn.substring(0, 13);
              } else {
                isbn = isbn.substring(0, 10);
              }
            }
            this.getterService.getPrimoResponse(isbn).subscribe(
              data => this.storePrimoResponse(data),
              error => console.log(error),
              () => this.extendManifestations()
            );
          }
        }
      });
    this.digitalManifestations.forEach(
      (value, key) => {
        if (!this.primoData.has(key)) {
          this.getterService.getPrimoResponse(key).subscribe(
            data => this.storePrimoResponse(data),
            error => console.log(error),
            () => this.extendManifestations()
          );
        }
      });
  }

  storePrimoResponse(data: PrimoResponse) {
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
  }

  extendManifestations() {
    this.primoData.forEach((value, key) => {
        if ('Online Resource' === value.type) {
          if (!this.digitalManifestations.has(key)) {
            for (const keyInd of key.split(';')) {
              if (value.doi !== '') {
                this.getterService.getDigitalManifestationByIdentifiers(keyInd, value.doi).subscribe(
                  dm => {
                    if (dm.usage.length > 0) {
                      this.filterList[keyInd] = true;
                      this.digitalManifestations.set(keyInd, dm);
                      this.convertCounterIntoPlotData();
                    } else {
                      this.sendMessage('warn', 'noUsage');
                    }
                  }, error => this.sendMessage('error', 'noConnection'));
              } else {
                this.getterService.getDigitalManifestation(key).subscribe(
                  dm => {
                    if (dm.usage.length > 0) {
                      this.filterList[keyInd] = true;
                      this.digitalManifestations.set(keyInd, dm);
                      this.convertCounterIntoPlotData();
                    } else {
                      this.sendMessage('warn', 'noUsage');
                    }
                  }, error => this.sendMessage('error', 'noConnection')
                );
              }
            }
          }
        } else if ('Physical Item' === value.type) {
          if (!this.recKeys.has(key)) {
            let shelfmark = value.shelfmarks;
            if (value.shelfmarks.indexOf(';') > 0) {
              shelfmark = shelfmark.substring(0, shelfmark.indexOf(';'));
            }
            shelfmark = shelfmark.substring(shelfmark.indexOf(' '), shelfmark.length);
            const protokollrequest = new ProtokollRequest();
            protokollrequest.shelfmark = shelfmark;
            protokollrequest.exact = true;
            this.getterService.getAllPrintManifestations(protokollrequest).subscribe(
              pm => {
                pm.forEach(entry => {
                    this.printManifestations.set(entry.titleID, entry);
                    this.filterList[entry.titleID] = true;
                    const recKey = entry.bibliographicInformation.recKey;
                    if ('' !== recKey) {
                      if (!this.recKeys.has(recKey)) {
                        this.recKeys.add(recKey);
                      }
                    }
                  }
                );
              },
              error => this.sendMessage('warn', 'noUsage'),
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
      }
    });
  }

  toggleShow(part: string) {
    this.show[part] = !this.show[part];
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
    this.messages = [];
    switch (level) {
      case 'error': {
        this.messages.push({
          severity: error, summary: 'Fehler: ',
          detail: this.translateService.instant('message.' + error)
        });
      }
    }
    this.status = level;
    this.busy = false;
  }
}
