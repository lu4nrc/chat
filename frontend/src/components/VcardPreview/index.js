import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import toastError from "../../errors/toastError";
import api from "../../services/api";

import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { AuthContext } from "../../context/Auth/AuthContext";

import { Button, Divider } from "@mui/material";
import { useToast } from "@/hooks/use-toast";

const VcardPreview = ({ contact, numbers }) => {
  const { toast } = useToast()
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
          const errorMsg =
          err.response?.data?.message || err.response.data.error;
        toast({
          variant: "destructive",
          title: errorMsg,
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
      const errorMsg =
      err.response?.data?.message || err.response.data.error;
    toast({
      variant: "destructive",
      title: errorMsg,
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
          <div style={{ display: "flex", padding: "10px" }}>
            <Avatar src={selectedContact.profilePicUrl} />
            <Typography
              style={{ marginTop: "12px", marginLeft: "10px" }}
              variant="subtitle1"
              color="primary"
              gutterBottom
            >
              {selectedContact.name}
            </Typography>
          </div>
          <Divider />
          <Button
            fullWidth
            color="primary"
            onClick={handleNewChat}
            disabled={!selectedContact.number}
          >
            Enviar mensagem
          </Button>
        </div>
      </div>
    </>
  );
};

export default VcardPreview;
