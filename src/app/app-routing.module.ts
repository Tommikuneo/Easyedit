import { EditorComponent } from './components/home/editor.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TemplateDesignerComponent } from './components/template-designer/template-designer.component';

const routes: Routes = [
  {
    path: '',
    component: EditorComponent
  },

  {
    path: 'editor',
    component: EditorComponent,
    children: [
      { path: ':filePath', component: EditorComponent }
    ]
  },

  {
    path: 'designer',
    component: TemplateDesignerComponent,
    children: [
      { path: ':filePath', component: TemplateDesignerComponent }
    ]
  }

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
