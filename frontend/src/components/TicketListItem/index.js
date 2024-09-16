import React, { memo, useContext, useRef, useState } from "react";

import {
  format,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
  subDays,
} from "date-fns";
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

const TicketListItem = memo(({ ticket, setFilter, handleSelectTicket }) => {
  const { toast } = useToast();
  let { ticketId } = useParams();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const [currentTicket, setCurrentTicket] = useState(ticket);
  const openPoppover = false;
  const queueColor = currentTicket.queue?.color || null;

  const handleAcepptTicket = async (id) => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, {
        status: "open",
        userId: user?.id,
      });
    } catch (err) {
      setLoading(false);
      const errorMsg = err.response?.data?.message || err.response.data.error;
      toast({
        variant: "destructive",
        title: errorMsg,
      });
    }
    if (isMounted.current) {
      setLoading(false);
    }
    navigate(`/tickets/${id}`);
  };

  /*   const spyMessages = (id) => {
    navigate(`/tickets/${id}`);
  }; */

  /*   const handleSelectTicket = (id) => {
    setFilter("");
    navigate(`/tickets/${id}`);
  }; */
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  function DiffInHours(date1, date2) {
    const diffInMs =
      (date2 === null ? new Date().getTime() : new Date(date2).getTime()) -
      (date1 === null ? new Date().getTime() : new Date(date1).getTime());
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60)) % 60;

    const diffTime = new Date(1970, 0, 1, diffInHours, diffInMinutes, 0);

    return diffTime.toLocaleTimeString("pt-BR", { timeStyle: "short" });
  }
  const open = Boolean(anchorEl);
  const id = openPoppover ? "simple-popover" : undefined;

  function displayDate(date) {
    const parsedDate = parseISO(date);
    const today = new Date();
    /* const oneDayAgo = subDays(today, 1); */

    const isSame = isSameDay(parsedDate, today);
    /*     const isBeforeToday = isBefore(parsedDate, startOfDay(today));
    const isWithinOneDay = isBefore(parsedDate, startOfDay(oneDayAgo)) && !isBefore(parsedDate, startOfDay(today));
   */
    if (isSame) {
      return format(parsedDate, "HH:mm");
    }
    /*     if (isBeforeToday && isWithinOneDay) {
      return "ontem";
    } */
    return format(parsedDate, "dd/MM/yyyy");
  }

  return (
    <div
      className={cn(
        "group/item flex pl-1 items-center gap-1 hover:bg-muted",
        ticketId === ticket.id ? "bg-muted" : ""
      )}
      key={currentTicket.id}
      onClick={(e) => {
        handleSelectTicket(ticket.id)
       /*  console.log("navigate")
        e.preventDefault();
        navigate(`/tickets/${ticket.id}`); */
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

      <div className="flex flex-col w-full  md:w-[370px] justify-center  min-w-0 border-b py-4 pr-1 ">
        <div className="flex gap-1 justify-between">
          <p className="font-medium leading-3 text-base truncate text-foreground">
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
});

export default TicketListItem;
