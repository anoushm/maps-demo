import { Injectable } from '@angular/core';
import * as atlas from 'azure-maps-control';
import { WildfireLayerService } from './wildfire-layer.service';
import { EarthquakeLayerService } from './earthquake-layer.service';
import { WeatherLayerService } from './weather-layer.service';

@Injectable({
  providedIn: 'root',
})
export class AzureMapsService {
  private subscriptionKey = 'Fnx2qxgvFYMnsLyDzW5THnONPC25rxmiah5amTzkpgc';

  constructor(private wildfireLayerServuce: WildfireLayerService,
    private earthquakeLayerService: EarthquakeLayerService,
    private weatherLayerService: WeatherLayerService) { }

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

  public async addWeatherLayer(map: atlas.Map): Promise<void> {
    return this.weatherLayerService.add(map);
  }

  public async removeWeatherLayer(map: atlas.Map): Promise<void> {
    return this.weatherLayerService.remove(map);
  }

  public async addEarthquakeLayer(map: atlas.Map): Promise<void> {
    return this.earthquakeLayerService.add(map);
  }

  public async removeEarthquakeLayer(map: atlas.Map): Promise<void> {
    return this.earthquakeLayerService.remove(map);
  }

  public async addWildfireLayer(map: atlas.Map): Promise<void> {
    this.wildfireLayerServuce.add(map);
  }

  public async removeWildfireLayer(map: atlas.Map): Promise<void> {
    this.wildfireLayerServuce.remove(map);
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
