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
    // const url = 'assets/data/example_digital_manifestations.json';
    const url = appGlobals.counterretrievalUrl + '/ebookcounter/isbns/' + protokollRequest.shelfmark.replace(' ', ';');
    return this.http.get<DigitalManifestation[]>(url);
  }

  searchPrimoForAutorTitle(authors: string, title: string): Observable<PrimoResponse> {
    return this.http.get<PrimoResponse>(appGlobals.getterUrl + '/getauthorTitle?authors=' + authors + '&title=' + title);
  }

  getDigitalManifestation(identifier: string): Observable<DigitalManifestation> {
    // const url = 'assets/data/example_ebookcounter.json';
    const url = appGlobals.counterretrievalUrl + '/ebookcounter/isbn/' + identifier;
    return this.http.get<DigitalManifestation>(url);
  }

  getDigitalManifestationByIdentifiers(doi: string, isbn: string): Observable<DigitalManifestation> {
    // const url = 'assets/data/example_ebookcounter.json';
    const url = appGlobals.counterretrievalUrl + '/ebookcounter/identifiers?doi=' + doi + '?isbn=' + isbn;
    return this.http.get<DigitalManifestation>(url);
  }

  getPrimoResponse(identifier: string): Observable<PrimoResponse> {
    // const url = '/assets/data/example_primo_response.json';
    const url = appGlobals.getterUrl + '/getPrimoResponse/' + identifier.trim();
    return this.http.get<PrimoResponse>(url);
  }

  getPrintManifestation(identifier: string): Observable<PrintManifestation> {
    const url = appGlobals.getterUrl + '/buildFullManifestation?identifier=' + identifier.trim();
    // const url = 'assets/data/example_manifestation.json';
    return this.http.get<PrintManifestation>(url);
  }

  getAllPrintManifestations(protokollRequest: ProtokollRequest): Observable<PrintManifestation[]> {
    const shelfmark = protokollRequest.shelfmark.trim().replace('+',
      '%2B').replace(' ', ';');
    let url = appGlobals.getterUrl + '/fullManifestation?identifier=' + shelfmark.trim() + '&exact=' + protokollRequest.exact;
    if (protokollRequest.getType() === 'barcode') {
      url = url + '&barcode';
    }
    // url = 'assets/data/example.json';
    return this.http.get<PrintManifestation[]>(url, {headers: new HttpHeaders({timeout: `${60000}`})});
  }
}
