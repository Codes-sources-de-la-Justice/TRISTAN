
        import { NgModule } from '@angular/core';
        import { CommonModule } from '@angular/common';
        import { SummaryComponent } from './summary.component';
        import { SchemaComponent } from './schema.component';

        @NgModule({
          imports: [
            CommonModule
          ],
          declarations: [
            SummaryComponent,
            SchemaComponent
          ],
          exports: [
            SummaryComponent,
            SchemaComponent
          ],
          providers: []
        })
        export class AngularTristanModule { }
        
