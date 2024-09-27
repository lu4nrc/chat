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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Annoyed, BadgeInfo, Frown, Info, Smile } from "lucide-react";

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

            <div className="flex justify-center items-center gap-1">
              <p className="text-sm text-muted-foreground text-center">TMA</p>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="text-muted-foreground w-4 y-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-32 text-xs font-medium">O que é TMA?</p>
                  <div className="w-56 text-xs text-muted-foreground">
                    O Tempo Médio de Atendimento (TMA) é tipo o cronômetro que
                    mede quanto tempo a gente leva para ajudar os clientes,
                    desde o <strong>'Olá'</strong> até o{" "}
                    <strong>'tudo resolvido'</strong>, contando até as pausas e
                    transferências!
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex justify-center items-center gap-1">
              <p className="text-sm text-muted-foreground text-center">CSAT</p>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="text-muted-foreground w-4 y-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-32 text-xs font-medium">O que é CSAT?</p>
                  <div className="w-56 text-xs text-muted-foreground">
                    O CSAT é como aquele <strong>'tá tudo certo?'</strong> no
                    final do atendimento, só que medido em números pra ver o
                    quanto o cliente saiu feliz!
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <ScrollArea className="h-[calc(100vh-600px)]">
            {sortedUsers.map((el) => {
              let rating = el.rating.value
                ? (el.rating.value / el.rating.qtd).toFixed(1)
                : "-";
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
                    <p className="text-center text-sm ">{el.total}</p>
                  </div>
                  <div className="flex justify-center items-center">
                    <p className="text-center text-sm ">
                      {convertMinToHour(el.m_time_avg)}
                    </p>
                  </div>
                  <div className="flex items-center justify-center ">
                    <Badge
                      className={"flex gap-1"}
                      variant={
                        rating === "-"
                          ? "ghost"
                          : rating >= 4
                          ? "success"
                          : rating >= 3
                          ? "alert"
                          : "destructive"
                      }
                    >
                      {rating === "-" ? (
                        ""
                      ) : rating >= 4 ? (
                        <Smile className="w-4 h-4" />
                      ) : rating >= 3 ? (
                        <Annoyed className="w-4 h-4" />
                      ) : (
                        <Frown className="w-4 h-4" />
                      )}
                      {rating}
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
