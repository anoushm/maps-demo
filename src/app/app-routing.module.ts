import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AzureMapsComponent } from './modules/azure-maps/azure-maps.component';
import { OthersComponent } from './modules/others/others.component';

const routes: Routes = [
  { path: 'azure-maps', component: AzureMapsComponent },
  { path: 'others', component: OthersComponent },
  { path: '', redirectTo: '/azure-maps', pathMatch: 'full' },
  { path: '**', redirectTo: '/azure-maps', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
