import {Inject, Injectable, InjectionToken} from '@angular/core';
import 'rxjs/add/operator/map';
import {ProtokollRequest} from '../model/ProtokollRequest';
import {Manifestation} from '../model/Manifestation';
import {Observable} from 'rxjs/Observable';
import {HttpClient, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import * as appGlobals from '../app.globals';

@Injectable()
export class GetterService {

  public manifestations: Manifestation[];

  constructor(private http: HttpClient) {
  }

  getFullManifestation(shelfmark: string, exact: boolean): Observable<Manifestation[]> {
    const manifestationsFound = this.http.get<Manifestation[]>(
       'assets/data/example.json'
      // appGlobals.getterUrl + '/fullManifestation?identifier=' + shelfmark.trim() + '&exact=' + exact
    , { headers: new HttpHeaders({ timeout: `${60000}` }) });
    manifestationsFound.subscribe(data => this.manifestations = data);
    return manifestationsFound;
  }
}
