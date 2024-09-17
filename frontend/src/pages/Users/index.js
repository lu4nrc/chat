import React, { useEffect, useReducer, useState } from "react";

import openSocket from "../../services/socket-io";

import { Edit, Trash, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import ConfirmationModal from "../../components/ConfirmationModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import UserModal from "../../components/UserModal";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const { toast } = useToast();

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
          const errorMsg =
            err.response?.data?.message || err.response.data.error;
          toast({
            variant: "destructive",
            title: errorMsg,
          });
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

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleCreateUser = () => {
    setSelectedUser(null); // Limpa o estado
    setUserModalOpen(true); // Abre o modal para criação
  };

  const handleEditUser = (user) => {
    setSelectedUser(user); // Define o usuário a ser editado
    setUserModalOpen(true); // Abre o modal para edição
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
      const errorMsg = err.response?.data?.message || err.response.data.error;
      toast({
        variant: "destructive",
        title: errorMsg,
      });
    }
    setDeletingUser(null);
    setSearchParam("");
    setPageNumber(1);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Usuários</h1>
        <UserModal
          open={userModalOpen}
          setOpen={setUserModalOpen}
          userId={selectedUser && selectedUser.id}
        />
        <Button onClick={handleCreateUser}>Novo Usuário</Button>
      </div>
      <div className="flex justify-between mb-4">
        <Input
          placeholder={i18n.t("contacts.searchPlaceholder")}
          type="search"
          value={searchParam}
          onChange={handleSearch}
          className="w-full max-w-md"
        />
      </div>
      <div className="overflow-hidden">
        <Table>
          <thead>
            <TableRow>
              <TableCell className="text-center">Nome</TableCell>
              <TableCell className="text-center">Email</TableCell>
              <TableCell className="text-center">Perfil</TableCell>
              <TableCell className="text-center">Conexão Padrão</TableCell>
              <TableCell className="text-center">Ações</TableCell>
            </TableRow>
          </thead>
          <tbody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="text-center">{user.name}</TableCell>
                <TableCell className="text-center">{user.email}</TableCell>
                <TableCell className="text-center">{user.profile}</TableCell>
                <TableCell className="text-center">
                  {user.whatsapp?.name}
                </TableCell>
                <TableCell className="text-center flex justify-center space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleEditUser(user)}
                    size="sm"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setConfirmModalOpen(true);
                      setDeletingUser(user);
                    }}
                    size="sm"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {loading && <TableRowSkeleton columns={4} />}
          </tbody>
        </Table>
      </div>
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
    </div>
  );
};

export default Users;
