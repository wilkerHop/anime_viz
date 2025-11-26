/**
 * Neo-Brutalist Theme for amCharts 5
 * Provides consistent brutal styling across all charts
 */

import * as am5 from "@amcharts/amcharts5";

export class BrutalTheme extends am5.Theme {
  setupDefaultRules() {
    // Chart container styling
    this.rule("InterfaceColors").setAll({
      stroke: am5.color(0x000000),
      fill: am5.color(0xffffff),
      primaryButton: am5.color(0xff006e),
      primaryButtonHover: am5.color(0xff006e),
      primaryButtonText: am5.color(0x000000),
      secondaryButton: am5.color(0x00d9ff),
      secondaryButtonText: am5.color(0x000000),
      grid: am5.color(0x000000),
      background: am5.color(0xffffff),
      text: am5.color(0x000000),
      positive: am5.color(0x00ff88),
      negative: am5.color(0xff6b35),
    });

    // Typography
    this.rule("Label").setAll({
      fontSize: 14,
      fontWeight: "700",
      fill: am5.color(0x000000),
    });

    // Chart series colors (vibrant brutal palette)
    this.rule("ColorSet").setAll({
      colors: [
        am5.color(0xff006e), // Pink
        am5.color(0x00d9ff), // Cyan
        am5.color(0x00ff88), // Green
        am5.color(0xffeb3b), // Yellow
        am5.color(0x9d4edd), // Purple
        am5.color(0xff6b35), // Orange
      ],
      reuse: true,
    });

    // Grid lines
    this.rule("Grid").setAll({
      stroke: am5.color(0x000000),
      strokeWidth: 2,
      strokeOpacity: 0.2,
    });

    // Axis labels
    this.rule("AxisLabel").setAll({
      fontSize: 12,
      fontWeight: "700",
      fill: am5.color(0x000000),
    });

    // Axis renderers
    this.rule("AxisRendererX").setAll({
      strokeWidth: 3,
      stroke: am5.color(0x000000),
    });

    this.rule("AxisRendererY").setAll({
      strokeWidth: 3,
      stroke: am5.color(0x000000),
    });

    // Column series (for bar charts)
    this.rule("RoundedRectangle", ["series", "column"]).setAll({
      strokeWidth: 3,
      stroke: am5.color(0x000000),
      cornerRadiusTL: 0,
      cornerRadiusTR: 0,
      cornerRadiusBL: 0,
      cornerRadiusBR: 0,
    });

    // Line series
    this.rule("Graphics", ["series", "stroke"]).setAll({
      strokeWidth: 4,
    });

    // Bullets/markers
    this.rule("Circle", ["series", "marker"]).setAll({
      strokeWidth: 3,
      stroke: am5.color(0x000000),
    });
  }
}
