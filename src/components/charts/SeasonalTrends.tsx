"use client";

import { BrutalTheme } from '@/lib/charts/brutal-theme';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import { useLayoutEffect, useRef } from 'react';

interface SeasonalData {
  label: string;
  count: number;
}

export default function SeasonalTrends({ data }: { data: SeasonalData[] }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    const root = am5.Root.new(chartRef.current);

    // Apply brutal theme
    root.setThemes([BrutalTheme.new(root)]);

    // Create chart
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0,
      })
    );

    // Create axes
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "label",
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 60,
        }),
        tooltip: am5.Tooltip.new(root, {}),
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
      am5xy.LineSeries.new(root, {
        name: "Anime Releases",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "count",
        categoryXField: "label",
        stroke: am5.color(0xff006e),
        fill: am5.color(0xff006e),
        tooltip: am5.Tooltip.new(root, {
          labelText: "{categoryX}: {valueY} anime",
        }),
      })
    );

    series.strokes.template.setAll({
      strokeWidth: 4,
    });

    // Add bullets
    series.bullets.push(() => {
      return am5.Bullet.new(root, {
        sprite: am5.Circle.new(root, {
          radius: 6,
          fill: am5.color(0xff006e),
          stroke: am5.color(0x000000),
          strokeWidth: 3,
        }),
      });
    });

    // Fill area under line
    series.fills.template.setAll({
      fillOpacity: 0.2,
      visible: true,
    });

    series.data.setAll(data);

    // Add cursor
    chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "zoomX",
    }));

    // Add scrollbar
    chart.set(
      "scrollbarX",
      am5.Scrollbar.new(root, {
        orientation: "horizontal",
      })
    );

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
