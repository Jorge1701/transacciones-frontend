import { Component, OnInit } from '@angular/core';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import am5locales_es_ES from "@amcharts/amcharts5/locales/es_ES";
import { ApiService } from 'src/app/servicios/api.service';
import { Balance } from 'src/app/modelo/balance';
import { Filtros } from 'src/app/modelo/filtros';
import { GraficoComponente } from '../grafico.component';
import { Columna } from '../tabla/tabla.component';

@Component({
  selector: 'app-balance',
  templateUrl: './balance.component.html',
  styleUrls: ['./balance.component.css']
})
export class BalanceComponent extends GraficoComponente implements OnInit {

  columnas: Columna[] = [
    { clave: 'fecha', titulo: 'Fecha' },
    { clave: 'balance', titulo: 'Balance' }
  ];
  balances: Balance[] = [];

  root: am5.Root | undefined;
  series: am5xy.LineSeries | undefined;
  ejeX: am5xy.DateAxis<am5xy.AxisRenderer> | undefined;

  constructor(
    private api: ApiService
  ) {
    super();
  }

  ngOnInit(): void {
    this.root = am5.Root.new(this.chart?.nativeElement, {});
    this.root.locale = am5locales_es_ES;
    this.root.setThemes([
      am5themes_Animated.new(this.root),
      am5themes_Dark.new(this.root)
    ]);

    const chart = this.root.container.children.push(am5xy.XYChart.new(this.root, {}));

    chart.set("cursor", am5xy.XYCursor.new(this.root, {}));

    const ejeXrenderer = am5xy.AxisRendererX.new(this.root, {
      minGridDistance: 20
    });
    ejeXrenderer.labels.template.setAll({
      rotation: -90,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 10
    });
    this.ejeX = chart.xAxes.push(am5xy.DateAxis.new(this.root, {
      baseInterval: {
        timeUnit: "day",
        count: 1
      },
      renderer: ejeXrenderer
    }));

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(this.root, {
      numberFormat: "'$ '#,###.##",
      renderer: am5xy.AxisRendererY.new(this.root, {})
    }));

    let series = chart.series.push(am5xy.StepLineSeries.new(this.root, {
      name: "Balance",
      xAxis: this.ejeX,
      yAxis: yAxis,
      valueYField: "balance",
      valueXField: "fecha",
      tooltip: am5.Tooltip.new(this.root, {
        labelText: "Fecha: [bold]{valueX.formatDate('dd-MM-yyyy')}[/]\nBalance: [bold]$ {valueY}[/]"
      })
    }));
    series.bullets.push(function(root) {
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 2,
          fill: series.get("fill")
        })
      });
    });

    this.series = series;
    this.series.appear(1000);
    chart.appear(1000, 100);
  }

  protected cargarDatos(filtros: Filtros): void {
    this.api.listarBalances(filtros).subscribe(balance => {
      this.mostrarDatos(balance);
    });
  }

  private mostrarDatos(balance: Balance[]): void {
    this.balances = balance;
    const datos = balance.map(b => {
      return {
        fecha: new Date(b.fecha).getTime(),
        balance: b.balance
      };
    });
    this.series?.data.setAll(datos);
    this.ejeX?.data.setAll(datos);
  }
}
