import {AppComponent} from './app.component';
import {RouterModule} from '@angular/router';
import {NgModule} from '@angular/core';
import {DataTableModule} from 'primeng/components/datatable/datatable';
import {
  InputSwitchModule, SelectButtonModule, TabMenuModule, ToggleButtonModule, DialogModule, InputTextModule,
  ButtonModule, TooltipModule, MessageModule, MessagesModule, CheckboxModule, PanelModule, AccordionModule,
  ScrollPanelModule
} from 'primeng/primeng';
import {ChartModule} from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import {FormsModule} from '@angular/forms';
import * as highcharts from 'highcharts';
import {protokollRouting} from './app.routing';
import {CommonModule} from '@angular/common';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {GetterService} from './service/getter.service';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AnalyzerService} from './service/analyzer.service';
import {DEFAULT_TIMEOUT, defaultTimeout, TimeoutInterceptor} from './TimeoutInterceptor';
import {mainRoutingProviders, routing} from "./root.route";
import {RootComponent} from "./root.component";


export function highchartsFactory() {
  const hc = require('highcharts');
  const dd = require('highcharts/modules/drilldown');
  dd(hc);

  return hc;
}

@NgModule({
  imports: [HttpClientModule,
    ButtonModule,
    TooltipModule,
    InputTextModule,
    PanelModule,
    CheckboxModule,
    MessagesModule,
    MessageModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    AccordionModule,
    ScrollPanelModule,
    RouterModule,
    mainRoutingProviders,
    routing,
    FormsModule,
    DataTableModule,
    ToggleButtonModule,
    InputSwitchModule,
    TabMenuModule,
    SelectButtonModule,
    ChartModule,
    DialogModule],
  declarations: [RootComponent, AppComponent],
  bootstrap: [RootComponent],
  providers: [GetterService, AnalyzerService, {provide: HighchartsStatic,
    useFactory: highchartsFactory}, [{ provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true }],
    [{ provide: DEFAULT_TIMEOUT, useValue: defaultTimeout }]]
})

export class AppModule {}
