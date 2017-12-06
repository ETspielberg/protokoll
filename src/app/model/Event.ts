/**
 * Created by Eike on 12.07.2017.
 */

export class Event {

    constructor(
        public itemId: string,
         public time: number,
         public date: string,
         public year: string,
         public type: string,
         public borrowerStatus: string,
         public sorter: number,
         public delta: number,
        public collection?: string,
        public shelfmark?: string,
         public endEvent?: Event,
         public duration?: number
    ) {}
}
