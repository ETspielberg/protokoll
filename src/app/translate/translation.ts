import { InjectionToken } from '@angular/core';

// import translations
import { LANG_DE_NAME, LANG_DE_TRANS } from './lang-de';
import { LANG_EN_NAME, LANG_EN_TRANS } from './lang-en';

// translation token
export const TRANSLATIONS = new InjectionToken<string>('translations');

// all translations
export const dictionary = {
  [LANG_DE_NAME]: LANG_DE_TRANS,
  [LANG_EN_NAME]: LANG_DE_TRANS
};

// providers
export const TRANSLATION_PROVIDERS = [
  { provide: TRANSLATIONS, useValue: dictionary },
];
