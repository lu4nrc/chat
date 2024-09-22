import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";

import api from "../../services/api";

import { AuthContext } from "../../context/Auth/AuthContext";

import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import toastError from "@/errors/toastError";

const VcardPreview = ({ contact, numbers }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [selectedContact, setContact] = useState({
    name: "",
    number: 0,
    profilePicUrl: "",
  });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          let contactObj = {
            name: contact,
            // number: numbers.replace(/\D/g, ""),
            number: numbers !== undefined && numbers.replace(/\D/g, ""),
            email: "",
          };
          const { data } = await api.post("/contact", contactObj);
          setContact(data);
        } catch (err) {
          toast({
            variant: "destructive",
            title: toastError(err),
          });
        }
      };
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [contact, numbers]);

  const handleNewChat = async () => {
    try {
      const { data: ticket } = await api.post("/tickets", {
        contactId: selectedContact.id,
        userId: user.id,
        status: "open",
      });
      navigate(`/tickets/${ticket.id}`);
    } catch (err) {
      toast({
        variant: "destructive",
        title: toastError(err),
      });
    }
  };

  return (
    <>
      <div
        style={{
          minWidth: "250px",
        }}
      >
        <div>
          <div className="flex p-4 border-b-2">
            <Avatar className="h-12 w-12" alt="contact_image">
              <AvatarImage src={selectedContact.profilePicUrl} alt="@contact" />
              <AvatarFallback>HC</AvatarFallback>
            </Avatar>

            <p
              style={{ marginTop: "12px", marginLeft: "10px" }}
              variant="subtitle1"
              color="primary"
              gutterBottom
            >
              {selectedContact.name}
            </p>
          </div>
         
          <Button onClick={handleNewChat} disabled={!selectedContact.number}>
            Enviar mensagem
          </Button>
        </div>
      </div>
    </>
  );
};

export default VcardPreview;
