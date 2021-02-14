import { environment } from '../../environments/environment.prod';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { HttpService } from '../http.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  map : any;
  style = 'mapbox://styles/mapbox/streets-v11';
  lat = 47;
  lng = 2;
  trendSearch : any;
  tweetsMarker : any = {
    "type": "FeatureCollection",
    "features": [

    ]
  }
  trends : any = []

  constructor(private api: HttpService) { }

  getTweets(trend : any, e : any){
    this.api.socketMap.emit("stopMap");
    this.api.resetSocketConnectionMap()
    this.tweetsMarker = {
      "type": "FeatureCollection",
      "features": [
  
      ]
    }
    this.map.getSource('tweets').setData(this.tweetsMarker);
    console.log("called")
      console.log("get tweets for" + trend + "activated")
      this.api.socketMap.emit('map', trend);
      console.log('tweet')
      this.api.socketMap.on('tweet', (data: any) => {
        this.tweetsMarker.features.push({
          "type": "Feature",
          "geometry": {
              "type": "Point",
              "coordinates": data.place.bounding_box.coordinates[0][0]
          },
          "properties": {
              "id": data.id,
          }
      });
      console.log(data);
        console.log(data.place.country_code);
        console.log(data.place.bounding_box.coordinates[0][0])
        this.map.getSource('tweets').setData(this.tweetsMarker);

      });
    
  }

  ngOnDestroy(){
    console.log("OnDestroy called");
    this.api.socketMap.emit("stopMap");
    this.api.socketMap.close();
  }

  showTrendHistory(trend : any, day : any, month : any, year : any){
    trend = 'trump';
    day = '1';
    month = '11';
    year = '2020';
    var params : string = trend + ';' + day + ';' + month + ';' + year;
    this.api.getTrendsMapHistory(params)
      .subscribe(
        (tweets : any) => {
          console.log(tweets);
          var tempTweets: any[] = []
          tweets.forEach(myFunction); 
          function myFunction(item : any) 
          { 
            tempTweets.push(item)

          }
          for (var i = 0; i< tempTweets.length; i++){
            if(tempTweets[i].place !== null){
              this.tweetsMarker.features.push({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": tempTweets[i].place.bounding_box.coordinates[0][0]
                },
                "properties": {
                    "id": tempTweets[i].id,
                }
              });
            }
          }
        }
      )
  }

  ngOnInit() {
    
    this.api.resetSocketConnectionMap();
    this.getTwitterTrendsMap('world')
    this.map = new mapboxgl.Map({
      accessToken : environment.mapbox.accessToken,
      container: 'map',
      style: this.style,
      zoom: 1.2,
      center: [this.lng, this.lat]
    });
    this.map.addControl(new mapboxgl.NavigationControl());

    this.map.on('load',  () => {

      this.map.addSource('tweets', {
      type: 'geojson',
      data: this.tweetsMarker,
      cluster: true,
      clusterMaxZoom: 14, // Max zoom to cluster points on
      clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
      });
       
      this.map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'tweets',
        filter: ['has', 'point_count'],
        paint: {

          'circle-color': ['interpolate',['exponential', 0.8],['get', 'point_count'],2,'#eee695',1000,'#e2714b'],
          'circle-radius': {property: "point_count",type: 'exponential',stops: [[0, 15],[100, 50]]},
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff',
          'circle-opacity' : 0.75
        }
      });
       
      this.map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'tweets',
      filter: ['has', 'point_count'],
      layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      'text-size': 12
      }
      });
       
      this.map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'tweets',
      filter: ['!', ['has', 'point_count']],
      paint: {
      'circle-color': '#11b4da',
      'circle-radius': 10,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff',
      'circle-opacity' : 0.75
      }
      });

      this.map.on('mouseenter', 'clusters',  () => {
        this.map.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'clusters',  () => {
        this.map.getCanvas().style.cursor = '';
      });
      });
  }

  getTwitterTrendsMap(location : any): void {
    this.api.resetSocketConnectionMap();
    this.trends = []
    this.api.getTrendsMap(location)
      .subscribe(
        (trends : any) => {
          var tempTrends: any[] = []
          trends[0].trends.forEach(myFunction); 
          function myFunction(item : any) 
          { 
              tempTrends.push(item.name)
          }
          this.trends = tempTrends
        }
      )
    }
}
