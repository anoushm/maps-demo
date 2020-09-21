import { Injectable } from '@angular/core';
import * as atlas from 'azure-maps-control';
import { WildfireLayerService } from './wildfire-layer.service';

@Injectable({
  providedIn: 'root',
})
export class AzureMapsService {
  private subscriptionKey = 'Fnx2qxgvFYMnsLyDzW5THnONPC25rxmiah5amTzkpgc';
  private weatherTileUrl = 'https://atlas.microsoft.com/map/tile?api-version=2.0&tilesetId=microsoft.weather.infrared.main&zoom={z}&x={x}&y={y}&subscription-key=' + this.subscriptionKey;
  private earthquakeFeedUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'; // past 30 days

  constructor(private wildfireLayerServuce: WildfireLayerService) { }

  public createMap(htmlElement: HTMLElement, markes: any[]): atlas.Map {
    const map = new atlas.Map(htmlElement, {
      center: [-118.270293, 34.039737],
      zoom: 4,
      anguage: 'en-US',
      authOptions: {
        authType: atlas.AuthenticationType.subscriptionKey,
        subscriptionKey: this.subscriptionKey
      }
    });

    map.events.add('ready', () => {
      console.log('AZURE Maps is loaded.');

      this.addMarkes(map, markes);
      this.addNormalPopupmarker(map);
      map.controls.add(this.mapControls, { position: atlas.ControlPosition.TopRight });
    });

    return map;
  }

  public addWeatherLayer(map: atlas.Map): void {
    map.layers.add(this.weatherTileLayer);
  }

  public removeWeatherLayer(map: atlas.Map): void {
    if (map.layers.getLayerById('weather-layer') != null) {
      map.layers.remove('weather-layer');
    }
  }

  public addEarthquakeLayer(map: atlas.Map): void {
    //Create a data source and add it to the map.
    let earthquakeDatasource = map.sources.getById('earthquake-datasource') as atlas.source.DataSource;

    if (earthquakeDatasource == null) {
      earthquakeDatasource = new atlas.source.DataSource('earthquake-datasource');
      map.sources.add(earthquakeDatasource);

      //Load the earthquake data.
      earthquakeDatasource.importDataFromUrl(this.earthquakeFeedUrl);
    }

    map.layers.add(this.getEarthquakeLayers(map, earthquakeDatasource));
  }

  private getEarthquakeLayers(map: atlas.Map, datasource: atlas.source.Source): atlas.layer.Layer[] {
    //Create a layer that defines how to render the shapes in the data source and add it to the map.
    const earthquakeLayer = new atlas.layer.BubbleLayer(datasource, 'earthquake-circles', {
      //Bubbles are made semi-transparent.
      opacity: 0.75,

      //Color of each bubble based on the value of "mag" property using a color gradient of green, yellow, orange, and red.
      color: [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        0, 'green',
        5, 'yellow',
        6, 'orange',
        7, 'red'
      ],

      /*
       * Radius for each data point scaled based on the value of "mag" property.
       * When "mag" = 0, radius will be 2 pixels.
       * When "mag" = 8, radius will be 40 pixels.
       * All other "mag" values will be a linear interpolation between these values.
       */
      radius: [
        'interpolate',
        ['linear'],
        ['get', 'mag'],
        0, 2,
        8, 40
      ]
    });

    //Create a symbol layer using the same data source to render the magnitude as text above each bubble and add it to the map.
    const earthqukeLableLayer = new atlas.layer.SymbolLayer(datasource, 'earthquake-labels', {
      iconOptions: {
        //Hide the icon image.
        image: 'none'
      },
      textOptions: {
        //An expression is used to concerte the "mag" property value into a string and appends the letter "m" to the end of it.
        textField: ['concat', ['to-string', ['get', 'mag']], 'm'],
        textSize: 12
      }
    });

    return [earthquakeLayer, earthqukeLableLayer];
  }

  public addWildfireLayer(map: atlas.Map): void {
    this.wildfireLayerServuce.addWildfireLayer(map);
  }

  public removeWildfireLayer(map: atlas.Map): void {
    this.wildfireLayerServuce.removeWildfireLayer(map);
  }

  public removeEarthquakeLayer(map: atlas.Map): void {
    if (map.layers.getLayerById('earthquake-circles') != null) {
      map.layers.remove('earthquake-circles');
    }

    if (map.layers.getLayerById('earthquake-labels') != null) {
      map.layers.remove('earthquake-labels');
    }
  }

  private get weatherTileLayer(): atlas.layer.TileLayer {

    const tileLayer = new atlas.layer.TileLayer({
      tileUrl: this.weatherTileUrl,
      opacity: 0.9,
      tileSize: 256
    }, 'weather-layer');

    return tileLayer;
  }

  private get mapControls(): atlas.Control[] {
    const controls: atlas.Control[] = [
      new atlas.control.ZoomControl(),
      new atlas.control.PitchControl(),
      new atlas.control.CompassControl(),
      new atlas.control.StyleControl(),
      new atlas.control.TrafficControl({
        incidents: true
      }),
      new atlas.control.TrafficLegendControl()
    ];

    return controls;
  }

  private addNormalPopupmarker(map: atlas.Map): void {
    const popupMarker = new atlas.HtmlMarker({
      color: 'DodgerBlue',
      text: '10',
      position: [-118.270293, 34.039737],
      popup: new atlas.Popup({
        content: '<div style="padding:10px">Hello World</div>',
        pixelOffset: [0, -30]
      })
    });

    map.markers.add(popupMarker);

    map.events.add('click', popupMarker, () => {
      popupMarker.togglePopup();
    });
  }

  private addMarkes(map: atlas.Map, markers: any[]): void {
    markers.forEach(markerPosition => {
      const marker = new atlas.HtmlMarker({
        color: 'DodgerBlue',
        htmlContent: `<img width="52" height="52" style="opacity:0.5;filter:alpha(opacity=40);" src="https://t4.rbxcdn.com/bcc9cf39d6b6463e3d7261cbb459696b"><div style="padding:10px">${markerPosition.name}</div>`,
        position: [markerPosition.latitude, markerPosition.longitude],
        popup: new atlas.Popup({
          content: `<div style="padding:10px;backgroud-color:bule">${markerPosition.name}</div>`,
          pixelOffset: [0, -30]
        })
      });

      map.markers.add(marker);

      map.events.add('click', marker, () => {
        marker.togglePopup();
      });
    });
  }
}
