import { Injectable } from '@angular/core';
import * as atlas from 'azure-maps-control';
import { MapLayer } from './models/map-layer';

@Injectable({
  providedIn: 'root',
})
export class WildfireLayerService implements MapLayer {
  private wildfireUrl = 'https://services3.arcgis.com/T4QMspbfLg3qTGWY/arcgis/rest/services/Active_Fires/FeatureServer/0/query?where=1%3D1&outFields=*&outSR=4326&f=geojson';
  private wildfireDatasourceId = 'wildfire-datasource';
  private wildfireSymbolClusterId = 'wildfire-symbol-cluster';
  private wildfireBubbleClusterId = 'wildfire-bubble-cluster';
  private wildfireDubbleId = 'wildfire-bubble';

  public async add(map: atlas.Map): Promise<void> {

    let wildfireDatasource = map.sources.getById(this.wildfireDatasourceId) as atlas.source.DataSource;

    if (wildfireDatasource == null) {
      wildfireDatasource = new atlas.source.DataSource(this.wildfireDatasourceId, {
        //Tell the data source to cluster point data.
        cluster: true,

        //The radius in pixels to cluster points together.
        clusterRadius: 45,

        //The maximium zoom level in which clustering occurs.
        //If you zoom in more than this, all points are rendered as symbols.
        clusterMaxZoom: 15
      });

      map.sources.add(wildfireDatasource);

      await wildfireDatasource.importDataFromUrl(this.wildfireUrl);
    }

    //Create a bubble layer for rendering clustered data points.
    var clusterBubbleLayer = this.getWildfireClusterBubbleLayer(wildfireDatasource);

    //Add a click event to the layer so we can zoom in when a user clicks a cluster.
    map.events.add('click', clusterBubbleLayer,
      (e: atlas.MapMouseEvent): void => this.wildfireClusterClicked(e, wildfireDatasource, map));

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

  public async remove(map: atlas.Map): Promise<void> {
    if (map.layers.getLayerById(this.wildfireSymbolClusterId) != null) {
      map.layers.remove(this.wildfireSymbolClusterId);
    }

    if (map.layers.getLayerById(this.wildfireBubbleClusterId) != null) {
      map.layers.remove(this.wildfireBubbleClusterId);
    }

    if (map.layers.getLayerById(this.wildfireDubbleId) != null) {
      map.layers.remove(this.wildfireDubbleId);
    }

    Promise.resolve();
  }

  private getWildfireBubbleLayer(wildfireDatasource: atlas.source.DataSource): atlas.layer.Layer<atlas.layer.LayerEvents> {
    return new atlas.layer.SymbolLayer(wildfireDatasource, this.wildfireDubbleId, {
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
    return new atlas.layer.SymbolLayer(wildfireDatasource, this.wildfireSymbolClusterId, {
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
    return new atlas.layer.BubbleLayer(wildfireDatasource, this.wildfireBubbleClusterId, {
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
}
