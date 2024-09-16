import React from "react";

import TicketsManager from "../../components/TicketsManager/";
import chat from "../../assets/chat.svg";
import { Outlet } from "react-router-dom";
const Chat = () => {
  return (
    <div className="grid md:grid-cols-[320px_1fr] lg:grid-cols-[420px_1fr]">
      <TicketsManager />

      <Outlet />
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
