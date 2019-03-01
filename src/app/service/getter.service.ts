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

  constructor(private http: HttpClient) {
  }

  getAllDigitalManifestations(protokollRequest: ProtokollRequest): Observable<DigitalManifestation[]> {
    const url = 'assets/data/example_ebookcounter.json';
    // const url = appGlobals.counterretrievalUrl + '/getForIsbn?isbn=' + protokollRequest.shelfmark.replace(' ', ';');
    return this.http.get<DigitalManifestation[]>(url);
  }

  getDigitalManifestation(identifier: string): Observable<DigitalManifestation> {
    const url = 'assets/data/example_ebookcounter.json';
    // const url = appGlobals.counterretrievalUrl + '/getForIsbn?isbn=' + identifier;
    return this.http.get<DigitalManifestation>(url);
  }

  getPrimoResponse(identifier: string): Observable<PrimoResponse> {
    const url = appGlobals.getterUrl + '/getPrimoResponse/' + identifier.trim();
    return this.http.get<PrimoResponse>(url);
  }

  getPrintManifestation(identifier: string): Observable<PrintManifestation> {
    const url = appGlobals.getterUrl + '/buildFullManifestation/' + identifier.trim();
    return this.http.get<PrintManifestation>(url);
  }

  getAllPrintManifestations(protokollRequest: ProtokollRequest): Observable<PrintManifestation[]> {
    const shelfmark = protokollRequest.shelfmark.trim().replace('+',
      '%2B').replace(' ', ';');
    let url = appGlobals.getterUrl + '/fullManifestation?identifier=' + shelfmark.trim() + '&exact=' + protokollRequest.exact;
    if (protokollRequest.getType() === 'barcode') {
      url = url + '&barcode';
    }
    return this.http.get<PrintManifestation[]>(
       'assets/data/example.json'
      // url
      , {headers: new HttpHeaders({timeout: `${60000}`})});
  }
}
