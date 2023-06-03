import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AmrrHomeComponent } from './amrr-home/amrr-home.component';
import { AmrrLoginComponent } from './auth/amrr-login/amrr-login.component';
import { ChildAuthGuard } from './auth/child-auth.guard';
import { AuthGuard } from './auth/auth.guard';
import { AttendanceRegisterComponent } from './attendance-register/attendance-register.component';
import { AttendanceRegisterEditorComponent } from './attendance-register/attendance-register-editor/attendance-register-editor.component';
import { CompanyBrowserComponent } from './control-panel/company-browser/company-browser.component';
import { UnitBrowserComponent } from './control-panel/unit-browser/unit-browser.component';
import { EmployeeBrowserComponent } from './control-panel/employee-browser/employee-browser.component';
import { UserBrowserComponent } from './control-panel/user-browser/user-browser.component';
import { HolidayBrowserComponent } from './control-panel/holiday-browser/holiday-browser.component';
import { AdminGuard } from './auth/admin.guard';
import { AmrrChangePasswordComponent } from './auth/amrr-change-password/amrr-change-password.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { PayslipBrowserComponent } from './payslip-browser/payslip-browser.component';
import { BonusBrowserComponent } from './control-panel/bonus-browser/bonus-browser.component';

const routes: Routes = [
  { path: 'login', component: AmrrLoginComponent },
  {
    path: '',
    component: AmrrHomeComponent,
    canActivate: [AuthGuard],
    canActivateChild: [ChildAuthGuard],
    children: [
      { path: 'register', component: AttendanceRegisterComponent },
      {
        path: 'attendanceEditor',
        component: AttendanceRegisterEditorComponent,
      },
      {
        path: 'payslip',
        component: PayslipBrowserComponent,
      },
      // control panel routes
      {
        path: 'company',
        component: CompanyBrowserComponent,
        canActivate: [AdminGuard],
      },
      {
        path: 'unit',
        component: UnitBrowserComponent,
        canActivate: [AdminGuard],
      },
      {
        path: 'employee',
        component: EmployeeBrowserComponent,
        canActivate: [AdminGuard],
      },
      {
        path: 'user',
        component: UserBrowserComponent,
        canActivate: [AdminGuard],
      },
      {
        path: 'holiday',
        component: HolidayBrowserComponent,
        canActivate: [AdminGuard],
      },
      {
        path: 'bonus',
        component: BonusBrowserComponent,
        canActivate: [AdminGuard],
      },
      {
        path: 'changePassword',
        component: AmrrChangePasswordComponent,
        canActivate: [AdminGuard],
      },
    ],
  },
  { path: 'noAccess', pathMatch: 'full', component: PageNotFoundComponent },
  { path: '**', pathMatch: 'full', component: PageNotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
