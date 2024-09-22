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
import PizzaQueuesCard from "./components/pizzaQueuesCard";
import Outin from "./components/Outin";
import ContactCard from "./components/ContactCard";

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

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const FourteenDays = () => {
  const [loading, setLoading] = useState();
  const [hours, setHours] = useState();
  const [status, setStatus] = useState();
  const [usersData, setUsersData] = useState();
  const [mediaData, setMediaData] = useState();
  const [queuesData, setQueuesData] = useState();
  const [outin, setOutin] = useState();
  console.log(hours);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/dashboard/fourteen");

        setHours(data.today);
        setUsersData(data.users);
        setQueuesData(data.queues);
        setMediaData(data.media);
        setStatus(data.status);
        setOutin(data.outin);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div class="w-full m-auto grid grid-cols-1 md:grid-cols-8 gap-1 md:gap-3">
      <div className="col-span-1  md:col-span-2">
        <Outin outinData={outin} loading={loading} />
      </div>

      <div class="col-span-1 md:col-span-4 row-span-2 ">
        {hours && (
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center">
              <CardTitle>
                Atendimentos (Período de 14 dias)<Badge>{status.total}</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="flex">
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
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => {
                      const date = new Date(value + "T00:00:00Z"); // Força a data a ser interpretada como UTC
                      return date.toLocaleDateString("pt-BR", {
                        weekday: "short",
                        timeZone: "UTC", // Garante que o fuso horário UTC seja usado
                      });
                    }}
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
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="col-span-1  md:col-span-2 row-span-2 ">
        <PizzaQueuesCard queuesData={queuesData} loading={loading} />
      </div>

      <div className="col-span-1  md:col-span-2">
        <Media mediaData={mediaData} loading={loading} />
      </div>
      <div class="col-span-1 md:col-span-3 ">
        <UsersCard usersData={usersData} loading={loading} />
      </div>

      <div class="col-span-1 md:col-span-3">
        <QueuesCard queuesData={queuesData} loading={loading} />
      </div>
      <div class="col-span-1 md:col-span-2">
        <ContactCard queuesData={queuesData} loading={loading} />
      </div>
    </div>
  );
};

export default FourteenDays;
