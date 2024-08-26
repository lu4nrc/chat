import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { ArrowUpRight, File } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { intervalToDuration } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const QueuesCard = ({ queuesData, loading }) => {
  function convertMinToHour(min) {
    const duration = intervalToDuration({ start: 0, end: min * 60 * 1000 });

    const horas = duration.hours;
    const minutos = duration.minutes;

    return `${horas}h${minutos}m`;
  }

  if (loading) {
    return <div>Carregando dados...</div>; // Personalize o indicador de loading aqui
  }
  return (
    queuesData && (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Departamentos</CardTitle>
            <CardDescription>
              Detalhamento de atendimentos por departamento
            </CardDescription>
          </div>
          <Button disabled size="sm" className="ml-auto gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exportar
            </span>
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="grid grid-cols-5 gap-4 py-2 items-center border-b">
            <div className="text-sm text-muted-foreground">Atendentes</div>
            <div className="text-sm text-muted-foreground">Atendendo</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
            <div className="text-sm text-muted-foreground">Fechados</div>
            <div className="text-sm text-muted-foreground hidden md:block">
              Tempo Médio
            </div>
          </div>
          <ScrollArea className="h-[200px]">
            {queuesData.map((el) => {
              const media = el.mq_time / el.closed;
              return (
                <div
                  key={el.id}
                  className="grid grid-cols-5 gap-4 py-2 items-center border-b"
                >
                  <div className="text-sm font-medium">{el.queue_name}</div>

                  <div>
                    <Badge className="font-medium bg-chart1/20 text-sky-700 hover:text-white">
                      {el.open}
                    </Badge>
                  </div>
                  <div>
                    <Badge className="font-medium bg-chart2/20 text-amber-700 hover:text-white">
                      {el.pending}
                    </Badge>
                  </div>
                  <div>
                    <Badge className="font-medium bg-chart3/20 text-emerald-700 ">
                      {el.closed}
                    </Badge>
                  </div>
                  <div className="text-sm hidden md:block font-medium">
                    {convertMinToHour(media ? media : 0)}
                  </div>
                </div>
              );
            })}
          </ScrollArea>
        </CardContent>
      </Card>
    )
  );
};

export default QueuesCard;
