"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as RTooltip, Legend } from "recharts";
import { bdCurrency } from "@/lib/format";

export function DonutPieChart({ data, colors, height = 200 }: { data: { name: string; value: number }[]; colors: string[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
          {data.map((_, i) => (
            <Cell key={i} fill={colors[i % colors.length]} />
          ))}
        </Pie>
        <RTooltip formatter={(v) => bdCurrency(v as number)} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
