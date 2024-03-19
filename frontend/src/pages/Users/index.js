import React, { useEffect, useReducer, useState } from "react";
import { toast } from "react-toastify";
import openSocket from "../../services/socket-io";

import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";

import ConfirmationModal from "../../components/ConfirmationModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import UserModal from "../../components/UserModal";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

import { PersonAdd, Search } from "@mui/icons-material";
import { Stack, TableContainer, Typography } from "@mui/material";
import { PencilSimple, Trash } from "@phosphor-icons/react";
import ButtomCustom from "../../components/Shared/Buttons/ButtomCustom";

const reducer = (state, action) => {
  if (action.type === "LOAD_USERS") {
    const users = action.payload;
    const newUsers = [];

    users.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      state[userIndex] = user;
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;

    const userIndex = state.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Users = () => {
  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [, setHasMore] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [users, dispatch] = useReducer(reducer, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_USERS", payload: data.users });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchUsers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const socket = openSocket();

    socket.on("user", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_USERS", payload: data.user });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_USER", payload: +data.userId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleOpenUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setUserModalOpen(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast.success(i18n.t("users.toasts.deleted"), {
        style: {
          backgroundColor: "#D4EADD",
          color: "#64A57B",
        },
      });
    } catch (err) {
      toastError(err);
    }
    setDeletingUser(null);
    setSearchParam("");
    setPageNumber(1);
  };

  // const loadMore = () => {
  //   setPageNumber((prevState) => prevState + 1);
  // };

  // const handleScroll = (e) => {
  //   if (!hasMore || loading) return;
  //   const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
  //   if (scrollHeight - (scrollTop + 100) < clientHeight) {
  //     loadMore();
  //   }
  // };

  return (
    <Stack p={2}>
      <Stack pt={0.5} spacing={2}>
        <Typography variant="h5">Usuários</Typography>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <TextField
            size="small"
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />

          <ButtomCustom startIcon={<PersonAdd />} fn={handleOpenUserModal}>
            {i18n.t("users.buttons.add")}
          </ButtomCustom>
        </Stack>
        <Stack sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: `calc(100vh - 160px)` }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="center">Nome</TableCell>
                  <TableCell align="center">Email</TableCell>
                  <TableCell align="center">Perfil</TableCell>
                  <TableCell align="center">Conexão Padrão</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell align="center">{user.name}</TableCell>
                    <TableCell align="center">{user.email}</TableCell>
                    <TableCell align="center">{user.profile}</TableCell>
                    <TableCell align="center">{user.whatsapp?.name}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEditUser(user)}
                      >
                        <PencilSimple size={24} />
                      </IconButton>

                      <IconButton
                        size="small"
                        onClick={(e) => {
                          setConfirmModalOpen(true);
                          setDeletingUser(user);
                        }}
                      >
                        <Trash size={24} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {loading && <TableRowSkeleton columns={4} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Stack>
      <ConfirmationModal
        title={
          deletingUser &&
          `${i18n.t("users.confirmationModal.deleteTitle")} ${
            deletingUser.name
          }?`
        }
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={() => handleDeleteUser(deletingUser.id)}
      >
        {i18n.t("users.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <UserModal
        open={userModalOpen}
        onClose={handleCloseUserModal}
        aria-labelledby="form-dialog-title"
        userId={selectedUser && selectedUser.id}
      />
    </Stack>
  );
};

export default Users;
