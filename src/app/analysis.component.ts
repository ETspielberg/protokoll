import {GetterService} from './service/getter.service';
import {Manifestation} from "./model/Manifestation";

export class AnalysisComponent {

  private manifestations: Manifestation[];

  constructor(private getterService: GetterService) {
  }


}
