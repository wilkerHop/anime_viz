"use client";

import { BrutalTheme } from '@/lib/charts/brutal-theme';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import { memo, useLayoutEffect, useRef } from 'react';

interface ScoreData {
  range: string;
  count: number;
}

function ScoreDistribution({ data }: { data: ScoreData[] }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);

    // Apply brutal theme
    root.setThemes([BrutalTheme.new(root)]);

    // Create chart
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        paddingLeft: 0,
        paddingRight: 0,
      })
    );

    // Create axes
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "range",
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 30,
        }),
      })
    );

    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );

    // Create series
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Anime Count",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "count",
        categoryXField: "range",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{categoryX}: {valueY} anime",
        }),
      })
    );

    series.columns.template.setAll({
      strokeWidth: 3,
      stroke: am5.color(0x000000),
      cornerRadiusTL: 0,
      cornerRadiusTR: 0,
      shadowColor: am5.color(0x000000),
      shadowBlur: 0,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
    });

    // Set gradient colors for columns
    series.columns.template.adapters.add("fill", (fill, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const index = series.dataItems.indexOf(dataItem);
        const colors = [
          0xff006e, // pink
          0x00d9ff, // cyan
          0x00ff88, // green
          0xffeb3b, // yellow
          0x9d4edd, // purple
          0xff6b35, // orange
        ];
        return am5.color(colors[index % colors.length]);
      }
      return fill;
    });

    series.data.setAll(data);

    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {}));

    // Animate
    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data]);

  return (
    <div 
      ref={chartRef} 
      className="w-full h-[400px] bg-white border-4 border-brutal-black shadow-brutal p-4"
    />
  );
}

export default memo(ScoreDistribution);
