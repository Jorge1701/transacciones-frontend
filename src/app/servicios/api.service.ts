import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Categoria } from '../modelo/categoria';
import { Balance } from '../modelo/balance';
import { Filtros } from '../modelo/filtros';
import { Movimiento } from '../modelo/movimiento';
import { Transaccion } from '../modelo/transaccion';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient
  ) {}

  public obtenerBalanceActual(): Observable<number> {
    return this.get('balance/actual');
  }

  public listarBalances(filtros: Filtros): Observable<Balance[]> {
    return this.get('balance', filtros);
  }

  public listarMovimientos(filtros: Filtros): Observable<Movimiento[]> {
    return this.get('movimiento', filtros);
  }

  public listarCategorias(filtros: Filtros): Observable<Categoria[]> {
    return this.get('categorias', filtros);
  }

  public listarTransacciones(filtros: Filtros): Observable<Transaccion[]> {
    return this.get('transaccion', filtros);
  }

  private get<T>(url: string, params: any = {}) : Observable<T> {
    params = Object.keys(params)
      .filter(k => params[k] !== null)
      .reduce((p, k) => ({ ...p, [k]: params[k] }), {});

    return this.http.get<T>(environment.apiUrl + url, { params: params });
  }
}
