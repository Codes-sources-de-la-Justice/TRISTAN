import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
// @ts-ignore
import { TristanModule } from 'tristan';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    TristanModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
