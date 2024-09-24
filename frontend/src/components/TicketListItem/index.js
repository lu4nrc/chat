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
import { ptBR } from 'date-fns/locale';
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

  useEffect(() => {
		return () => {
			isMounted.current = false;
		};
	}, []);

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });
    } catch (err) {
      setLoading(false);
      toast({
        variant: "destructive",
        title: toastError(err),
      });
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
    const isYesterday = isBefore(parsedDate, endOfDay(oneDayAgo)) && !isBefore(parsedDate, startOfDay(oneDayAgo));
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
    <div
      className={cn(
        "group/item flex pl-1 items-center gap-1 hover:bg-muted",
        ticketId === ticket.id ? "bg-muted" : ""
      )}
      key={currentTicket.id}
      onClick={(e) => {
        handleSelectTicket(ticket.id);
      }}
      //to={`/tickets/${ticket.id}`}
      /*  onClick={(e) => {
        if (currentTicket.status === "pending") spyMessages(ticket.id);
        handleSelectTicket(ticket.id);
      }} */
      // selected={ticketId && +ticketId === currentTicket.id}
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

      <div className="flex flex-col w-full  md:w-[370px] justify-center  min-w-0 border-b py-4 pr-4">
        <div className="flex gap-1 justify-between items-end">
          <p className="font-medium text-base truncate text-foreground">
            {currentTicket.contact.name}
          </p>
          <div className="flex gap-1 justify-center items-center">
            {ticket.lastMessage && (
              <span className="text-xs text-primary font-medium">
                {displayDate(currentTicket.updatedAt)}
              </span>
            )}
            {ticket.unreadMessages ? (
              <div className="shrink-0 grow-0 rounded-full bg-primary h-6 w-6 flex justify-center items-center text-xs text-white">
                {ticket.unreadMessages}
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex gap-1 items-center justify-between">
          <p className=" text-sm text-muted-foreground font-medium truncate">
            <MarkdownWrapper>
              {currentTicket.lastMessage ? `${ticket.lastMessage}` : ""}
            </MarkdownWrapper>
          </p>
          {/* //! Resolver relogio de tempo de atendimento  */}
          <div className="flex gap-1 items-center ">
            {/*   <div>
              <Clock className="hidden w-6 h-6 rounded-lg text-muted-foreground transition-colors hover:text-foreground" />

              <Popover
                id={id}
                elevation={0}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
              >
                <div className="flex p-1">
                  {currentTicket.status === "pending" ? (
                    <>
                      <p className="text-sm">
                        Tempo de espera:{" "}
                        {open
                          ? DiffInHours(currentTicket.initialDate, null)
                          : null}
                      </p>
                    </>
                  ) : null}
                  {currentTicket.status === "open" ? (
                    <>
                      <p className="text-sm">
                        Tempo de espera:{" "}
                        {open
                          ? DiffInHours(
                              currentTicket.initialDate,
                              currentTicket.acceptDate
                            )
                          : null}
                      </p>
                      <p className="text-sm">
                        Tempo de atendimento:{" "}
                        {open
                          ? DiffInHours(currentTicket.acceptDate, null)
                          : null}
                      </p>
                    </>
                  ) : null}

                  {currentTicket.status === "closed" ? (
                    <>
                      <p className="text-sm font-medium">
                        Tempo de espera:{" "}
                        {open
                          ? DiffInHours(
                              currentTicket.initialDate,
                              currentTicket.acceptDate
                            )
                          : null}
                      </p>
                      <p className="text-sm font-medium">
                        Tempo de atendimento:{" "}
                        {open
                          ? DiffInHours(
                              currentTicket.acceptDate,
                              currentTicket.finishDate
                            )
                          : null}
                      </p>
                      <p className="text-sm font-medium">
                        Tempo de total:{" "}
                        {open
                          ? DiffInHours(
                              currentTicket.initialDate,
                              currentTicket.finishDate
                            )
                          : null}
                      </p>
                    </>
                  ) : null}
                </div>
              </Popover>
            </div> */}

            {currentTicket.status === "pending" && (
              <Button
                size="sm"
                className="group/edit hidden group-hover/item:flex rounded-full h-7"
                disabled={loading}
                onClick={(_) => handleAcepptTicket(currentTicket.id)}
              >
                Iniciar
                {loading && (
                  <LoaderCircle className="ml-1 h-4 w-4 animate-spin" />
                )}
                {!loading && (
                  <ChevronRight className="ml-1 h-4 w-4 group-hover/edit:translate-x-0.5" />
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketListItem;
