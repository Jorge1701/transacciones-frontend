import { Component, Input, OnInit } from '@angular/core';
import { Filtros } from 'src/app/modelo/filtros';
import { GraficoComponente } from '../grafico.component';
import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import am5themes_Dark from "@amcharts/amcharts5/themes/Dark";
import am5locales_es_ES from "@amcharts/amcharts5/locales/es_ES";
import { ApiService } from 'src/app/servicios/api.service';
import { Categoria } from 'src/app/modelo/categoria';
import { Columna } from '../tabla/tabla.component';

@Component({
  selector: 'app-agrupamiento',
  templateUrl: './agrupamiento.component.html',
  styleUrls: ['./agrupamiento.component.css']
})
export class AgrupamientoComponent extends GraficoComponente implements OnInit {

  @Input() categoria: string | undefined = '';

  categorias: Categoria[] = [];
  columnas: Columna[] = [
    { clave: 'categoria', titulo: this.categoria ? this.categoria : '' },
    { clave: 'cantidad', titulo: 'Transacciones' },
    { clave: 'valor', titulo: 'Valor' }
  ];

  ejeX: am5xy.CategoryAxis<am5xy.AxisRenderer> | undefined;
  series: am5xy.ColumnSeries | undefined;

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

    const chart = root.container.children.push(am5xy.XYChart.new(root, {}));

    chart.set("cursor", am5xy.XYCursor.new(root, {}));

    const ejeXrenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 20
    });
    ejeXrenderer.labels.template.setAll({
      rotation: -90,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 10,
      oversizedBehavior: "truncate",
      maxWidth: 200
    });
    this.ejeX = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "categoria",
      renderer: ejeXrenderer
    }));

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      numberFormat: "'$ '#,###.##",
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    this.series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Agrupaciones",
      xAxis: this.ejeX,
      yAxis: yAxis,
      valueYField: "valor",
      sequencedInterpolation: true,
      categoryXField: "categoria",
      tooltip: am5.Tooltip.new(root, {
        labelText: "[bold]{categoria}[/]\nTransacciones: [bold]{cantidad}[/]\nValor: [bold]$ {valueY}[/]"
      })
    }));

    this.series.columns.template.adapters.add("stroke", this.calcularColor);
    this.series.columns.template.adapters.add("fill", this.calcularColor);

    this.series.appear(1000);
    chart.appear(1000, 100);
  }

  private calcularColor(_: any, target: am5.RoundedRectangle) {
    let dato: any = target.dataItem?.dataContext;
    if (dato.valor > 0) {
      return am5.color(0x32dd1f);
    } else {
      return am5.color(0xff321f);
    }
  }

  private mostrarDatos(categorias: Categoria[]): void {
    this.categorias = categorias;
    this.ejeX?.data.setAll(categorias);
    this.series?.data.setAll(categorias);
  }

  protected cargarDatos(filtros: Filtros): void {
    this.api.listarCategorias(filtros).subscribe(categorias => {
      this.mostrarDatos(categorias);
    });
  }
}
