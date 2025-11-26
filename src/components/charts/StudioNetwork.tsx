"use client";

import { BrutalTheme } from '@/lib/charts/brutal-theme';
import * as am5 from "@amcharts/amcharts5";
import * as am5hierarchy from "@amcharts/amcharts5/hierarchy";
import { useLayoutEffect, useRef } from 'react';

interface StudioNode {
  name: string;
  value: number;
  children?: StudioNode[];
}

interface StudioNetworkData {
  name: string;
  children: StudioNode[];
}

export default function StudioNetwork({ data }: { data: StudioNetworkData }) {
  const chartRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    const root = am5.Root.new(chartRef.current);

    // Apply brutal theme
    root.setThemes([BrutalTheme.new(root)]);

    // Create wrapper container
    const container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
        layout: root.verticalLayout,
      })
    );

    // Create series
    const series = container.children.push(
      am5hierarchy.Pack.new(root, {
        singleBranchOnly: false,
        downDepth: 1,
        initialDepth: 2,
        valueField: "value",
        categoryField: "name",
        childDataField: "children",
      })
    );

    // Configure circles
    series.circles.template.setAll({
      strokeWidth: 3,
      stroke: am5.color(0x000000),
      shadowColor: am5.color(0x000000),
      shadowBlur: 0,
      shadowOffsetX: 4,
      shadowOffsetY: 4,
      tooltipText: "{name}: {value} anime",
    });

    // Color circles with brutal palette
    series.circles.template.adapters.add("fill", (fill, target) => {
      const colors = [
        0xff006e, // pink
        0x00d9ff, // cyan
        0x00ff88, // green
        0xffeb3b, // yellow
        0x9d4edd, // purple
        0xff6b35, // orange
      ];
      // Use a random color from the palette for variety
      const index = Math.floor(Math.random() * colors.length);
      return am5.color(colors[index]);
    });

    // Configure labels
    series.labels.template.setAll({
      text: "{name}",
      fill: am5.color(0x000000),
      fontWeight: "700",
      fontSize: 11,
      oversizedBehavior: "truncate",
      maxWidth: 100,
    });

    series.data.setAll([data]);

    series.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data]);

  return (
    <div 
      ref={chartRef} 
      className="w-full h-[500px] bg-white border-4 border-brutal-black shadow-brutal p-4"
    />
  );
}
