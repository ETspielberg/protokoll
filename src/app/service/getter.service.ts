import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {PrintManifestation} from '../model/PrintManifestation';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import * as appGlobals from '../app.globals';
import {ProtokollRequest} from '../model/ProtokollRequest';
import {DigitalManifestation} from '../model/DigitalManifestation';
import {PrimoResponse} from '../model/PrimoResponse';

@Injectable()
export class GetterService {

  public manifestations: PrintManifestation[];

  public digitalManifestation: DigitalManifestation[];

  public barcodeRegExp: RegExp = new RegExp('^[Dd]*[Ee][0-9]{3}[0-9]+');

  public collectionRegExp: RegExp = new RegExp('^[DdEe][0-9][0-9]');

  public isbnRegExp: RegExp = new RegExp('978[0-9]{9}[0-9X]');

  public typeOfIdentifier: string;

  public request: ProtokollRequest;

  private isElectronic = false;

  constructor(private http: HttpClient) {
  }

  getAllCounters(): Observable<DigitalManifestation[]> {
    // const url = 'assets/data/example_ebookcounter.json';
    const url = appGlobals.counterretrievalUrl + '/getForIsbn?isbn=' + this.request.shelfmark.replace(' ', ';');
    return this.http.get<DigitalManifestation[]>(url);
  }

  getCounters(identifier: string): Observable<DigitalManifestation> {
    const url = 'assets/data/example_ebookcounter.json';
    // const url = appGlobals.counterretrievalUrl + '/ebookcounter/getForIsbn/' + identifier;
    return this.http.get<DigitalManifestation>(url);
  }

  getPrimoResponse(identifier: string): Observable<PrimoResponse> {
    const url = appGlobals.getterUrl + '/getPrimoResponse/' + identifier.trim();
    return this.http.get<PrimoResponse>(url);
  }

  buildFullManifestation(identifier: string): Observable<PrintManifestation> {
    const url = appGlobals.getterUrl + '/buildFullManifestation/' + identifier.trim();
    return this.http.get<PrintManifestation>(url);
  }

  getFullManifestation(): Observable<PrintManifestation[]> {
    const shelfmark = this.request.shelfmark.trim().replace('+',
      '%2B').replace(' ', ';');
    let url = appGlobals.getterUrl + '/fullManifestation?identifier=' + shelfmark.trim() + '&exact=' + this.request.exact;
    if (this.barcodeRegExp.test(shelfmark)) {
      url = url + '&barcode';
    }
    return this.http.get<PrintManifestation[]>(
      // 'assets/data/example.json'
      url
      , {headers: new HttpHeaders({timeout: `${60000}`})});
  }

  setProtokollrequest(request: ProtokollRequest): string {
    this.request = request;
    this.typeOfIdentifier = this.determineType();
    this.checkForCollections();
    return this.typeOfIdentifier;
  }

  clearData() {
    this.digitalManifestation = [];
    this.manifestations = [];
  }

  /*
  with the help of regular expression, the given shelfmark is analyzed, whether it is an ISBN, a barcode or a shelfmark.
   */
  private determineType(): string {
    let test = this.request.shelfmark;
    let typeOfIdentifier = '';
    if (test.indexOf(' ') !== -1) {
      test = test.substring(0, test.indexOf(' '));
    }
    test = test.replace(/-/g, '').trim();
    if (this.isbnRegExp.test(test)) {
      typeOfIdentifier = 'ebook';
      this.isElectronic = true;
    } else if (this.barcodeRegExp.test(test)) {
      typeOfIdentifier = 'barcode';
      this.isElectronic = false;
    } else {
      typeOfIdentifier = 'shelfmark';
      this.isElectronic = false;
    }
    return typeOfIdentifier;
  }

  /* determines whether the given shelfmark contains collections information such as 'E31'. Cuts out the collection
  information and saves it to the collections variable. Then the collection is removed from the shelfmark as well as
  possible ':'. the resulting shelfmark is then saved into the shelfmark variable.
   */
  private checkForCollections() {
    let shelfmark = this.request.shelfmark.trim();
    if (this.collectionRegExp.test(shelfmark)) {
      this.request.collections = this.collectionRegExp.exec(shelfmark)[0];
      shelfmark = shelfmark.replace(this.request.collections, '');
      shelfmark = shelfmark.replace(':', '');
      this.request.shelfmark = shelfmark.trim();
    }
  }
}
