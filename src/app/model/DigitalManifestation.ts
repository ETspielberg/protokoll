import {BibliographicInformation} from './BibliographicInformation';
import {EbookCounter} from './EbookCounter';

export class DigitalManifestation {

  constructor(
    public identifier: string,
    public usage: EbookCounter[],
    public totalRequests: number,
    public title: string,
    public recordId?: string,
    public bibliographicInformation?: BibliographicInformation
  ) {}
}
