import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ModesPageRoutingModule } from './modes-routing.module';

import { ModesPage } from './modes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ModesPageRoutingModule
  ],
  declarations: [ModesPage]
})
export class ModesPageModule {}
