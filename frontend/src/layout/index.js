import React, { useContext } from "react";

import { Outlet } from "react-router-dom";

import SideBar from "./SideBar";

import { Toaster } from "@/components/ui/toaster";
import { AuthContext } from "@/context/Auth/AuthContext";
import NotificationsPopOver from "../components/NotificationsPopOver";
import { useEffect, useState } from "react";
import api from "../services/api";
import SystemBlocked from "../pages/SystemBlocked";


const LoggedInLayout = () => {
  const { user } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    const checkSystemStatus = async () => {
      try {
        const { data } = await api.get("/settings");
        console.log(data);
        const systemActive = data.find((s) => s.key === "systemActive");

        if (systemActive && systemActive.value === "disabled") {
          setIsBlocked(true);
        } else {
          setIsBlocked(false);
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkSystemStatus();
  }, []);

  if (isLoading) {
    return <div className="flex h-screen w-screen items-center justify-center">Loading...</div>; // Simplistic loading, can be improved
  }

  if (isBlocked) {
    return <SystemBlocked />;
  }

  return (
    <div className="grid grid-cols-[50px_1fr] bg-background h-screen w-screen">
      {user.id && <NotificationsPopOver />}
      <SideBar user={user} />

      <main>
        <Outlet context={[user]} />
      </main>
      <Toaster />
    </div>
  );
};

export default LoggedInLayout;
