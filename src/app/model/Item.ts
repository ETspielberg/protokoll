/**
 * Created by Eike on 17.07.2017.
 */

import {Event} from './Event';

export class Item {

    constructor(
         public collection: string,
         public shelfmark: string,
         public itemId: number,
         public subLibrary: string,
         public material: string,
         public itemStatus: string,
         public processStatus: string,
         public inventoryDate: string,
         public deletionDate: string,
         public price: string,
         public etat: string,
         public events: Event[]
    ) {}
}
