import { ipcRenderer } from "electron";
import { Injectable } from "@angular/core";
import { Twitter } from "../classes/publish/twitter";
import { MatDialog } from "@angular/material";
import { PublishAssistentComponent } from "../dialogs/publish-assistent/publish-assistent.component";
import { ECanvas } from "../classes/fabric/eCanvas";

@Injectable({
  providedIn: 'root'
})
export class PublishService {
  twitter: Twitter;

  constructor(
    public dialog: MatDialog,
  ) { }

  /**
   * Sendet Event vom Renderer- zum Mainprozess
   */
  send() {
    ipcRenderer.send('fb-authenticate');

  }



}
