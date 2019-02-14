///<reference path='../../node_modules/primeng/components/common/menuitem.d.ts'/>
import {AppComponent} from './app.component';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {DataTableModule} from 'primeng/components/datatable/datatable';
import {
  TabMenuModule, ToggleButtonModule, DialogModule, InputTextModule,
  ButtonModule, TooltipModule, MessagesModule, CheckboxModule, PanelModule,
  ScrollPanelModule, TabViewModule, AccordionModule
} from 'primeng/primeng';
import {ChartModule} from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import {FormsModule} from '@angular/forms';
import * as highcharts from 'highcharts';
import HighchartsExporting from 'highcharts/modules/exporting.src';
import {CommonModule, DecimalPipe} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {GetterService} from './service/getter.service';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DEFAULT_TIMEOUT, defaultTimeout, TimeoutInterceptor} from './TimeoutInterceptor';
import {mainRoutingProviders, routing} from './root.route';
import {RootComponent} from './root.component';
import {TranslateModule} from './translate/translate.module';
import {SliderModule} from 'primeng/slider';
import {AnalysisComponent} from './analysis.component';
import {StatisticsComponent} from './statistics.component';
import {GraphComponent} from './graph.component';


export function highchartsFactory() {
  const hc = require('highcharts');
  const dd = require('highcharts/modules/drilldown');
  dd(hc);
  return hc;
}

HighchartsExporting(highcharts);

@NgModule({
  imports: [HttpClientModule,
    ButtonModule,
    TooltipModule,
    InputTextModule,
    PanelModule,
    CheckboxModule,
    MessagesModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    ScrollPanelModule,
    TabViewModule,
    SliderModule,
    RouterModule,
    AccordionModule,
    mainRoutingProviders,
    routing,
    FormsModule,
    DataTableModule,
    ToggleButtonModule,
    TranslateModule,
    TabMenuModule,
    ChartModule,
    DialogModule],
  declarations: [RootComponent, AppComponent, AnalysisComponent, StatisticsComponent, GraphComponent],
  bootstrap: [RootComponent],
  providers: [GetterService, DecimalPipe, {provide: HighchartsStatic,
    useFactory: highchartsFactory}, [{ provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true }],
    [{ provide: DEFAULT_TIMEOUT, useValue: defaultTimeout }]]
})

export class AppModule {}
