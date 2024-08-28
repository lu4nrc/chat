import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { File } from "lucide-react";

import { Pie, PieChart } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const PizzaQueuesCard = ({ queuesData, loading }) => {
  let chartConfig = {};

  if (queuesData) {
    chartConfig = queuesData.reduce((accumulator, currentValue) => {
      const { queue_name, queue_color } = currentValue;

      accumulator[queue_name] = { label: queue_name, color: queue_color };

      return accumulator;
    }, {});
  }

  if (loading) {
    return <div>Carregando dados...</div>; 
  }

  if (!queuesData) {
    return <div>Sem dados</div>;
  }

  return (
    queuesData &&
    chartConfig && (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Departamentos</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                fill="color"
                data={queuesData}
                dataKey="total"
                nameKey="queue_name"
                innerRadius={60}
                label
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm"></CardFooter>
      </Card>
    )
  );
};

export default PizzaQueuesCard;
