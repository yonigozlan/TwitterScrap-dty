import { Component, OnInit } from '@angular/core';
import { HttpService } from '../http.service';

import * as $ from 'jquery';

@Component({
  selector: 'app-tweets',
  templateUrl: './tweets.component.html',
  styleUrls: ['./tweets.component.scss']
})
export class TweetsComponent implements OnInit {
  trends : any;
  trend : any;
  tweetsTrend :any;
  selectedCountry : undefined;
  checked : any
  trendsName : any;
  currentTrend : any;

  constructor(private api: HttpService) { 
    
  }

  uncheckAllOther(checkedTrend : string){
    this.currentTrend = checkedTrend;
    console.log("uncheckAllOther called")
    console.log(this.trendsName);
    for(let i in this.trendsName){
      var trend = this.trendsName[i];
      if (trend !== checkedTrend){
        console.log("uncheckAllOther called " + this.trendsName[trend])
        this.checked[trend]= false;
        
        if(this.api.sockets[trend] !== undefined){
          this.api.sockets[trend].emit("stop", trend);
        //   console.log("closed socket")
        //   this.api.sockets[trend].close();
        }
      }
    }
  }

  ngOnDestroy(): void{
    console.log("OnDestroy called");
    for(let i in this.trendsName){
      var trend = this.trendsName[i];
      console.log("uncheckAllOther called " + this.trendsName[trend])
      this.checked[trend]= false;
      
      if(this.api.sockets[trend] !== undefined){
        this.api.sockets[trend].emit("stop", trend);
      //   console.log("closed socket")
      //   this.api.sockets[trend].close();
      }
    }
  }
  
  selectChangeHandler (event: any) {
    //update the ui
    this.selectedCountry = event.target.value;
  }

  ngOnInit() {
    this.tweetsTrend = {};
    this.checked = {};
    // this.getTwitterTrends();
    
  }

  showCountryTrends(selectedCountry : any){
    console.log("SCT called");
    console.log(selectedCountry);
    this.getTwitterTrendsCountry(selectedCountry);
  }

  getTwitterTrend(trend : string, e : any): void {
    console.log("called");
    this.api.resetSocketConnection(trend);
    if (e.target.checked){
    this.tweetsTrend = [];
    console.log("trend = " + trend)
    this.api.sockets[trend].emit("trend", trend);
    this.api.sockets[trend].on('tweet', (data: any) => {
      var date = new Date(data.created_at)
      data.created_at = date.toDateString(); 
      this.tweetsTrend.unshift(data);
      console.log(data);
    });
   }
   else{
    this.api.sockets[trend].emit("stop", trend);

  }
  }

   getTwitterTrendCB(trend : string, e : any): void {
    this.api.resetSocketConnection(trend);
    if (e.target.checked){
      this.uncheckAllOther(trend);
      console.log("called");
      // this.tweetsTrend = [];
      console.log("trend = " + trend);
      this.api.sockets[trend].emit("trend", trend);
      this.api.sockets[trend].on('tweet', (data: any) => {
        var date = new Date(data.created_at)
        data.created_at = date.toDateString();
        if (trend === this.currentTrend){
          if (this.tweetsTrend[trend] === undefined){
          console.log("test1")
          this.tweetsTrend[trend] = [data]
          }
          else{
            console.log("test1")
            this.tweetsTrend[trend].unshift(data);
            console.log(data);
          }
        }
      });
    }
    else{
      this.api.sockets[trend].emit("stop", trend);

    }

   }
   
  // getTwitterTrends(): void {
  //   this.api.getTrends()
  //     .subscribe(
  //       trends => {
  //         this.trends = trends[0].trends;
  //         console.log(trends.length);
  //         console.log(typeof(trends));
  //         this.trends.forEach(myFunction); 
  //         function myFunction(item : any) 
  //         { 
  //             console.log(item.name);
              
  //         }

  //       }
  //     )
  //  }

   getTwitterTrendsCountry(selectedCountry : any): void {
    this.api.getTrends(selectedCountry)
      .subscribe(
        trends => {
          this.trends = trends[0].trends;
          console.log(trends.length);
          console.log(typeof(trends));
          var trendsName : any = [];
          this.trends.forEach(myFunction); 
          function myFunction(item : any) 
          { 
              trendsName.unshift(item.name);
              console.log("name : "+ item.name);
              
          }
          this.trendsName = trendsName;
          console.log(trendsName)
        }
      )
   }
  
   

}
