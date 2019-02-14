import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Manifestation} from '../model/Manifestation';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import * as appGlobals from '../app.globals';
import {ProtokollRequest} from '../model/ProtokollRequest';
import {CounterCollection} from '../model/CounterCollection';

@Injectable()
export class GetterService {

  public manifestations: Manifestation[];

  public counters: CounterCollection[];

  public barcodeRegExp: RegExp;

  public collectionRefExp: RegExp;

  public typeOfIdentifier: string;

  public request: ProtokollRequest;

  private journalcounterUrl = appGlobals.counterretrievalUrl + '/journalcounter';

  private ebookcounterUrl = appGlobals.counterretrievalUrl + '/ebookcounter';

  constructor(private http: HttpClient) {
    this.barcodeRegExp = new RegExp('^[Dd]*[Ee][0-9]+');
    this.collectionRefExp = new RegExp('^[DdEe][0-9][0-9]');
  }

  getAllCounters(): Observable<CounterCollection[]> {
    let url;
    if (this.typeOfIdentifier === 'journal') {
      url = this.journalcounterUrl + '/getForIssn?issn=' + this.request.shelfmark.replace(' ', ';');
    } else if (this.typeOfIdentifier === 'ebook') {
      url = 'assets/data/example_ebookcounter.json';
      // url = this.ebookcounterUrl + '/getForIsbn?isbn=' + this.request.shelfmark.replace(' ', ';');
    }
    return this.http.get<CounterCollection[]>(url);
  }

  getFullManifestation(): Observable<Manifestation[]> {
    const shelfmark = this.request.shelfmark.trim().replace('+',
      '%2B').replace(' ', ';');
    let url = appGlobals.getterUrl + '/fullManifestation?identifier=' + shelfmark.trim() + '&exact=' + this.request.exact;
    if (this.barcodeRegExp.test(shelfmark)) {
      url = url + '&barcode';
    }
    return this.http.get<Manifestation[]>(
      // 'assets/data/example.json'
          url
      , {headers: new HttpHeaders({timeout: `${60000}`})});
  }

  setProtokollrequest(request: ProtokollRequest) {
    this.request = request;
    this.determineType();
    this.checkForCollections();
  }

  private determineType(): void {
    let test = this.request.shelfmark;
    console.log(test);
    if (test.indexOf(' ') !== -1) {
      test = test.substring(0, test.indexOf(' '));
    }
    test = test.replace(/-/g, '').trim();
    console.log(test);
    if (test.length === 8) {
      this.typeOfIdentifier = 'journal';
    } else if (test.length === 10 || (test.length === 13 && test.startsWith('978'))) {
      this.typeOfIdentifier = 'ebook';
    } else if (this.barcodeRegExp.test(test)) {
      this.typeOfIdentifier = 'barcode';
    } else {
      this.typeOfIdentifier = 'shelfmark';
    }
  }

  private checkForCollections() {
    const shelfmark = this.request.shelfmark.trim();
    if (shelfmark.indexOf(':') > -1) {
      this.request.collections = shelfmark.substring(0, shelfmark.indexOf(':'));
      this.request.shelfmark = shelfmark.substring(shelfmark.indexOf(':') + 1, shelfmark.length);
    }
  }
}
