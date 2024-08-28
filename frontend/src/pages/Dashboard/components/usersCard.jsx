import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState } from "react";
import { ArrowUpRight, File } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { intervalToDuration } from "date-fns";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UsersCard = ({ usersData, loading }) => {
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

  let sortedUsers = [];

  if (usersData) {
    sortedUsers = [...usersData].sort((a, b) => {
      switch (sortKey) {
        case "open":
          return b.open - a.open;
        case "pending":
          return b.pending - a.pending;
        case "closed":
          return b.closed - a.closed;
        case "media":
          return b.m_time_avg - a.m_time_avg;
        default:
          return 0;
      }
    });
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
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4 py-2 items-center  border-b">
            <div className="text-sm text-muted-foreground">Atendentes</div>
            <div className="text-sm text-muted-foreground text-center">
              Atendendo
            </div>
            <div className="text-sm text-muted-foreground text-center">
              Fechados
            </div>
            <div className="text-sm text-muted-foreground  hidden md:block">
              Tempo Médio
            </div>
          </div>
          <ScrollArea className="h-[200px]">
            {sortedUsers.map((el) => {
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
                          .map((palavra) =>palavra? palavra[0].toUpperCase() : "HC")
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium">{el.user_name}</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <Badge className="font-medium  bg-chart1/20 text-sky-700 hover:text-white">
                      {el.open}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-center">
                    <Badge className="font-medium  bg-chart3/20 text-emerald-700 ">
                      {el.closed}
                    </Badge>
                  </div>
                  <div className="hidden md:block">
                    {convertMinToHour(el.m_time_avg)}
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
