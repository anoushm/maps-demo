import { Injectable } from '@angular/core';
import * as atlas from 'azure-maps-control';

@Injectable({
  providedIn: 'root',
})
export class AzureMapsService {
  private subscriptionKey = 'Fnx2qxgvFYMnsLyDzW5THnONPC25rxmiah5amTzkpgc';
  private weatherTileUrl = 'https://atlas.microsoft.com/map/tile?api-version=2.0&tilesetId=microsoft.weather.infrared.main&zoom={z}&x={x}&y={y}&subscription-key=' + this.subscriptionKey;
  private earthquakeFeedUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson'; // past 30 days
  private wildfireUrl = 'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Active_Fires/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson';

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

    let wildfireDatasource = map.sources.getById('wildfire-datasource') as atlas.source.DataSource;

    if (wildfireDatasource == null) {
      wildfireDatasource = new atlas.source.DataSource('wildfire-datasource', {
        //Tell the data source to cluster point data.
        cluster: true,

        //The radius in pixels to cluster points together.
        clusterRadius: 45,

        //The maximium zoom level in which clustering occurs.
        //If you zoom in more than this, all points are rendered as symbols.
        clusterMaxZoom: 15
      });

      map.sources.add(wildfireDatasource);

      wildfireDatasource.importDataFromUrl(this.wildfireUrl);
    }

    //Create a bubble layer for rendering clustered data points.
    var clusterBubbleLayer = this.getWildfireClusterBubbleLayer(wildfireDatasource);

    //Add a click event to the layer so we can zoom in when a user clicks a cluster.
    map.events.add('click', clusterBubbleLayer, (e: atlas.MapMouseEvent): void => this.wildfireClusterClicked(e, wildfireDatasource, map));

    //Add mouse events to change the mouse cursor when hovering over a cluster.
    map.events.add('mouseenter', clusterBubbleLayer, () => {
      map.getCanvasContainer().style.cursor = 'pointer';
    });

    map.events.add('mouseleave', clusterBubbleLayer, () => {
      map.getCanvasContainer().style.cursor = 'grab';
    });

    map.layers.add([
      clusterBubbleLayer,
      //Create a symbol layer to render the count of locations in a cluster.
      this.getWildfireClusterLayer(wildfireDatasource),
      //Create a layer to render the individual locations.
      this.getWildfireBubbleLayer(wildfireDatasource)
    ]);
  }

  private getWildfireBubbleLayer(wildfireDatasource: atlas.source.DataSource): atlas.layer.Layer<atlas.layer.LayerEvents> {
    return new atlas.layer.SymbolLayer(wildfireDatasource, 'wildfire-bubble', {
      filter: ['!', ['has', 'point_count']],
      iconOptions: {
        image: 'marker-red',
        size: 0.75,
      },
      textOptions: {
        textField: ['to-string', ['get', 'IncidentName']],
        textSize: 8,
        anchor: 'top'
      }
    });
  }

  private getWildfireClusterLayer(wildfireDatasource: atlas.source.DataSource): atlas.layer.Layer<atlas.layer.LayerEvents> {
    return new atlas.layer.SymbolLayer(wildfireDatasource, 'wildfire-symbol-cluster', {
      iconOptions: {
        image: 'none' //Hide the icon image.
      },
      textOptions: {
        textField: ['get', 'point_count_abbreviated'],
        offset: [0, 0.4]
      }
    });
  }

  private getWildfireClusterBubbleLayer(wildfireDatasource: atlas.source.DataSource): atlas.layer.BubbleLayer {
    return new atlas.layer.BubbleLayer(wildfireDatasource, 'wildfire-bubble-cluster', {
      //Scale the size of the clustered bubble based on the number of points in the cluster.
      radius: [
        'step',
        ['get', 'point_count'],
        20,
        100, 30,
        750, 40 //If point_count >= 750, radius is 40 pixels.
      ],

      //Change the color of the cluster based on the value on the point_cluster property of the cluster.
      color: [
        'step',
        ['get', 'point_count'],
        'rgba(0,255,0,0.8)',
        100, 'rgba(255,255,0,0.8)',
        750, 'rgba(255,0,0,0.8)' //If the point_count >= 100, color is red.
      ],
      strokeWidth: 0,
      filter: ['has', 'point_count']
    });
  }

  public removeWildfireLayer(map: atlas.Map): void {
    if (map.layers.getLayerById('wildfire-symbol-cluster') != null) {
      map.layers.remove('wildfire-symbol-cluster');
    }

    if (map.layers.getLayerById('wildfire-bubble-cluster') != null) {
      map.layers.remove('wildfire-bubble-cluster');
    }

    if (map.layers.getLayerById('wildfire-bubble') != null) {
      map.layers.remove('wildfire-bubble');
    }
  }

  public removeEarthquakeLayer(map: atlas.Map): void {
    if (map.layers.getLayerById('earthquake-circles') != null) {
      map.layers.remove('earthquake-circles');
    }

    if (map.layers.getLayerById('earthquake-labels') != null) {
      map.layers.remove('earthquake-labels');
    }
  }

  private wildfireClusterClicked(e: atlas.MapMouseEvent, datasource: atlas.source.DataSource, map: atlas.Map): void {
    if (e && e.shapes && e.shapes.length > 0) {
      //Get the clustered point from the event.
      const cluster = e.shapes[0] as atlas.data.Feature<atlas.data.Geometry, any>;

      if (cluster.properties.cluster) {
        //Get the cluster expansion zoom level. This is the zoom level at which the cluster starts to break apart.
        datasource.getClusterExpansionZoom(cluster.properties.cluster_id).then((zoom) => {

          //Update the map camera to be centered over the cluster.
          map.setCamera({
            center: cluster.geometry.coordinates,
            zoom: zoom,
            type: 'ease',
            duration: 200
          });
        });
      }
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
