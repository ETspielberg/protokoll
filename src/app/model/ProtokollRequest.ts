export class ProtokollRequest {

  public shelfmark = '';
  public collections = '';
  public materials = '';
  public exact = false;


  constructor() {
  }

  public asUrlParamters(): string {
    let url = 'shelfmark=' + this.shelfmark;
    if (this.collections !== '') {
      url = url + '&collections=' + this.collections;
    }
    if (this.materials !== '') {
      url = url + '&materials=' + this.materials;
    }
    if (this.exact) {
      url = url + '&exact=true';
    }
    return url;
  }
}
