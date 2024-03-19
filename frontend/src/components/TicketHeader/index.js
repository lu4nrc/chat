import ArrowBackIos from "@mui/icons-material/ArrowBackIos";
import { Button, Stack } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";
import TicketHeaderSkeleton from "../TicketHeaderSkeleton";


const TicketHeader = ({ loading, children }) => {

  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/tickets");
  };

  return (
    <>
      {loading ? (
        <TicketHeaderSkeleton />
      ) : (
        <Stack bgcolor={"blue"} direction={"row"}> 
          <Button
            color="primary"
            onClick={handleBack}
           
          >
            <ArrowBackIos />
          </Button>
          {children}
        </Stack>
      )}
    </>
  );
};

export default TicketHeader;
