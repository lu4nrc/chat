import {
  Box,
  IconButton,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { List, User } from "@phosphor-icons/react";
import React, { useContext, useState } from "react";
import ProfileImage from "../components/ProfileImage";
import { ArrowDropDown, FiberManualRecord } from "@mui/icons-material";
import NotificationsPopOver from "../components/NotificationsPopOver";
import { i18n } from "../translate/i18n";
import { AuthContext } from "../context/Auth/AuthContext";
import api from "../services/api";
import { toast } from "react-toastify";
import toastError from "../errors/toastError";

const Header = () => {
  const theme = useTheme();
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleLogout, loading } = useContext(AuthContext);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerVariant, setDrawerVariant] = useState("permanent");
  const { user } = useContext(AuthContext);
  const [newsModal, setNewsModal] = useState(false);

  const [status, setStatus] = useState(user?.status);

  const handleChange = (event) => {
    setStatus(event.target.value);
    updateUserStatus(event.target.value);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleOpenUserModal = () => {
    setUserModalOpen(true);
    handleCloseMenu();
  };

  const handleClickLogout = () => {
    handleCloseMenu();
    handleLogout();
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuOpen(false);
  };

  const updateUserStatus = async (status) => {
    try {
      await api.put(`/users/status/${user.id}`, {
        status,
      });
      toast.success("Status alterado com sucesso", {
        style: {
          backgroundColor: "#D4EADD",
          color: "#64A57B",
        },
      });
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Stack
      zIndex={10}
      bgcolor={theme.palette.background.paper}
      color={theme.palette.text}
      height={70}
      boxShadow={"0px 0px 2px rgba(0, 0, 0, 0.25)"}
      direction="row"
      alignItems={"center"}
      px={2}
      justifyContent={"space-between"}
    >
      <Stack direction={"row"} alignItems={"center"} spacing={2}>
        <ProfileImage user={user} />
        {/*           <ListItem sx={{ padding: 0, margin: 0 }}>
            <ListItemText
              primary={
                user.name != null
                  ? user.name.length > 14
                    ? user.name.substring(0, 14) + "..."
                    : user.name
                  : ""
              }
              style={{ color: "#192f42" }}
              secondary={
                <Select
                  value={status}
                  label="Status"
                  onChange={handleChange}
                  IconComponent={() => null}
                  MenuProps={{
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: "left",
                    },
                    getContentAnchorEl: null,
                  }}
                  renderValue={(v) => (
                    <MenuItem value={v} className={""}>
                      <FiberManualRecord
                        style={{
                          fontSize: 15,
                          color:
                            v === "active"
                              ? "#98E3C3"
                              : v === "lazy"
                              ? "#FBED90"
                              : "#f44336",
                          marginRight: 5,
                        }}
                      />{" "}
                      {v === "active"
                        ? "Online"
                        : v === "lazy"
                        ? "Ausente"
                        : "Offline"}
                      <ArrowDropDown style={{ fontSize: 20, marginLeft: 5 }} />
                    </MenuItem>
                  )}
                >
                  <MenuItem value={"active"} className={""}>
                    <FiberManualRecord
                      style={{
                        fontSize: 15,
                        color: "#98E3C3",
                        marginRight: 5,
                      }}
                    />{" "}
                    Online{" "}
                  </MenuItem>
                  <MenuItem value={"lazy"} className={""}>
                    <FiberManualRecord
                      style={{
                        fontSize: 15,
                        color: "#FBED90",
                        marginRight: 5,
                      }}
                    />{" "}
                    Ausente{" "}
                  </MenuItem>
                  <MenuItem value={"inactive"} className={""}>
                    <FiberManualRecord
                      style={{
                        fontSize: 15,
                        color: "#f44336",
                        marginRight: 5,
                      }}
                    />{" "}
                    Offline{" "}
                  </MenuItem>
                </Select>
              }
            />
          </ListItem> */}
      </Stack>

      <Stack direction={"row"}>
        <IconButton onClick={handleMenu} color="inherit" className={""}>
          <User size={24} />
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          /* getcontentanchorel={null} */
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={menuOpen}
          onClose={handleCloseMenu}
        >
          <MenuItem onClick={handleOpenUserModal}>
            {i18n.t("mainDrawer.appBar.user.profile")}
          </MenuItem>
          <MenuItem onClick={handleClickLogout}>
            {i18n.t("mainDrawer.appBar.user.logout")}
          </MenuItem>
        </Menu>
      </Stack>
    </Stack>
  );
};

export default Header;
