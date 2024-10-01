import React, { useContext, useEffect, useRef, useState } from "react";

import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import useSound from "use-sound";
import openSocket from "../../services/socket-io";

import alertSound from "../../assets/sound.mp3";
import { AuthContext } from "../../context/Auth/AuthContext";
import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";

const NotificationsPopOver = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const ticketIdUrl = +location.pathname.split("/")[2];
  const ticketIdRef = useRef(ticketIdUrl);
  const [notifications, setNotifications] = useState([]);
  const [, setDesktopNotifications] = useState([]);

  const { tickets } = useTickets({ withUnreadMessages: "true" });
  const [play] = useSound(alertSound);
  const soundAlertRef = useRef();

  const navigateRef = useRef(navigate);

  useEffect(() => {
    soundAlertRef.current = play;

    if (!("Notification" in window)) {
      console.log("This browser doesn't support notifications");
    } else {
      Notification.requestPermission();
    }
  }, [play]);

  useEffect(() => {
    setNotifications(tickets);
  }, [tickets]);

  useEffect(() => {
    ticketIdRef.current = ticketIdUrl;
  }, [ticketIdUrl]);

  useEffect(() => {
    const socket = openSocket();
    socket.on("connect", () => socket.emit("joinNotification"));
    socket.on("ticket", (data) => {
      if (data.action === "updateUnread" || data.action === "delete") {
        setNotifications((prevState) => {
          const ticketIndex = prevState.findIndex(
            (t) => t.id === data.ticketId
          );
          if (ticketIndex !== -1) {
            prevState.splice(ticketIndex, 1);
            return [...prevState];
          }
          return prevState;
        });

        setDesktopNotifications((prevState) => {
          const notfiticationIndex = prevState.findIndex(
            (n) => n.tag === String(data.ticketId)
          );
          if (notfiticationIndex !== -1) {
            prevState[notfiticationIndex].close();
            prevState.splice(notfiticationIndex, 1);
            return [...prevState];
          }
          return prevState;
        });
      }
    });

    socket.on("appMessage", (data) => {
      if (
        !data.message.read &&
        (data.ticket.userId === user?.id || !data.ticket.userId)
      ) {
        setNotifications((prevState) => {
          const ticketIndex = prevState.findIndex(
            (t) => t.id === data.ticket.id
          );
          if (ticketIndex !== -1) {
            prevState[ticketIndex] = data.ticket;
            return [...prevState];
          }
          return [data.ticket, ...prevState];
        });

        const shouldNotNotificate =
          (data.message.ticketId === ticketIdRef.current &&
            document.visibilityState === "visible") ||
          (data.ticket.userId && data.ticket.userId !== user?.id) ||
          data.ticket.isGroup;

        if (shouldNotNotificate) return;

        handleNotifications(data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const handleNotifications = (data) => {
    const { message, contact, ticket } = data;

    const options = {
      body: `${message.body} - ${format(new Date(), "HH:mm")}`,
      icon: contact.profilePicUrl,
      tag: ticket.id,
      renotify: true,
    };

    const notification = new Notification(
      `${i18n.t("tickets.notification.message")} ${contact.name}`,
      options
    );

    notification.onclick = (e) => {
      e.preventDefault();
      window.focus();
      navigateRef.current.push(`/tickets/${ticket.id}`);
    };

    setDesktopNotifications((prevState) => {
      const notfiticationIndex = prevState.findIndex(
        (n) => n.tag === notification.tag
      );
      if (notfiticationIndex !== -1) {
        prevState[notfiticationIndex] = notification;
        return [...prevState];
      }
      return [notification, ...prevState];
    });

    soundAlertRef.current();
  };
};

export default NotificationsPopOver;
