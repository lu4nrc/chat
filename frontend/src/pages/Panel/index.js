import React, { useEffect, useState } from "react";
import openSocket from "../../services/socket-io";

import { useOutletContext } from "react-router-dom";
import Test from "@/components/test";
import { Button } from "@/components/ui/button";
import {Card, CardContent } from "@/components/ui/card";

const PanelPage = () => {
  const [name] = useOutletContext();
  const [data, setData] = useState();

  useEffect(() => {
    const socket = openSocket();

    socket.on("onlineUsers", (data) => {
      console.log(data);
      setData(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className=" grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-2 md:gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold leading-none tracking-tight">
          Painel
        </h1>
      </div>
      <div className="grid grid-cols-4">
        <Card></Card>
      </div>
      {/* {data && data.map(el => <div>{el.username}</div>)} */}
    </div>
  );
};

export default PanelPage;
