import React, { useState, useEffect, useContext } from "react";
import { List, Box, Stack, Grid } from "@mui/material";

import { useTheme } from "@mui/material/styles";
import { Outlet } from "react-router-dom";

import SideBar from "./SideBar";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";
import NewsModal from "../components/NewsModal";
import useLocalStorage from "../hooks/useLocalStorage";

const LoggedInLayout = () => {
  const theme = useTheme();
  const { loading } = useContext(AuthContext);

  const [newsModal, setNewsModal] = useState(false);
  const [storedValue, setValue] = useLocalStorage("newsmodal", null);

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
    <Grid
      columns={16}
      height={"100vh"}
      container
      sx={{
        backgroundColor: theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Grid item sx={{ display: { xs: "none", sm: "block"} }}>
        <SideBar />
      </Grid>
      <Grid item xs={16} sm>
        <Outlet />
        <NewsModal open={newsModal} onClose={() => setNewsModal(false)} />
      </Grid>
    </Grid>
  );
};

export default LoggedInLayout;
