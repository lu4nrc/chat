import React, { useContext, useEffect, useState } from "react";

import { NavLink } from "react-router-dom";

import {
  Badge,
  Box,
  Divider,
  IconButton,
  Stack,
  Switch,
  styled,
  useTheme,
} from "@mui/material";

import { Can } from "../components/Can";
import { AuthContext, useAuthContext } from "../context/Auth/AuthContext";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import {
  Broadcast,
  Gear,
  ProjectorScreenChart,
  SignOut,
} from "@phosphor-icons/react";
import { Nav_Buttons } from "../data";
import useSettings from "../hooks/useSettings";
import NotificationsPopOver from "../components/NotificationsPopOver";

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 40,
  height: 20,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(20px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(20px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.primary.main
            : theme.palette.primary.main,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 16,
    height: 16,
    borderRadius: 8,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 20 / 2,
    opacity: 1,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,.35)"
        : "rgba(0,0,0,.25)",
    boxSizing: "border-box",
  },
}));

const SideBar = (props) => {
  const theme = useTheme();

  const { onToggleMode } = useSettings();

  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const { handleLogout } = useAuthContext();
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  return (
    <Stack
      position={"relative"}
      pt={1}
      width={80}
      height={"100%"}
      borderRight={1}
      borderColor={theme.palette.background.neutral}
      sx={{
        display: "flex",
        alignItems: "center",
      }}
      direction={"column"}
    >
      {Nav_Buttons.map((el) => (
        <NavLink
          key={el.index}
          to={el.link}
          style={({ isActive, isPending }) => {
            return {
              padding: 5,
              borderRadius: 10,
              color: isActive ? "white" : "gray",
              backgroundColor: isActive ? theme.palette.primary.main : "",
            };
          }}
        >
          {el.index === 2 ? (
            <Badge
              badgeContent={connectionWarning ? "!" : 0 && el.index === 2}
              color="error"
            >
              {el.icon}
            </Badge>
          ) : el.index === 3 ? (
            <NotificationsPopOver icon={el.icon} />
          ) : (
            el.icon
          )}
        </NavLink>
      ))}
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Divider sx={{ width: "48px" }} />
            <NavLink
              to="/Panel"
              style={({ isActive, isPending }) => {
                return {
                  padding: 5,
                  borderRadius: 10,
                  color: isActive ? "white" : "gray",
                  backgroundColor: isActive ? theme.palette.primary.main : "",
                };
              }}
            >
              <ProjectorScreenChart size={32} />
            </NavLink>
            <NavLink
              to="/settings"
              style={({ isActive, isPending }) => {
                return {
                  padding: 5,
                  borderRadius: 10,
                  color: isActive ? "white" : "gray",
                  backgroundColor: isActive ? theme.palette.primary.main : "",
                };
              }}
            >
              <Gear size={32} />
            </NavLink>
            <NavLink
              to="/transmission"
              style={({ isActive, isPending }) => {
                return {
                  padding: 5,
                  borderRadius: 10,
                  color: isActive ? "white" : "gray",
                  backgroundColor: isActive ? theme.palette.primary.main : "",
                };
              }}
            >
              <Broadcast size={32} />
            </NavLink>
          </>
        )}
      />
      <Box marginTop={1}>
        <AntSwitch
          onChange={() => {
            onToggleMode();
          }}
          defaultChecked
        />
      </Box>
      <IconButton
        sx={{
          position: "absolute",
          bottom: 2,
        }}
        aria-label="sair"
        onClick={() => {
          handleLogout();
        }}
      >
        <SignOut />
      </IconButton>
    </Stack>
  );
};

export default SideBar;
