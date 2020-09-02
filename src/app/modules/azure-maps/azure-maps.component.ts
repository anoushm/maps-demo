import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AzureMapsService } from './auzer-maps.service';
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

  constructor(private azureMapsService: AzureMapsService) { }

  public ngOnInit(): void {
    this.initMap();
  }

  private initMap(): void {

    if (this.map == null) {
      this.map = this.azureMapsService.createMap(this.mapContainer.nativeElement,
        [
          { name: 'Facility 1', latitude: -118.270293, longitude: 34.009737 },
          { name: 'Facility 2', latitude: -118.250293, longitude: 34.049737 },
          { name: 'Facility 3', latitude: -118.260293, longitude: 34.029737 },
          { name: 'Facility 4', latitude: -118.240293, longitude: 34.019737 }
        ]);
    }

  }
}
