import React, { useEffect, useState } from "react";

import TicketsManager from "../../components/TicketsManager/";
import chat from "../../assets/chat.svg";
import { Outlet } from "react-router-dom";
import api from "@/services/api";
import toastError from "@/errors/toastError";
import { useToast } from "@/hooks/use-toast";
const Chat = () => {
  const toast = useToast();
  const [activeRating, setActiveRating] = useState();
  

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data } = await api.get("/settings");
        const activeRating = data.find(
          (setting) => setting.key === "activeRating"
        );
        setActiveRating(activeRating);
      } catch (err) {
        toast({
          variant: "destructive",
          title: toastError(err),
        });
      }
    };
    fetchSession();
  }, []);

  return (
    <div className="grid md:grid-cols-[320px_1fr] lg:grid-cols-[420px_1fr]">
      <TicketsManager />

      <Outlet context={[activeRating]}/>
      {/*       ) : (
        <div className="hidden md:flex flex-col items-center justify-center h-full bg-muted">
          <img
            className="h-[300px]  md:h-[420px]"
            src={chat}
            alt="Descrição da imagem"
          />
          <span className=" text-foreground text-2xl text-center">
            Pronto para um atendimento incrível?
            <br />
            <strong>Escolha um para começar!</strong>
          </span>
        </div>
      )} */}
    </div>
  );
};

export default Chat;
