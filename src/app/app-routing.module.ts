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
      // control panel routes
      {
        path: 'company',
        component: CompanyBrowserComponent,
      },
      {
        path: 'unit',
        component: UnitBrowserComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
