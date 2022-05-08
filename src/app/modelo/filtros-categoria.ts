import { Filtros } from "./filtros";

export interface FiltrosCategoria extends Filtros {
    categorias: string | null;
}