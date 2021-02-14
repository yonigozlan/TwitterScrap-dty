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

  }

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
    // return this.http
    // .get<any[]>(`trends?`+ selectedCountry)
    // .pipe(map(data => data));
 
  }

  getTrendsMap(location : any) {
    return this.http
    .get<any[]>(`${environment.serverUrl}/trends?` + location)
    .pipe(map(data => data));
    // return this.http
    // .get<any[]>(`trends?` + location)
    // .pipe(map(data => data));
 
  }
  getTrendsMapHistory(params : any) {
    return this.http
    .get<any[]>(`${environment.serverUrl}/maphistory?` + params)
    .pipe(map(data => data));
    // return this.http
    // .get<any[]>(`maphistory?` + params)
    // .pipe(map(data => data));
  }
 
}
