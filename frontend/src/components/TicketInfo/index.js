import { Avatar, CardHeader } from "@mui/material";
import React from "react";
import { i18n } from "../../translate/i18n";

const TicketInfo = ({ contact, ticket, onClick, children }) => {
  return (
    <CardHeader
      onClick={onClick}
      sx={{ cursor: "pointer" }}
      titleTypographyProps={{ noWrap: true }}
      subheaderTypographyProps={{ noWrap: true }}
      avatar={<Avatar src={contact.profilePicUrl} alt="contact_image" />}
      title={`${
        contact.name.length > 14
          ? contact.name.substring(0, 14) + "..."
          : contact.name
      } n°${ticket.id}`}
      subheader={
        <div style={{ display: "flex", flexDirection: "column" }}>
          {ticket.user &&
            `${i18n.t("messagesList.header.assignedTo")} ${ticket.user.name}`}
          <div style={{ display: "flex", flexDirection: "row" }}>
            {children}
          </div>
        </div>
      }
    />
  );
};

export default TicketInfo;
