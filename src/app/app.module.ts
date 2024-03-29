import { ErrorHandler, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AmrrLoadingDialogService } from './shared/amrr-loading/amrr-loading-dialog.service';
import { ApiBusinessService } from './shared/api-business.service';
import { GlobalErrorHandler } from './shared/global-error-handler';
import { HttpLoadingInterceptor } from './shared/http-loading.interceptor';
import { AttendanceRegisterComponent } from './attendance-register/attendance-register.component';
import { SharedModule } from './shared/shared.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AmrrLoginComponent } from './auth/amrr-login/amrr-login.component';
import { AmrrHomeComponent } from './amrr-home/amrr-home.component';
import { AttendanceRegisterEditorComponent } from './attendance-register/attendance-register-editor/attendance-register-editor.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CompanyBrowserComponent } from './control-panel/company-browser/company-browser.component';
import { UnitBrowserComponent } from './control-panel/unit-browser/unit-browser.component';
import { EmployeeBrowserComponent } from './control-panel/employee-browser/employee-browser.component';
import { UserBrowserComponent } from './control-panel/user-browser/user-browser.component';
import { HolidayBrowserComponent } from './control-panel/holiday-browser/holiday-browser.component';
import { AmrrChangePasswordComponent } from './auth/amrr-change-password/amrr-change-password.component';
import { PageNotFoundComponent } from './shared/page-not-found/page-not-found.component';
import { PayslipBrowserComponent } from './payslip-browser/payslip-browser.component';
import { BonusBrowserComponent } from './control-panel/bonus-browser/bonus-browser.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { PayslipAllowanceEditorComponent } from './payslip-browser/payslip-allowance-editor/payslip-allowance-editor.component';
import { SalaryAdvanceBrowserComponent } from './salary-advance-browser/salary-advance-browser.component';

@NgModule({
  declarations: [
    AppComponent,
    AmrrHomeComponent,
    AmrrLoginComponent,
    AttendanceRegisterComponent,
    AttendanceRegisterEditorComponent,
    CompanyBrowserComponent,
    UnitBrowserComponent,
    EmployeeBrowserComponent,
    UserBrowserComponent,
    HolidayBrowserComponent,
    AmrrChangePasswordComponent,
    PageNotFoundComponent,
    PayslipBrowserComponent,
    BonusBrowserComponent,
    PayslipAllowanceEditorComponent,
    SalaryAdvanceBrowserComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    SharedModule,
    DragDropModule,
    NgxChartsModule
  ],
  providers: [
    DatePipe,
    DecimalPipe,
    ApiBusinessService,
    AmrrLoadingDialogService,
    // {
    //   provide: ErrorHandler,
    //   useClass: GlobalErrorHandler,
    // },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpLoadingInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
