"use client";

import * as am5 from "@amcharts/amcharts5";
import * as am5flow from "@amcharts/amcharts5/flow";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { useLayoutEffect, useRef } from 'react';

type GenreConnection = {
  source: string;
  target: string;
  value: number;
};

export default function GenreNetwork({ data }: { data: GenreConnection[] }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);

    root.setThemes([
      am5themes_Animated.new(root)
    ]);

    // Transform data for Chord Diagram or Force Directed
    // For Chord Diagram, we need a list of nodes and links.
    // However, am5hierarchy.Chord expects a hierarchical structure or a specific data format.
    // Let's use ForceDirected for "connections" as requested, or Chord.
    // The prompt asked for "Genre Connections diagram". A chord diagram is good for this.
    // But amCharts 5 Chord diagram takes data in a specific way.
    
    // Let's try a Force Directed Tree which is also good for networks, 
    // but Chord is better for "connections between categories".
    // Actually, let's use a ChordDirected series.

    const series = root.container.children.push(am5flow.ChordDirected.new(root, {
      sourceIdField: "source",
      targetIdField: "target",
      valueField: "value",
      paddingTop: 20,
      paddingBottom: 20,
      paddingLeft: 20,
      paddingRight: 20,
    }));

    series.data.setAll(data);
    
    // Configure nodes
    if (series.nodes.template) {
      series.nodes.template.setAll({
        tooltipText: "{name}: {total}"
      });
    }

    // Configure links
    if (series.links.template) {
      series.links.template.setAll({
        strokeOpacity: 0.6,
        tooltipText: "{sourceId} & {targetId}: {value} anime"
      });
    }

    series.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data]);

  return (
    <div ref={chartRef} className="w-full h-[600px] border rounded-lg shadow-sm bg-white dark:bg-zinc-900" />
  );
}
