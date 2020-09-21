import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AzureMapsService } from './auzer-maps.service';
import * as atlas from 'azure-maps-control';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'azure-maps-component',
  templateUrl: './azure-maps.component.html',
  styleUrls: ['./azure-maps.component.css']
})
export class AzureMapsComponent implements OnInit {
  private map: atlas.Map = null;

  public isWeatherOn = false;
  public isEarthquakeOn = false;
  public isWildfireOn = false;
  public isLoading = false;
  public mapToolsForm: FormGroup = new FormGroup({
    earthquakeCheckbox: new FormControl({ value: this.isEarthquakeOn, disabled: true }),
    wildfireCheckbox: new FormControl({ value: this.isWildfireOn, disabled: true }),
    weatherCheckbox: new FormControl({ value: this.isWeatherOn, disabled: true })
 });

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

  public onWildfire(): void {
    this.isWildfireOn = !this.isWildfireOn;
    this.isLoading = true;

    if (this.isWildfireOn) {
      this.azureMapsService.addWildfireLayer(this.map).then(() => {
        this.isLoading = false;
      }, (error) => {
        this.isLoading = false;
        console.error(`An error occred during the Wildfire layer insert, ${error}`)
      });
    } else {
      this.azureMapsService.removeWildfireLayer(this.map)
        .then(() => {
          this.isLoading = false;
        }, (error) => {
          this.isLoading = false;
          console.error(`An error occred during the Wildfire layer remove, ${error}`)
        });
    }
  }

  public onWeather(): void {
    this.isWeatherOn = !this.isWeatherOn;

    if (this.isWeatherOn) {
      this.azureMapsService.addWeatherLayer(this.map);
    } else {
      this.azureMapsService.removeWeatherLayer(this.map);
    }
  }

  public onEarthquake(): void {
    this.isEarthquakeOn = !this.isEarthquakeOn;
    this.isLoading = true;

    if (this.isEarthquakeOn) {
      this.azureMapsService.addEarthquakeLayer(this.map).then(() => {
        this.isLoading = false;
      }, (error) => {
        this.isLoading = false;
        console.error(`An error occred during the Earthquake layer insert, ${error}`)
      });
    } else {
      this.azureMapsService.removeEarthquakeLayer(this.map).then(() => {
        this.isLoading = false;
      }, (error) => {
        this.isLoading = false;
        console.error(`An error occred during the Earthquake layer remove, ${error}`)
      });
    }
  }
}
