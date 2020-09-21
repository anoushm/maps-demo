import { Injectable } from '@angular/core';
import * as atlas from 'azure-maps-control';

@Injectable({
  providedIn: 'root',
})
export class EarthquakeLayerService {
  private earthquakeFeedUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'; // past 30 days
  private earthquakeCirclesId = 'earthquake-circles';
  private earthquakeLabelsId = 'earthquake-labels';
  private earthquakeDatasource = 'earthquake-datasource';

  public async addEarthquakeLayer(map: atlas.Map): Promise<void> {
    //Create a data source and add it to the map.
    let earthquakeDatasource = map.sources.getById(this.earthquakeDatasource) as atlas.source.DataSource;

    if (earthquakeDatasource == null) {
      earthquakeDatasource = new atlas.source.DataSource(this.earthquakeDatasource);
      map.sources.add(earthquakeDatasource);

      //Load the earthquake data.
      await earthquakeDatasource.importDataFromUrl(this.earthquakeFeedUrl);
    }

    map.layers.add(this.getEarthquakeLayers(map, earthquakeDatasource));
  }

  public async removeEarthquakeLayer(map: atlas.Map): Promise<void> {
    if (map.layers.getLayerById(this.earthquakeCirclesId) != null) {
      map.layers.remove(this.earthquakeCirclesId);
    }

    if (map.layers.getLayerById(this.earthquakeLabelsId) != null) {
      map.layers.remove(this.earthquakeLabelsId);
    }

    Promise.resolve();
  }

  private getEarthquakeLayers(map: atlas.Map, datasource: atlas.source.Source): atlas.layer.Layer[] {
    //Create a layer that defines how to render the shapes in the data source and add it to the map.
    const earthquakeLayer = new atlas.layer.BubbleLayer(datasource, this.earthquakeCirclesId, {
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
    const earthqukeLableLayer = new atlas.layer.SymbolLayer(datasource, this.earthquakeLabelsId, {
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
}
