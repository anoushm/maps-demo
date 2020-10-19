import { Injectable } from '@angular/core';
import * as atlas from 'azure-maps-control';

@Injectable({
  providedIn: 'root',
})
export class WeatherLayerService {
  private subscriptionKey = 'Fnx2qxgvFYMnsLyDzW5THnONPC25rxmiah5amTzkpgc';
  private weatherTileUrl = 'https://atlas.microsoft.com/map/tile?api-version=2.0&tilesetId=microsoft.weather.infrared.main&zoom={z}&x={x}&y={y}&subscription-key=' + this.subscriptionKey;
  private weatherLayerId = 'weather-layer';


  public async add(map: atlas.Map): Promise<void> {
    map.layers.add(this.weatherTileLayer);
  }

  public async remove(map: atlas.Map): Promise<void> {
    if (map.layers.getLayerById(this.weatherLayerId) != null) {
      map.layers.remove(this.weatherLayerId);
    }
  }

  private get weatherTileLayer(): atlas.layer.TileLayer {

    const tileLayer = new atlas.layer.TileLayer({
      tileUrl: this.weatherTileUrl,
      opacity: 0.9,
      tileSize: 256
    }, this.weatherLayerId);

    return tileLayer;
  }
}
