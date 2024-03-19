import React, { useEffect, useState } from "react";

import Typography from "@mui/material/Typography";

import { Avatar, Badge, Box, Stack, styled, useTheme } from "@mui/material";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#ff0000",
    color: "#ff0000",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(3.4)",
      opacity: 0,
    },
  },
}));

const PanelListItem = ({ ticket }) => {
  const theme = useTheme();
  const [color, setColor] = useState("black");
  const [time, setTime] = useState({});

  useEffect(() => {
    const calculateTimeDifference = () => {
      const currentTime = new Date();
      const providedTime = new Date(ticket?.finishDate);
      const diffInMilliseconds = currentTime - providedTime;

      const diffMinutes = Math.floor(diffInMilliseconds / 60000);
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;

      let color = "red";

      if (diffMinutes <= 10) {
        color = "green";
      } else if (diffMinutes <= 20) {
        color = "orange";
      }

      setColor(color);


      


      setTime({ hours, minutes });
    };

    calculateTimeDifference();
    const interval = setInterval(calculateTimeDifference, 60000);

    return () => {
      clearInterval(interval);
    };
  }, [ticket?.finishDate]);



  return (
    <Stack
      key={ticket.id}
      py={1.2}
      px={1}
      direction={"row"}
      justifyContent={"space-between"}
      spacing={2}
      alignItems={"center"}
      bgcolor={theme.palette.background.neutral}
      borderRadius={1}
      flexWrap={"wrap"}
       sx={{
        /* boxShadow: (theme) => theme.shadows[1], */
        /* border: "1px solid #DFE3E8", */
      }} 
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Avatar
          src={ticket?.contact?.profilePicUrl}
          sx={{ width: 24, height: 24 }}
        />
        <Stack>
          {ticket.contact.name !== undefined && (
            <Typography
              component="span"
              variant="body1"
              fontWeight={"bold"}
              color="textPrimary"
              noWrap
              sx={{
                maxWidth: 210,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "inline-block",
                lineHeight: 1.3,
              }}
            >
              {ticket.contact.name}
            </Typography>
          )}
          {ticket.user?.name && (
            <Typography
              component="span"
              variant="body2"
              color="textSecondary"
              noWrap
              sx={{
                maxWidth: 190,
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "inline-block",
                lineHeight: 1,
              }}
            >
              <strong>Atendente:</strong> {ticket.user.name}
            </Typography>
          )}
        </Stack>
      </Box>
      {/* Time */}
      <StyledBadge
        overlap="circular"
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        variant={ticket.unreadMessages ? "dot" : "standard"}
      >
        <Typography
          variant="subtitle1"
          sx={{ color, paddingRight: ticket.unreadMessages ? 1 : 0 }}
        >
          {time.hours > 0 ? `${time.hours}H e ` : ""}
          {time.minutes}Min
        </Typography>
      </StyledBadge>
    </Stack>
  );
};

export default PanelListItem;
