import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { intervalToDuration } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const QueuesCard = ({ queuesData, loading }) => {
 
  const [sortKey, setSortKey] = useState("open");

  function convertMinToHour(min) {
    if (min) {
      const hours = Math.floor(min / 60);
      const minutes = min % 60;
      if (hours) {
        return (
          <div className="flex gap-1">
            {Math.round(hours)}h{Math.round(minutes)}m
          </div>
        );
      } else {
        return <div>{Math.round(minutes)}m</div>;
      }
    }
    return `0m`;
  }

  function handleSortChange(value) {
    setSortKey(value);
  }

  let sortedQueues = [];

  if (queuesData) {
    sortedQueues = [...queuesData].sort((a, b) => {
      switch (sortKey) {
        case "open":
          return b.open - a.open;
        case "pending":
          return b.pending - a.pending;
        case "closed":
          return b.closed - a.closed;
        case "media":
          return b.mq_time_avg - a.mq_time_avg;
        default:
          return 0;
      }
    });
  }

  if (loading) {
    return <div>Carregando dados...</div>;
  }

  if (!queuesData) {
    return <div>Sem dados</div>;
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Departamentos</CardTitle>
          <CardDescription>
            Detalhamento de atendimentos por departamento
          </CardDescription>
        </div>
        <div className="ml-auto flex gap-2">
          <Select onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="open">Atendendo</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="closed">Fechados</SelectItem>
                <SelectItem value="media">Tempo Médio</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="grid grid-cols-3 md:grid-cols-5  gap-4 py-2 items-center border-b">
          <div className="text-sm text-muted-foreground">Atendentes</div>
          <div className="text-sm text-muted-foreground">Atendendo</div>
          <div className="text-sm text-muted-foreground hidden md:block ">Pendentes</div>
          <div className="text-sm text-muted-foreground">Fechados</div>
          <div className="text-sm text-muted-foreground hidden md:block ">Tempo Médio</div>
        </div>
        <ScrollArea className="h-[200px]">
          {sortedQueues.map((el) => {
            return (
              <div
                key={el.id}
                className="grid grid-cols-3 md:grid-cols-5 gap-4 py-2 items-center border-b"
              >
                <div className="text-sm font-medium">{el.queue_name}</div>

                <div>
                  <Badge className="font-medium bg-chart1/20 text-sky-700 hover:text-white">
                    {el.open}
                  </Badge>
                </div>
                <div className="hidden md:block">
                  <Badge className="font-medium   bg-chart2/20 text-amber-700 hover:text-white">
                    {el.pending}
                  </Badge>
                </div>
                <div>
                  <Badge className="font-medium bg-chart3/20 text-emerald-700">
                    {el.closed}
                  </Badge>
                </div>
                <div className="text-sm hidden md:block font-medium">
                  {convertMinToHour(el.mq_time_avg)}
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default QueuesCard;
