import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { File, TrafficCone } from "lucide-react";
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

const ContactCard = ({ queuesData, loading }) => {
  const [sortKey, setSortKey] = useState("rating");

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
        case "total":
          return b.total - a.total;
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
          <CardTitle>Contatos</CardTitle>
          <CardDescription>Detalhamento por contatos</CardDescription>
        </div>
        <div className="ml-auto flex gap-2">
          <Select onValueChange={handleSortChange}>
            <SelectTrigger>
              <SelectValue placeholder="Ordenar por" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="total">Total</SelectItem>
                <SelectItem value="media">Tempo Médio</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="flex justify-center flex-col items-center  h-full text-muted-foreground">
        <TrafficCone className="text-orange-500  w-6 h-6" /> Em manutenção!
        {/*         <div className="grid grid-cols-3 md:grid-cols-[1fr_70px_100px_90px]  gap-x-2 py-2 items-center  border-b">
          <div className="text-sm text-muted-foreground">Contato</div>
          <div className="text-sm text-muted-foreground text-center ">
            Total
          </div>
          <div className="text-sm text-muted-foreground   text-center">
            Tempo Médio
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-600px)]">
          {sortedQueues.map((el) => {
            return (
              <div
                key={el.id}
                className="grid md:grid-cols-[1fr_70px_100px_90px]  gap-x-2 py-2 items-center border-b"
              >
                <div className="text-sm font-medium">{el.queue_name}</div>

                <div className="flex items-center justify-center ">
                  <Badge>{el.total}</Badge>
                </div>
                <div className="flex justify-center items-center">
                  <p className="text-center text-sm ">
                    {convertMinToHour(el.mq_time_avg)}
                  </p>
                </div>
              </div>
            );
          })}
        </ScrollArea> */}
      </CardContent>
    </Card>
  );
};

export default ContactCard;
