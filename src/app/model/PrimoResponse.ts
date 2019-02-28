import {PrimoData} from './PrimoData';

export class PrimoResponse {

  constructor(public electronic: PrimoData[],
              public print: PrimoData[]) {}
}
