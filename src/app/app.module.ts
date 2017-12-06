import {AppComponent} from './app.component';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {DataTableModule} from 'primeng/components/datatable/datatable';
import {InputSwitchModule, SelectButtonModule, TabMenuModule, ToggleButtonModule, DialogModule, InputTextModule} from 'primeng/primeng';
import {ChartModule} from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import {FormsModule} from '@angular/forms';
import * as highcharts from 'highcharts';
import {protokollRouting} from './app.routing';
import {CommonModule} from '@angular/common';
import {HttpClientModule} from '@angular/common/http';
import {GetterService} from './service/getter.service';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';


export function highchartsFactory() {
  const hc = require('highcharts');
  const dd = require('highcharts/modules/drilldown');
  dd(hc);

  return hc;
}

@NgModule({
  imports: [HttpClientModule,
    InputTextModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    RouterModule,
    FormsModule,
    DataTableModule,
    ToggleButtonModule,
    InputSwitchModule,
    TabMenuModule,
    SelectButtonModule,
    ChartModule,
    DialogModule,
    protokollRouting],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  exports: [AppComponent],
  providers: [GetterService, {provide: HighchartsStatic,
    useFactory: highchartsFactory}]
})

export class AppModule {}
