import { Component, OnInit } from '@angular/core';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import am5locales_es_ES from "@amcharts/amcharts5/locales/es_ES";
import { GraficoComponente } from '../grafico.component';
import { Filtros } from 'src/app/modelo/filtros';
import { ApiService } from 'src/app/servicios/api.service';
import { Columna } from '../tabla/tabla.component';
import { Movimiento } from 'src/app/modelo/movimiento';

@Component({
  selector: 'app-movimientos',
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.css']
})
export class MovimientosComponent extends GraficoComponente implements OnInit {

  columnas: Columna[] = [
    { clave: 'fecha', titulo: 'Fecha' },
    { clave: 'movimientos', titulo: 'Movimientos' },
    { clave: 'total', titulo: 'Total' }
  ];
  movimientos: Movimiento[] = [];

  series: am5xy.CandlestickSeries | undefined;

  constructor(
    private api: ApiService
  ) {
    super();
  }

  ngOnInit(): void {
    const root = am5.Root.new(this.chart?.nativeElement, {});
    root.locale = am5locales_es_ES;
    root.setThemes([
      am5themes_Animated.new(root),
      am5themes_Dark.new(root)
    ]);

    let chart = root.container.children.push(am5xy.XYChart.new(root, {}));

    chart.set("cursor", am5xy.XYCursor.new(root, {}));

    const ejeXrenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 20
    });
    ejeXrenderer.labels.template.setAll({
      rotation: -90,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 10
    });
    let xAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: {
          timeUnit: "day",
          count: 1
        },
        renderer: ejeXrenderer
      })
    );

    let yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        numberFormat: "'$ '#,###.##",
        renderer: am5xy.AxisRendererY.new(root, {})
      })
    );

    let color = root.interfaceColors.get("background");

    this.series = chart.series.push(
      am5xy.CandlestickSeries.new(root, {
        fill: color,
        calculateAggregates: true,
        stroke: color,
        name: "MDXI",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "close",
        openValueYField: "open",
        valueXField: "date",
        openValueYGrouped: "open",
        valueYGrouped: "close",
        legendRangeValueText: "{valueYClose}",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: "Fecha: [bold]{valueX.formatDate('dd-MM-yyyy')}[/]\nMovimientos: [bold]{movimientos}[/]\nTotal: [bold]{total}[/]\n\nAntes: [bold]$ {openValueY}[/]\nDespués: [bold]$ {valueY}[/]"
        })
      })
    );

    this.series.appear(1000);
    chart.appear(1000, 100);
  }

  protected cargarDatos(filtros: Filtros): void {
    this.api.listarMovimientos(filtros).subscribe(movimientos => {
      this.mostrarDatos(movimientos);
    });
  }

  private mostrarDatos(movimientos: Movimiento[]): void {
    this.movimientos = movimientos;
    const datos = movimientos.map(movimiento => {
      const m = (+Math.abs(movimiento.total).toFixed(2)).toLocaleString()
      return {
        date: new Date(movimiento.fecha).getTime(),
        open: movimiento.balance - movimiento.total,
        close: movimiento.balance,
        movimientos: movimiento.movimientos,
        total: movimiento.total > 0 ? `+ $ ${m}` : `- $ ${m}`
      }
    });
    this.series?.data.setAll(datos);
  }
}
