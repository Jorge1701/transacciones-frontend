import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Columna } from './componentes/tabla/tabla.component';
import { Filtros } from './modelo/filtros';
import { Transaccion } from './modelo/transaccion';
import { ApiService } from './servicios/api.service';

interface OpcionAgrupacion {
  clave: string;
  valor: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  balance: number = 0;

  opcionAgrupacionSeleccionada: string = 'descripcion';
  opcionesAgrupacion: OpcionAgrupacion[] = [
    { clave: 'descripcion', valor: 'Descripción' },
    { clave: 'id', valor: 'Transacción' },
    { clave: 'nro_doc', valor: 'Nro. Documento' },
    { clave: 'asunto', valor: 'Asunto' }
  ];

  formulario = new FormGroup({
    desde: new FormControl(),
    hasta: new FormControl(),
    categoria: new FormControl(this.opcionAgrupacionSeleccionada)
  });

  filtros: Filtros = {
    desde: null,
    hasta: null
  }

  columnasTransacciones: Columna[] = [
    { clave: 'fecha', titulo: 'Fecha' },
    { clave: 'descripcion', titulo: 'Descripción' },
    { clave: 'nro_doc', titulo: 'Nro. Documento' },
    { clave: 'asunto', titulo: 'Asunto' },
    { clave: 'debito', titulo: 'Débito' },
    { clave: 'credito', titulo: 'Crédito' }
  ];
  transacciones: Transaccion[] = [];

  constructor(
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.api.obtenerBalanceActual().subscribe(balance => {
      this.balance = balance;
    });

    this.formulario.statusChanges.subscribe((valido) => {
      if (valido) {
        this.recargarFiltros();
      }
    });

    this.formulario.get('desde')?.setValue(this.fechaInicial);
  }

  private recargarFiltros(): void {
    this.filtros = this.formulario.value;
    if (this.filtros.desde) {
      this.filtros.desde = this.mapFecha(this.filtros.desde);
    }
    if (this.filtros.hasta) {
      this.filtros.hasta = this.mapFecha(this.filtros.hasta);
    }
    this.cargarTransacciones(this.filtros);
  }

  private cargarTransacciones(filtros: Filtros): void {
    this.api.listarTransacciones(filtros).subscribe(transacciones => {
      this.transacciones = transacciones;
    });
  }

  private mapFecha(fecha: string): string {
    const date = new Date(fecha);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  get nombreAgrupacion() {
    return this.opcionesAgrupacion.find(opcion => opcion.clave === this.opcionAgrupacionSeleccionada)?.valor;
  }

  get fechaInicial() {
    const date = new Date();
    return new Date(date.getFullYear(), date.getMonth() - 1, date.getDate());
  }
}
