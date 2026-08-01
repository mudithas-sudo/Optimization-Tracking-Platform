"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from "recharts";
import { numFmt } from "@/lib/format";

// `unit` (not a formatter function prop) so this stays passable from Server
// Components - a plain closure prop can't cross the server/client boundary.
export function BarChartVertical({
  data,
  dataKey,
  categoryKey,
  color,
  height = 220,
  unit,
}: {
  data: Record<string, unknown>[];
  dataKey: string;
  categoryKey: string;
  color: string;
  height?: number;
  unit?: "hours" | "percent";
}) {
  const formatter = unit ? (v: number) => (unit === "percent" ? `${numFmt(v, 0)}%` : `${numFmt(v)}h`) : undefined;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eaedf6" />
        <XAxis dataKey={categoryKey} tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <RTooltip formatter={formatter ? (v) => formatter(v as number) : undefined} />
        <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
