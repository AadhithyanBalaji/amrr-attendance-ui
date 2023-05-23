import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environment';

@Injectable()
export class ApiBusinessService {
  baseURL = '';

  constructor(private readonly httpClient: HttpClient) {
    this.baseURL = this.setBaseUrl();
  }

  get(endpoint: string) {
    return this.httpClient.get(`${this.baseURL}/api/v1/${endpoint}`);
  }

  getById(endpoint: string, id: number) {
    return this.httpClient.get(`${this.baseURL}/api/v1/${endpoint}/${id}`);
  }

  post(endpoint: string, requestBody: any) {
    return this.httpClient.post(
      `${this.baseURL}/api/v1/${endpoint}`,
      requestBody
    );
  }

  put(endpoint: string, requestBody: any) {
    return this.httpClient.put(
      `${this.baseURL}/api/v1/${endpoint}`,
      requestBody
    );
  }

  delete(endpoint: string, id: number) {
    return this.httpClient.delete(`${this.baseURL}/api/v1/${endpoint}/${id}`);
  }

  private setBaseUrl(): string {
    if (window.location.href.indexOf(environment.dev.uiURL) !== -1)
      return environment.dev.apiURL;
    else if (window.location.href.indexOf(environment.local.uiURL) !== -1)
      return environment.local.apiURL;
    else if (window.location.href.indexOf(environment.prod.uiURL) !== -1)
      return environment.prod.apiURL;
    return '';
  }
}
