import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as atlas from 'azure-maps-control';

@Component({
  selector: 'azure-maps-component',
  templateUrl: './azure-maps.component.html',
  styleUrls: ['./azure-maps.component.css']
})
export class AzureMapsComponent implements OnInit {
  private map: atlas.Map = null;

  @ViewChild('mapContainer', { static: true })
  public mapContainer: ElementRef;

  public ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {
    if (this.map == null) {
      this.map = new atlas.Map(this.mapContainer.nativeElement, {
        center: [-118.270293, 34.039737],
        zoom: 14,
        anguage: 'en-US',
        authOptions: {
          authType: atlas.AuthenticationType.subscriptionKey,
          subscriptionKey: 'Fnx2qxgvFYMnsLyDzW5THnONPC25rxmiah5amTzkpgc'
        }
      });

      this.map.events.add('ready', () => {
        console.log('AZURE Maps is loaded.');

        const popupMarker = new atlas.HtmlMarker({
          color: 'DodgerBlue',
          text: '10',
          position: [-118.270293, 34.039737],
          popup: new atlas.Popup({
            content: '<div style="padding:10px">Hello World</div>',
            pixelOffset: [0, -30]
          })
        });

        this.map.markers.add(popupMarker);

        this.map.events.add('click', popupMarker, () => {
          popupMarker.togglePopup();
        });
      });
    }
  }
}
