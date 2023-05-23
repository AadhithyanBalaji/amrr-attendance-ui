import { Component, OnInit } from '@angular/core';
import { CompanyBrowserService } from './company-browser.service';

@Component({
  selector: 'app-company-browser',
  templateUrl: './company-browser.component.html',
  providers: [CompanyBrowserService],
})
export class CompanyBrowserComponent implements OnInit {
  constructor(readonly browserService: CompanyBrowserService) {}
  ngOnInit(): void {
    this.browserService.init();
  }
}
