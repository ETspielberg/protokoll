import {HttpHeaders} from '@angular/common/http';

export const settingsUrl = '/api/settings';
export const getterUrl = '/getter';
export const resourcesUrl = '/api/resources';
export const headers = new HttpHeaders().set('Content-Type', 'application/json');
