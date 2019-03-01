export class ProtokollRequest {


  public collections = '';
  public materials = '';
  public exact = false;
  public shelfmark = '';

  private type = '';

  private barcodeRegExp: RegExp = new RegExp('^[Dd]*[Ee][0-9]{3}[0-9]+');

  private collectionRegExp: RegExp = new RegExp('^[DdEe][0-9][0-9]');

  private isbnRegExp: RegExp = new RegExp('978[0-9]{9}[0-9X]');


  constructor() {
  }

  public update() {
    this.checkForCollections();
    this.determineType();
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

  public getType(): string {
    this.determineType();
    return this.type;
  }

  private determineType() {
    let test = this.shelfmark;
    if (test.indexOf(' ') !== -1) {
      test = test.substring(0, test.indexOf(' '));
    }
    test = test.replace(/-/g, '').trim();
    if (this.isbnRegExp.test(test)) {
      this.type = 'ebook';
    } else if (this.barcodeRegExp.test(test)) {
      this.type = 'barcode';
    } else {
      this.type = 'shelfmark';
    }
  }

  private checkForCollections() {
    let shelfmark = this.shelfmark.trim();
    if (this.collectionRegExp.test(shelfmark)) {
      this.collections = this.collectionRegExp.exec(shelfmark)[0];
      shelfmark = shelfmark.replace(this.collections, '');
      shelfmark = shelfmark.replace(':', '');
      shelfmark = shelfmark.replace('=', '');
      this.shelfmark = shelfmark.trim();
    }
  }
}
