"use client";

import { TrendingUp } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A radial chart with stacked sections";

const chartConfig = {
  inbound: {
    label: "inbound",
    color: "hsl(var(--primary))",
  },
  outbound: {
    label: "outbound",
    color: "hsl(var(--chart-3))",
  },
};

export default function Outin({ outinData, loading }) {

  if (loading) {
    return <div>Carregando dados...</div>;
  }

  if (!outinData || !outinData.inbound || !outinData.outbound) {
    return <div>Dados insuficientes para exibir o gráfico.</div>;
  }

  const chartData = [
    { inbound: outinData.inbound, outbound: outinData.outbound },
  ];
  const totalVisitors = outinData.inbound + outinData.outbound;

  return (
    outinData &&
    chartConfig && (
      <Card className="flex flex-col h-[200px] overflow-hidden">
        <CardHeader className="items-center pb-0">
          <CardTitle>Recebidos e Realizados</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square w-full max-w-[250px]"
          >
            <RadialBarChart
              data={chartData}
              endAngle={180}
              innerRadius={80}
              outerRadius={130}
            >
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 16}
                            className="fill-foreground text-2xl font-bold"
                          >
                            {totalVisitors.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 4}
                            className="fill-muted-foreground"
                          >
                            Total
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </PolarRadiusAxis>
              <RadialBar
                dataKey="outbound"
                fill="var(--color-outbound)"
                stackId="a"
                cornerRadius={5}
                className="stroke-transparent stroke-2"
              />
              <RadialBar
                dataKey="inbound"
                stackId="a"
                cornerRadius={5}
                fill="var(--color-inbound)"
                className="stroke-transparent stroke-2 "
              />
          
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  );
}
