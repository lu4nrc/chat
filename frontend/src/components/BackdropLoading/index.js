import React from "react";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";

const BackdropLoading = () => {
  return (
    <Backdrop sx={{ zIndex: 99 }} open={true}>
      <CircularProgress />
    </Backdrop>
  );
};

export default BackdropLoading;
