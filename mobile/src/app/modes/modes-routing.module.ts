import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ModesPage } from './modes.page';

const routes: Routes = [
  {
    path: '',
    component: ModesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ModesPageRoutingModule {}
