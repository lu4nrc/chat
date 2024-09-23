import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";

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

import ModalProfileCors from "@/components/ModalProfileCors";

const UsersCard = ({ usersData, loading }) => {
  const [sortKey, setSortKey] = useState("total");

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
        case "total":
          return b.total - a.total;
        case "media":
          return b.m_time_avg - a.m_time_avg;
        case "rating":
          return b.rating.value / b.rating.qtd - a.rating.value / a.rating.qtd;
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
            <CardDescription>Detalhamento por atendentes</CardDescription>
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
                  <SelectItem value="rating">Avaliação</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <div className="grid grid-cols-3 md:grid-cols-[1fr_70px_100px_90px]  gap-x-2 py-2 items-center  border-b">
            <div className="text-sm text-muted-foreground">Atendentes</div>
            <div className="text-sm text-muted-foreground text-center ">
              Total
            </div>
            <div className="text-sm text-muted-foreground   text-center">
              Tempo Médio
            </div>
            <div className="text-sm text-muted-foreground text-center ">
              Avaliação
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-600px)]">
            {sortedUsers.map((el) => {
              return (
                <div
                  key={el.id}
                  className="grid md:grid-cols-[1fr_70px_100px_90px]  gap-x-2 items-center border-b"
                >
                  <div className="flex gap-2 items-center py-1">
                    <ModalProfileCors imageUrl={el.imageUrl} />
                    <div className="text-sm font-medium">{el.user_name}</div>
                  </div>

                  <div className="flex items-center justify-center ">
                    <Badge>{el.total}</Badge>
                  </div>
                  <div className="flex justify-center items-center">
                    <p className="text-center text-sm ">{convertMinToHour(el.m_time_avg)}</p>
                  </div>
                  <div className="flex items-center justify-center ">
                    <Badge>
                      {el.rating.qtd
                        ? (el.rating.value / el.rating.qtd).toFixed(1)
                        : "-"}
                    </Badge>
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
