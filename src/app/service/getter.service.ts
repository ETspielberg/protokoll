import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {ProtokollRequest} from '../model/ProtokollRequest';
import {Manifestation} from '../model/Manifestation';
import {Observable} from 'rxjs/Observable';
import {HttpClient} from '@angular/common/http';
import * as appGlobals from '../app.globals';

@Injectable()
export class GetterService {

  public manifestations: Manifestation[];

  constructor(private http: HttpClient) {
  }

  getFullManifestation(protokollRequest: ProtokollRequest): Observable<Manifestation[]> {
    const manifestationsFound = this.http.get<Manifestation[]>(appGlobals.getterUrl + '/fullManifestation?identifier=' +
      protokollRequest.shelfmark.trim() + '&exact=' + protokollRequest.exact
    );
    manifestationsFound.subscribe(data => this.manifestations = data);
    return manifestationsFound;
  }
}
