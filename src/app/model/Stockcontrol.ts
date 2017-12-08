/**
 * Created by etspi on 25.06.2017.
 */

export class Stockcontrol  {

    constructor(
        public identifier : string,
        public description : string,
        public subjectID : string,
        public yearsToAverage : number,
        public minimumYears : number,
        public staticBuffer : number,
        public variableBuffer : number,
        public yearsOfRequests : number,
        public minimumDaysOfRequest : number,
        public groupedAnalysis : boolean,
        public materials? : string,
        public collections? : string,
        public deletionMailBcc? : string,
        public status? : string,
        public systemCode? : string
) { }
}