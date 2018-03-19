import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Manifestation} from '../model/Manifestation';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpHeaders, } from '@angular/common/http';
import * as appGlobals from '../app.globals';

@Injectable()
export class GetterService {

  public manifestations: Manifestation[];

  public barcodeRegExp: RegExp;

  constructor(private http: HttpClient) {
    this.barcodeRegExp = new RegExp('^[Dd]*[Ee][0-9]+');
  }

  getFullManifestation(shelfmark: string, exact: boolean): Observable<Manifestation[]> {
    let url = appGlobals.getterUrl + '/fullManifestation?identifier=' + shelfmark.trim() + '&exact=' + exact;
    if (this.barcodeRegExp.test(shelfmark)) {
      url = url + '&barcode';
    }
    const manifestationsFound = this.http.get<Manifestation[]>(
       // 'assets/data/example.json'
         url
    , { headers: new HttpHeaders({ timeout: `${60000}` }) });
    manifestationsFound.subscribe(data => this.manifestations = data);
    return manifestationsFound;
  }
}
