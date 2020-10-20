import { Injectable } from '@angular/core';
import { MapLayerEnum } from './models/map-layer.enum';
import { MapLayer } from './models/map-layer';
import { WildfireLayerService } from './wildfire-layer.service';
import { EarthquakeLayerService } from './earthquake-layer.service';
import { WeatherLayerService } from './weather-layer.service';

@Injectable({
  providedIn: 'root',
})
export class MapLayerFactoryService {

  constructor(
    private wildfireLayerService: WildfireLayerService,
    private earthquakeLayerService: EarthquakeLayerService,
    private weatherLayerService: WeatherLayerService) { }

  public getLayer(layerType: MapLayerEnum): MapLayer {
    switch (layerType) {
      case MapLayerEnum.WildFire:
        return this.wildfireLayerService;
      case MapLayerEnum.Earthquake:
        return this.earthquakeLayerService;
      case MapLayerEnum.Weather:
        return this.weatherLayerService;
      default:
        console.error('MapLayerFactoryService.getLayer - unknown map layer type.');
        return null;
    }
  }
}
