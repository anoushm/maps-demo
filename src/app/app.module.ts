import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AzureMapsComponent } from './modules/azure-maps/azure-maps.component';
import { OthersComponent } from './modules/others/others.component';

@NgModule({
  declarations: [
    AppComponent,
    AzureMapsComponent,
    OthersComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
