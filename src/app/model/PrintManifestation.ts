import {Item} from './Item';
import {BibliographicInformation} from './BibliographicInformation';
/**
 * Created by Eike on 17.07.2017.
 */

export class PrintManifestation {

    constructor(
        public titleID: string,
        public items: Item[],
        public bibliographicInformation: BibliographicInformation,
        public shelfmark: string,
        public shelfmarkBase: string,
        public edition: string,
        public collections: string[],
        public materials: string[],
        public subLibraries: string[]
    ) {}
}
