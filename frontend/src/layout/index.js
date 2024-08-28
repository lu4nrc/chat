import React, { useState, useEffect, useContext } from "react";

import { Outlet } from "react-router-dom";

import SideBar from "./SideBar";
import { AuthContext } from "../context/Auth/AuthContext";

import NewsModal from "../components/NewsModal";
import useLocalStorage from "../hooks/useLocalStorage";
import BackdropLoading from "../components/BackdropLoading";

import openSocket from "../services/socket-io";

const LoggedInLayout = () => {
  const { loading, user } = useContext(AuthContext);

  const [newsModal, setNewsModal] = useState(false);
  const [storedValue, setValue] = useLocalStorage("newsmodal", null);
  const [OnlineUsers, setOnlineUsers] = useState();

/*   useEffect(() => {
    const socket = openSocket();

    socket.on("onlineUsers", (onlineUsers) => {
      console.log(onlineUsers);
      setOnlineUsers(onlineUsers);
    });

    return () => {
      socket.disconnect();
    };
  }, []); */

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (storedValue === null) {
        setNewsModal(false);
        setValue(1);
      }
      if (storedValue === 1) {
        setNewsModal(false);
        setValue(2);
      }
      if (storedValue === 2) {
        setNewsModal(false);
        setValue(3);
      }
      if (storedValue > 2) {
        return;
      }
    }, 3000);
    return () => {
      clearTimeout(delayDebounceFn);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SideBar />

      <div className="flex flex-col sm:gap-4  sm:pl-14">
        <main className="grid flex-1 items-start gap-4 md:gap-8">
          <Outlet context={[user, OnlineUsers]} />
        </main>
        <NewsModal open={newsModal} onClose={() => setNewsModal(false)} />
      </div>
    </div>
  );
};

export default LoggedInLayout;
