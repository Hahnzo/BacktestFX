import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

// Define Routes
const routes: Routes = [
  { path: '', loadComponent: () => import('./app/components/home/home.component').then(m => m.HomeComponent) },
  { path: 'backtest', loadComponent: () => import('./app/components/backtest/backtest.component').then(m => m.BacktestComponent) }
];

// Bootstrap App with Routing and HttpClient
bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule)
  ]
}).catch(err => console.error(err));
