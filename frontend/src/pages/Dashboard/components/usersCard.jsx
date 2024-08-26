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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { intervalToDuration } from "date-fns";

const UsersCard = ({ usersData, loading }) => {
  function convertMinToHour(min) {
    const duration = intervalToDuration({ start: 0, end: min * 60 * 1000 });

    const horas = duration.hours;
    const minutos = duration.minutes;

    if (horas === 0) {
      return `${minutos}m`;
    }

    return `${horas}h${minutos}m`;
  }

  if (loading) {
    return <div>Carregando dados...</div>;
  }

  return (
    usersData && (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex flex-row items-center">
          <div className="grid gap-2">
            <CardTitle>Atendentes</CardTitle>
            <CardDescription>Detalhamento de atendimentos</CardDescription>
          </div>
          <Button disabled size="sm" className="ml-auto gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exportar
            </span>
          </Button>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 py-2 items-center border-b">
            <div className="text-sm text-muted-foreground">Atendentes</div>
            <div className="text-sm text-muted-foreground">Atendendo</div>
            <div className="text-sm text-muted-foreground">Fechados</div>
            <div className="text-sm text-muted-foreground hidden md:block">
              Tempo Médio
            </div>
          </div>
          <ScrollArea className="h-[200px]">
            {usersData.map((el) => {
              const media = el.m_time / el.closed;
              return (
                <div
                  key={el.id}
                  className="grid grid-cols-3 md:grid-cols-4 gap-4 py-2 items-center border-b"
                >
                  <div className="flex gap-2 items-center">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarImage src="/avatars/01.png" alt="Avatar" />
                      <AvatarFallback>
                        {el.user_name
                          .split(" ")
                          .map((palavra) => palavra[0].toUpperCase())
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium">{el.user_name}</div>
                  </div>
                  <div>
                    <Badge className="font-medium bg-chart1/20 text-sky-700 hover:text-white">
                      {el.open}
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

export default UsersCard;
