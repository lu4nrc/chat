import React, { useContext } from "react";

import { Outlet } from "react-router-dom";

import SideBar from "./SideBar";
import { AuthContext } from "../context/Auth/AuthContext";

import BackdropLoading from "../components/BackdropLoading";

const LoggedInLayout = () => {
  const { loading, user } = useContext(AuthContext);

  // const [OnlineUsers, setOnlineUsers] = useState();

  if (loading) {
    return <BackdropLoading />;
  }

  return (
    <div className="grid grid-cols-[50px_1fr] bg-background h-screen w-screen">
      <SideBar />

      <main>
        <Outlet context={[user]} />
      </main>
    </div>
  );
};

export default LoggedInLayout;
