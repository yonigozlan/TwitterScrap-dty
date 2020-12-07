import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { map, catchError } from 'rxjs/operators';
import {io } from 'socket.io-client';



@Injectable({
  providedIn: 'root'
})
export class HttpService {

  sockets: any;
  socketMap : any;
  currrentTrend : any;

  constructor(private http: HttpClient) { 
    this.sockets = {};
    
  }

  resetSocketConnection(trend : string) {
    if (this.sockets[trend] !== undefined){
      this.sockets[trend].close();
      console.log("closed socket" + trend);
    }
    // this.sockets[trend] =  io();
    this.sockets[trend] =  io(environment.socketUrl);
    this.currrentTrend = trend;
  }

  resetSocketConnectionMap() {
    if (this.socketMap !== undefined){
      this.socketMap.close();
      console.log("closed socketMap");
    }
    console.log('reset connection map called')
    this.socketMap =  io(environment.socketUrl);
    // this.socketMap =  io();

  }

  private async request(method: string, url: string, data?: any) {
    // const token = await this.oktaAuth.getAccessToken();

    const result = this.http.request(method, url, {
      body: data,
      responseType: 'json',
      observe: 'body',
      headers: {
      }
    });
    return new Promise((resolve, reject) => {
      result.subscribe(resolve, reject);
    });
  }

  // getEvents() {
  //   // return this.request('GET', `event`);
  //   // return this.request('GET', `${environment.serverUrl}/event`);
  //   return this.request('GET', `event`);
    
  // }

  // createEvent(event: any) {
  //   // return this.request('POST', `${environment.serverUrl}/event`, event);
  //   return this.request('POST', `event`, event);
  // }

  // updateEvent(event: { id: any; }) {
  //   // return this.request('PUT', `${environment.serverUrl}/event/${event.id}`, event);
  //   return this.request('PUT', `event/${event.id}`, event);
  // }

  // deleteEvent(event: { id: any; }) {
  //   // return this.request('DELETE', `${environment.serverUrl}/event/${event.id}`);
  //   return this.request('DELETE', `event/${event.id}`);
  // }

  getTrend(trend : string) {
  
    console.log(`live_feed?`+ trend);
    return this.http
    .get<any[]>(`${environment.serverUrl}/trends`)
    .pipe(map(data => data));
    // return this.http
    // .get<any[]>(`trends`)
    // .pipe(map(data => data));
 
  }
  getTrends(selectedCountry : string) {
    console.log("SC in service " + selectedCountry)
    console.log(`trends`);
    return this.http
    .get<any[]>(`${environment.serverUrl}/trends?`+ selectedCountry)
    .pipe(map(data => data));
    return this.http
    .get<any[]>(`trends?`+ selectedCountry)
    .pipe(map(data => data));
 
  }

  getTrendsMap(location : any) {
    return this.http
    .get<any[]>(`${environment.serverUrl}/trends?` + location)
    .pipe(map(data => data));
    return this.http
    .get<any[]>(`trends?` + location)
    .pipe(map(data => data));
 
  }
  getTrendsMapHistory(params : any) {
    return this.http
    .get<any[]>(`${environment.serverUrl}/maphistory?` + params)
    .pipe(map(data => data));
    return this.http
    .get<any[]>(`maphistory?` + params)
    .pipe(map(data => data));
 
  }
 
}
