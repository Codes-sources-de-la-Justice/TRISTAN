import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import SummaryComponent from './summary'

const components = [SummaryComponent];

@NgModule({
  imports: [CommonModule],
  declarations: components,
  exports: components,
  schemas: [NO_ERRORS_SCHEMA]
})
export class TristanModule {}
