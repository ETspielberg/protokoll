/*
* https://scotch.io/tutorials/simple-language-translation-in-angular-2-part-1
* https://stackoverflow.com/questions/39007130/the-pipe-could-not-be-found-angular2-custom-pipe
*/

import {NgModule} from "@angular/core";
import {TranslatePipe} from "./translate.pipe";
import {TranslateService} from "./translate.service";
import {TRANSLATION_PROVIDERS} from "./translation";

@NgModule({
  imports: [],
  declarations: [TranslatePipe],
  exports: [TranslatePipe],
  providers: [TranslateService, TRANSLATION_PROVIDERS]
})
export class TranslateModule {}
