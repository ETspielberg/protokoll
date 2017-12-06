import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';

const routes: Routes = [
    { path: '', component: AppComponent }
];

export const protokollRouting: ModuleWithProviders = RouterModule.forRoot(routes);
