import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-stop-training',
  template: `<h1 mat-dialog-title>Você tem certeza que deseja parar?</h1>
            <mat-dialog-content>
              <p>Você executou {{ passedData.progress }}% do tempo</p>
            </mat-dialog-content>
            <mat-dialog-actions>
              <button mat-button [mat-dialog-close]="true">Sim</button>
              <button mat-button [mat-dialog-close]="false">Não</button>
            </mat-dialog-actions>`
})
export class StopTrainingComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public passedData: any) {}
}
