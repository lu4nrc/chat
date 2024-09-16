import React, { useContext } from "react";

import { Outlet } from "react-router-dom";

import SideBar from "./SideBar";

import { Toaster } from "@/components/ui/toaster";
import { AuthContext } from "@/context/Auth/AuthContext";
import { useToast } from "@/hooks/use-toast";

const LoggedInLayout = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="grid grid-cols-[50px_1fr] bg-background h-screen w-screen">
      <SideBar user={user}/>

      <main>
        <Outlet context={[user]} />
      </main>
      <Toaster />
    </div>
  );
};

export default LoggedInLayout;
