import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AmrrHomeComponent } from './amrr-home/amrr-home.component';
import { AmrrLoginComponent } from './auth/amrr-login/amrr-login.component';
import { ChildAuthGuard } from './auth/child-auth.guard';
import { AuthGuard } from './auth/auth.guard';
import { AttendanceRegisterComponent } from './attendance-register/attendance-register.component';
import { AttendanceRegisterEditorComponent } from './attendance-register/attendance-register-editor/attendance-register-editor.component';

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
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
