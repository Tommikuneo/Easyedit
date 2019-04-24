import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule, MatCheckboxModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule } from '@angular/material';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// NG Translate
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
// import { TemplateDesignerComponent } from './components/template-designer/template-designer.component';
import { ColorPickerModule } from 'ngx-color-picker';
import { ToastrModule } from 'ngx-toastr';
import 'reflect-metadata';
import '../polyfills';
import { AppRoutingModule } from './app-routing.module';
import { EditorComponent } from './components/home/editor.component';
import { TemplateDesignerComponent } from './components/template-designer/template-designer.component';
import { ApiKeyInputDialogComponent } from './dialogs/api-key-input-dialog.component';
import { PublishAssistentComponent } from './dialogs/publish-assistent/publish-assistent.component';
import { ViewChooserDialogComponent } from './dialogs/view-chooser-dialog.component';
import { DropfileDirective } from './directives/dropfile.directive';
import { WebviewDirective } from './directives/webview.directive';
import { ElectronService } from './providers/electron.service';
import { FabricDesignerService } from './providers/fabric.designer.service';
import { FabricEditorService } from './providers/fabric.editor.service';
import { FontService } from './providers/font.service';
import { ImageService } from './providers/image.service';
import { ObjectControlService } from './providers/object-control.service';
import { PublishService } from './providers/publish.service';
import { StorageService } from './providers/storage.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    EditorComponent,
    WebviewDirective,
    DropfileDirective,
    ViewChooserDialogComponent,
    PublishAssistentComponent,
    ApiKeyInputDialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    ColorPickerModule,
    BrowserAnimationsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatSelectModule,
    ReactiveFormsModule,
    ToastrModule.forRoot(),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [
    ElectronService,
    StorageService,
    FabricDesignerService,
    FabricEditorService,
    ImageService,
    FontService,
    ObjectControlService,
    PublishService,
  ],
  entryComponents: [ViewChooserDialogComponent, PublishAssistentComponent, ApiKeyInputDialogComponent]
})
export class AppModule { }
