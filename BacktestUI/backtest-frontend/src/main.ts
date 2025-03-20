import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app/app.component';
import { LoginComponent } from './app/components/login/login.component';
import { RegisterComponent } from './app/components/register/register.component';
import { DashboardComponent } from './app/components/dashboard/dashboard.component';
import { BacktestFormComponent } from './app/components/backtest-form/backtest-form.component';
import { BacktestDetailComponent } from './app/components/backtest-detail/backtest-detail.component';

import { authInterceptor } from './app/auth.interceptor';
import { AuthGuard } from './app/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'backtest/new', component: BacktestFormComponent, canActivate: [AuthGuard] },
  { path: 'backtest/edit/:id', component: BacktestFormComponent, canActivate: [AuthGuard] },
  { path: 'backtest/:id', component: BacktestDetailComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '/dashboard' }
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    importProvidersFrom(FormsModule, ReactiveFormsModule),
    AuthGuard
  ]
})
.catch(err => console.error(err));
