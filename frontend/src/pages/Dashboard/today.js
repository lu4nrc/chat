import React, { useEffect, useState } from "react";

import { ArrowUpRight, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import api from "@/services/api";
import { Progress } from "@/components/ui/progress";
import UsersCard from "./components/usersCard";
import { Button } from "@/components/ui/button";
import QueuesCard from "./components/queuesCard";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Media from "./components/media";

const chartConfig = {
  total: {
    label: "total",
    color: "hsl(var(--primary))",
  },
  open: {
    label: "open",
    color: "hsl(var(--chart-1))",
  },
  pending: {
    label: "pending",
    color: "hsl(var(--chart-2))",
  },
  closed: {
    label: "closed",
    color: "hsl(var(--chart-3))",
  },
};

const data = [
  {
    hour: "00",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  {
    hour: "01",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  {
    hour: "02",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  {
    hour: "03",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  {
    hour: "04",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  {
    hour: "05",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  {
    hour: "06",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  {
    hour: "07",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  {
    hour: "08",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  /*   {hour: '09', open: getRandomInt(0, 10), pending: getRandomInt(0, 10), closed: getRandomInt(0, 10)},
  {hour: '10', open: getRandomInt(0, 10), pending: getRandomInt(0, 10), closed: getRandomInt(0, 10)},
  {hour: '11', open: getRandomInt(0, 10), pending: getRandomInt(0, 10), closed: getRandomInt(0, 10)},
  {hour: '12', open: getRandomInt(0, 10), pending: getRandomInt(0, 10), closed: getRandomInt(0, 10)},
  {hour: '13', open: getRandomInt(0, 10), pending: getRandomInt(0, 10), closed: getRandomInt(0, 10)},
  {hour: '14', open: getRandomInt(0, 10), pending: getRandomInt(0, 10), closed: getRandomInt(0, 10)},
  {hour: '15', open: getRandomInt(0, 10), pending: getRandomInt(0, 10), closed: getRandomInt(0, 10)}, */
  {
    hour: "16",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  {
    hour: "17",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  {
    hour: "18",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  {
    hour: "19",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  {
    hour: "20",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  {
    hour: "21",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  {
    hour: "22",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
  {
    hour: "23",
    open: getRandomInt(0, 10),
    pending: getRandomInt(0, 10),
    closed: getRandomInt(0, 10),
  },
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const Today = () => {
  const [loading, setLoading] = useState();
  const [hours, setHours] = useState();
  const [status, setStatus] = useState();
  const [usersData, setUsersData] = useState();
  const [mediaData, setMediaData] = useState();
  const [queuesData, setQueuesData] = useState();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/dashboard/today");
        setHours(data.today);
        setUsersData(data.users);
        setQueuesData(data.queues);
        setMediaData(data.media);
        console.log(data.media);
        setStatus(data.status);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div class="w-full m-auto grid grid-cols-1 md:grid-cols-4 md:gap-2">
      <div className="">
        {status && (
          <Card className="h-full">
            <div className="pt-2 pl-2 flex flex-col gap-2">
              <div className="flex gap-2">
                <CardTitle>Resumo</CardTitle>
                <Badge>{status.total}</Badge>
              </div>
              <CardDescription>
                Detalhamento de atendimentos por departamento
              </CardDescription>
            </div>

            <CardContent className="flex flex-row  p-4">
              <div className="grid flex-1 auto-rows-min gap-0.5">
                <div className="text-sm text-chart2">
                  Aguardando
                </div>
                <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                  {status.pending}
                </div>
              </div>

              <Separator orientation="vertical" className="mx-2 h-10 w-px" />
              <div className="flex w-full items-center gap-2">
                <div className="grid flex-1 auto-rows-min gap-0.5">
                  <div className="text-sm text-chart1">
                    Atendendo
                  </div>
                  <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                    {status.open}
                  </div>
                </div>
                <Separator orientation="vertical" className="mx-2 h-10 w-px" />
                <div className="grid flex-1 auto-rows-min gap-0.5">
                  <div className="text-sm text-chart3">
                    Fechados
                  </div>
                  <div className="flex items-baseline gap-1 text-2xl font-bold tabular-nums leading-none">
                    {status.closed}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <div class=" md:col-span-2 row-span-2 ">
        {hours && (
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center">
              <CardTitle>Atendimentos (Período de 24 horas)</CardTitle>
            </CardHeader>

            <CardContent>
              <ChartContainer className="h-[200px] w-full" config={chartConfig}>
                <LineChart
                  accessibilityLayer
                  data={hours}
                  margin={{
                    top: 20,
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) =>
                      value[0] == "0"
                        ? `${value.slice(1, 2)}h`
                        : `${value.slice(0, 2)}h`
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />

                  <Line
                    name="Total"
                    dataKey="total"
                    type="natural"
                    stroke="var(--color-total)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-total)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Line>
                  {/*                   <Line
                    name="Aguardando"
                    dataKey="pending"
                    type="natural"
                    stroke="var(--color-pending)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-pending)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Line> */}
                  {/*                   <Line
                    name="Fechados"
                    dataKey="closed"
                    type="natural"
                    stroke="var(--color-closed)"
                    strokeWidth={2}
                    dot={{
                      fill: "var(--color-closed)",
                    }}
                    activeDot={{
                      r: 6,
                    }}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      className="fill-foreground"
                      fontSize={12}
                    />
                  </Line> */}
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
      <div className="row-span-2">
        <Card className="h-full"></Card>
      </div>
      <div className="">
        <Media mediaData={mediaData} loading={loading} />
      </div>
      <div class="col-span-1 md:col-span-2 ">
        <UsersCard usersData={usersData} loading={loading} />
      </div>
      <div class="col-span-1 md:col-span-2 ">
        <QueuesCard queuesData={queuesData} loading={loading} />
      </div>
    </div>
  );
};

export default Today;
