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
import {FormsModule} from '@angular/forms';
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
import {HighchartsChartModule} from 'highcharts-angular';
import {ClipboardModule, ClipboardService} from 'ngx-clipboard';
import {MessageService} from 'primeng/api';

@NgModule({
  imports: [HttpClientModule,
    HighchartsChartModule,
    ButtonModule,
    TooltipModule,
    InputTextModule,
    ClipboardModule,
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
    DialogModule],
  declarations: [RootComponent, AppComponent, AnalysisComponent, StatisticsComponent, GraphComponent],
  bootstrap: [RootComponent],
  providers: [GetterService, DecimalPipe, ClipboardService, MessageService, [{ provide: HTTP_INTERCEPTORS, useClass: TimeoutInterceptor, multi: true }],
    [{ provide: DEFAULT_TIMEOUT, useValue: defaultTimeout }]]
})

export class AppModule {}
