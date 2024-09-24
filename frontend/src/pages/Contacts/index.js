import React, { useContext, useEffect, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import openSocket from "../../services/socket-io";

import api from "../../services/api";

import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

import formatarNumeroTelefone from "../../utils/numberFormat";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import InfiniteScroll from "@/components/ui/InfiniteScroll";
import { Loader2, MessageSquarePlus, Pen, Smile, Trash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Input } from "@/components/ui/input";
import ContactModal from "@/components/ContactModal";
import { useToast } from "@/hooks/use-toast";

const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;

    const updatedState = state.map((c) => (c.id === contact.id ? contact : c));

    // Se o contato não existe, adiciona-o ao início da lista
    const contactExists = state.some((c) => c.id === contact.id);
    return contactExists ? updatedState : [contact, ...updatedState];
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;
    return state.filter((contact) => contact.id !== contactId);
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Contacts = () => {
  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  const [selectedContactId, setSelectedContactId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  console.log("isOpen: ", isOpen);
  const [deletingContact, setDeletingContact] = useState(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [contacts, dispatch] = useReducer(reducer, []);

  const [searchParam, setSearchParam] = useState("");
  const [debouncedSearchParam, setDebouncedSearchParam] = useState(searchParam);

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
      const { data } = await api.get("/contacts/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
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
      const { data } = await api.get("/contacts/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
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

    socket.on("contact", (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSaveTicket = async (contactId) => {
    if (!contactId) return;
    setLoading(true);
    try {
      const { data: ticket } = await api.post("/tickets", {
        contactId: contactId,
        userId: user?.id,
        status: "open",
      });
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
    setLoading(false);
  };

  const handleSearch = (event) => {
    setSearchParam(event.target.value.toLowerCase());
  };

  const handleOpenContactModal = (contactId) => {
    console.log(contactId)
    setSelectedContactId(contactId);
    setIsOpen(true);
  };

  const hadleEditContact = (contactId) => {
    setSelectedContactId(contactId);
    setIsOpen(true);
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await api.delete(`/contacts/${contactId}`);
      toast({
        variant: "success",
        title: "Sucesso!",
        description: i18n.t("contacts.toasts.deleted"),
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
    setDeletingContact(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const handleimportContact = async () => {
    try {
      await api.post("/contacts/import");
      navigate.go(0);
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
  };

  return (
    <div className="h-full flex flex-col gap-2 p-4 sm:px-6 sm:py-2 md:gap-4">
      <ContactModal
        open={isOpen}
        onOpenChange={setIsOpen}
        aria-labelledby="form-dialog-title"
        contactId={selectedContactId}
      />
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
          Contatos
        </h1>
        <Badge className="ml-auto sm:ml-0">Beta</Badge>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Pesquisar contato.."
          value={searchParam}
          onChange={handleSearch}
        />
        <div className="flex gap-1">
          <Button onClick={(e) => handleimportContact()}>
            Importar contatos
          </Button>
          <Button onClick={() => handleOpenContactModal()}>Novo contato</Button>
        </div>
      </div>

      <div className="border overflow-hidden rounded-lg">
        <div className="flex w-full bg-muted flex-col gap-2 border-b border-muted">
          <div className="grid grid-cols-[1fr_1fr_180px] text-muted-foreground">
            <h4 className=" py-2 pl-2 text-sm font-medium leading-none">
              Nome
            </h4>
            <h4 className=" py-2  text-sm font-medium leading-none">
              Telefone
            </h4>
            <h4 className=" py-2 text-sm font-medium text-center leading-none">
              Opções
            </h4>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-150px)] w-full">
          <div className=" w-full  overflow-y-auto">
            <div className="flex w-full flex-col items-center">
              {contacts.map((contact) => (
                <div className="grid grid-cols-[1fr_1fr_180px] w-full border-b py-1  items-center">
                  <div className="pl-1 flex gap-1 items-center">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={contact.profilePicUrl} alt="@contato" />
                      <AvatarFallback>
                        <Smile className="text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col justify-center gap-1">
                      <p className="font-bold text-muted-foreground">
                        {contact.id} - {contact.name}
                      </p>
                      <span className="text-sm text-muted-foreground">
                        {contact.email}
                      </span>
                    </div>
                  </div>

                  <span className=" text-sm text-muted-foreground ">
                    {contact.number}
                  </span>

                  <div className=" flex gap-1 justify-between items-center">
                    <Button
                      variant="ghost"
                      onClick={() => handleSaveTicket(contact.id)}
                    >
                      <MessageSquarePlus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => handleOpenContactModal(contact.id)}
                    >
                      <Pen className="h-4 w-4" />
                    </Button>

                    {user.profile === "admin" && (
                      <Button
                        variant="ghost"
                        onClick={() => hadleEditContact(contact.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
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
    </div>
  );
};

export default Contacts;
