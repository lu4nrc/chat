import React, { useEffect, useState } from "react";
import openSocket from "../../services/socket-io";

import { useOutletContext } from "react-router-dom";
import Test from "@/components/test";
import { Button } from "@/components/ui/button";

const PanelPage = () => {
  const [name] = useOutletContext();
  const [data, setData] = useState();

  useEffect(() => {
    const socket = openSocket();

    socket.on("onlineUsers", (data) => {
      console.log(data)
      setData(data);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <Button size="sm" variant="ghost">
        Save
      </Button>
      {data && data.map(el => <div>{el.username}</div>)}
      <Test />
    </div>
  );
};

export default PanelPage;
