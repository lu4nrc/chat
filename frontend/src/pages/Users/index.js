import React, { useEffect, useReducer, useState } from "react";

import openSocket from "../../services/socket-io";

import { Edit, Trash, Search, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import ConfirmationModal from "../../components/ConfirmationModal";
import UserModal from "../../components/UserModal";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toastError from "@/errors/toastError";
import InfiniteScroll from "@/components/ui/InfiniteScroll";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import ModalProfileCors from "@/components/ModalProfileCors";

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
  const [selectedUser, setSelectedUser] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deletingUser, setDeletingUser] = useState(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [debouncedSearchParam, setDebouncedSearchParam] = useState(searchParam);

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [users, dispatch] = useReducer(reducer, []);
  const { toast } = useToast();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchParam(searchParam);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchParam]);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
    search();
  }, [debouncedSearchParam]);

  const search = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_USERS", payload: data.users });
      setHasMore(data.hasMore);
    } catch (error) {
      toast({
        variant: "destructive",
        title: toastError(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const next = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/users/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_USERS", payload: data.users });
      setHasMore(data.hasMore);
      setPageNumber((prev) => prev + 1);
    } catch (error) {
      toast({
        variant: "destructive",
        title: toastError(error),
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleEditUser = (userId) => {
    setSelectedUser(userId);
    setUserModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      toast({
        variant: "success",
        title: "Sucesso!",
        description: i18n.t("users.toasts.deleted"),
      });
    } catch (err) {
      toast({
        variant: "success",
        title: "Sucesso!",
        description: i18n.t("contactModal.success"),
      });
    }
    setDeletingUser(null);
    setSearchParam("");
    setPageNumber(1);
  };

  return (
    <div className="grid gap-2">
      <h1 className="text-xl font-semibold ml-2">Usuários</h1>

      <UserModal
        open={userModalOpen}
        setOpen={setUserModalOpen}
        userId={selectedUser}
      />

      <div className="border overflow-hidden rounded-lg">
        <div className="flex justify-between p-2">
          <Input
            placeholder={i18n.t("contacts.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            className=" max-w-md bg-background w-full"
          />
          <Button onClick={handleCreateUser}>
            <Plus className="w-4 h-4" /> Novo Usuário
          </Button>
        </div>

        <div className="grid grid-cols-4 text-muted-foreground bg-muted">
          <h4 className=" py-2 pl-2 text-sm font-medium leading-none">Nome</h4>

          <h4 className=" py-2 text-sm font-medium text-center leading-none">
            Perfil
          </h4>
          <h4 className=" py-2 text-sm font-medium text-center leading-none">
            Conexão Padrão
          </h4>
          <h4 className=" py-2 text-sm font-medium text-center leading-none">
            Ações
          </h4>
        </div>
        <ScrollArea className="h-[calc(100vh-240px)] w-full">
          <div className=" w-full  overflow-y-auto">
            <div className="flex w-full flex-col items-center">
              {users.map((user) => (
                <div
                  className="grid grid-cols-4 w-full border-b py-1  items-center text-base leading-2"
                  key={user.id}
                >
                  <div className="pl-2 flex gap-1 items-center">
                    <ModalProfileCors imageUrl={user.imageUrl} />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium leading-3">{user.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  <div className="text-center">
                    <Badge>{user.profile}</Badge>
                  </div>

                  <div className="text-center">{user.whatsapp?.name}</div>

                  <div className="text-center flex justify-center gap-4">
                    <Edit
                      onClick={() => handleEditUser(user.id)}
                      className="h-5 w-5 hover:text-primary"
                    />

                    <Trash
                      onClick={() => {
                        setConfirmModalOpen(true);
                        setDeletingUser(user);
                      }}
                      className="h-5 w-5 hover:text-primary"
                    />
                  </div>
                </div>
              ))}

              <InfiniteScroll
                hasMore={hasMore}
                isLoading={loading}
                next={next}
                threshold={1}
              >
                {hasMore && (
                  <Loader2 className="my-4 h-8 w-8 text-primary animate-spin" />
                )}
              </InfiniteScroll>
            </div>
          </div>
        </ScrollArea>
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
