import { Component, Input, OnInit } from '@angular/core';

export interface Columna {
  clave: string;
  titulo: string;
}

@Component({
  selector: 'app-tabla',
  templateUrl: './tabla.component.html',
  styleUrls: ['./tabla.component.css']
})
export class TablaComponent {
  @Input() columnas: Columna[] = [];
  @Input() datos: any[] = [];

  get listaClaves() {
    return this.columnas?.map(columna => columna.clave)
  }
}
