import { Component, ElementRef, Input, ViewChild } from "@angular/core";
import { Filtros } from "../modelo/filtros";

@Component({ template: '' })
export abstract class GraficoComponente {
    @ViewChild('chart', { static: true }) chart: ElementRef | undefined;

    @Input()
    set filtros(nuevosFiltros: Filtros) {
        this.cargarDatos(nuevosFiltros)
    }

    protected abstract cargarDatos(filtros: Filtros): void;
}
