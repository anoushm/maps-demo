import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'maps-demo';


  public onHero(hero: string): void {
    console.log(hero);
  }
}
