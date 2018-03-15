import { Pipe, PipeTransform } from '@angular/core';
import {TranslateService} from './translate.service';

@Pipe({
  name: 'translate',
})

export class TranslatePipe implements PipeTransform {

  constructor(private translate: TranslateService) { }

  transform(value: string, lang: string): any {
    if (!value) return;
    if (lang) {
      this.translate.use(lang);
    }
    return this.translate.instant(value);
  }
}
