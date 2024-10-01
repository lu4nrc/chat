import React, { memo, useContext, useEffect, useRef, useState } from "react";

import {
  endOfDay,
  format,
  isBefore,
  isSameDay,
  isSameWeek,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Link,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import MarkdownWrapper from "../MarkdownWrapper";
import api from "../../services/api";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { Button } from "../ui/button";
import { ChevronRight, Clock, LoaderCircle, Smile } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const TicketListItem = ({ ticket, setFilter }) => {
  const { toast } = useToast();
  let { ticketId } = useParams();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const [currentTicket, setCurrentTicket] = useState(ticket);
  const queueColor = currentTicket.queue?.color || null;
  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      var ticketUpdated = await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });
      setCurrentTicket(ticketUpdated.data);
    } catch (err) {
      setLoading(false);
      toastError(err);
    }
    if (isMounted.current) {
      setLoading(false);
    }
    navigate(`/tickets/${id}`);
  };

  const handleSelectTicket = (id) => {
    setFilter("");
    navigate(`/tickets/${id}`);
  };

  function displayDate(date) {
    const parsedDate = parseISO(date); // Converte a data para o formato adequado
    const today = new Date(); // Pega a data atual
    const oneDayAgo = subDays(today, 1); // Subtrai um dia para representar "ontem"

    // Verifica se é hoje
    const isSame = isSameDay(parsedDate, today);
    // Verifica se é ontem
    const isYesterday =
      isBefore(parsedDate, endOfDay(oneDayAgo)) &&
      !isBefore(parsedDate, startOfDay(oneDayAgo));
    // Verifica se está dentro da semana corrente
    const isThisWeek = isSameWeek(parsedDate, today, { weekStartsOn: 0 }); // Configurando a semana para começar na segunda-feira

    if (isSame) {
      return format(parsedDate, "HH:mm"); // Se for hoje, exibe apenas a hora
    }
    if (isYesterday) {
      return "ontem"; // Se for "ontem", exibe "ontem"
    }
    if (isThisWeek) {
      return format(parsedDate, "EEEE", { locale: ptBR }); // Se for na semana corrente, exibe o dia por extenso
    }
    return format(parsedDate, "dd/MM/yyyy"); // Para datas fora da semana corrente, exibe no formato dd/MM/yyyy
  }

  return (
    <Link
      className={cn(
        "group/item flex items-center  gap-1 hover:bg-muted  relative",
        ticketId === ticket.id ? "bg-muted" : ""
      )}
      key={currentTicket.id}
      to={`/tickets/${ticket.id}`}
    >
      <Tooltip>
        <TooltipTrigger asChild>
          <Avatar
            className="h-14 w-14"
            style={queueColor ? { border: `2px solid ${queueColor}` } : ""}
          >
            <AvatarImage
              className={"border-2 border-background rounded-full"}
              src={currentTicket?.contact?.profilePicUrl}
              alt="@contact"
            />
            <AvatarFallback>
              <Smile className="text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
        </TooltipTrigger>
        <TooltipContent side="right">{`${
          currentTicket?.queue?.name ?? "Sem fila"
        } | ${
          currentTicket?.whatsappId
            ? currentTicket?.whatsapp?.name ?? "Sem conexão"
            : "Sem conexão"
        }`}</TooltipContent>
      </Tooltip>

      <div className="flex flex-col w-full  md:w-[370px] justify-center min-w-0 border-b pr-4 h-[70px]">
        <div className="grid grid-cols-[1fr_auto_auto] items-center ">
          <p className="text-base font-medium text-foreground truncate leading-5">
            {currentTicket.contact.name}
          </p>

          {ticket.lastMessage && (
            <span className="text-xs text-primary font-medium px-1">
              {displayDate(currentTicket.updatedAt)}
            </span>
          )}
          {ticket.unreadMessages ? (
            <div className=" rounded-full bg-primary h-6 w-6 flex justify-center items-center text-xs text-white">
              {ticket.unreadMessages}
            </div>
          ) : (
            <div></div>
          )}
          <div className=" text-sm text-muted-foreground font-medium truncate col-span-3 left-4">
            <MarkdownWrapper>
              {currentTicket.lastMessage ? `${ticket.lastMessage}` : ""}
            </MarkdownWrapper>
          </div>
        </div>
      </div>

      {currentTicket.status === "pending" && (
        <Button
          className="group/edit hidden rounded-full group-hover/item:flex border-l-4 absolute right-2"
          disabled={loading}
          onClick={(_) => handleAcepptTicket(currentTicket.id)}
        >
          Iniciar
          {loading && <LoaderCircle className="ml-1 h-4 w-4 animate-spin" />}
          {!loading && (
            <ChevronRight className="ml-1 h-4 w-4 group-hover/edit:translate-x-0.5" />
          )}
        </Button>
      )}
    </Link>
  );
};

export default TicketListItem;
