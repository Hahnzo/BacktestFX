import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/components/login/login.component';
import { RegisterComponent } from './app/components/register/register.component';
import { DashboardComponent } from './app/components/dashboard/dashboard.component';
import { BacktestFormComponent } from './app/components/backtest-form/backtest-form.component';
import { BacktestDetailComponent } from './app/components/backtest-detail/backtest-detail.component';
import { authInterceptor } from './app/auth.interceptor';
import { importProvidersFrom } from '@angular/core';
import { authGuard } from './app/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'backtest/new', component: BacktestFormComponent, canActivate: [authGuard] },
  { path: 'backtest/edit/:id', component: BacktestFormComponent, canActivate: [authGuard] },
  { path: 'backtest/:id', component: BacktestDetailComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '/dashboard' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
}).catch(err => console.error(err));