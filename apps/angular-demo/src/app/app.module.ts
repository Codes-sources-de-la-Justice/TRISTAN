import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AngularTristanModule } from '@codes-sources-de-la-justice/angular-tristan';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AngularTristanModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
