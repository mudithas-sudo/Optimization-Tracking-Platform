"use client";

import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip as RTooltip } from "recharts";
import { numFmt } from "@/lib/format";

export function LineTrendChart({
  data,
  dataKey,
  color,
  height = 220,
  unit = "h",
}: {
  data: Record<string, unknown>[];
  dataKey: string;
  color: string;
  height?: number;
  unit?: "h" | "%";
}) {
  const formatter = (v: number) => (unit === "%" ? `${numFmt(v, 0)}%` : `${numFmt(v)}h`);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#eaedf6" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <RTooltip formatter={(v) => formatter(v as number)} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
