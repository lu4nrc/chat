import React from "react";
import { Button } from "@mui/material";

/* const useStyles = styled((theme) => ({
  root: {
    flexGrow: 1,
  },
})); */

const ButtonCustom = ({ fn, children, startIcon, endIcon }) => {
  /* const classes = useStyles(); */

  return (
    <Button
      variant="contained"
      onClick={fn}
      startIcon={startIcon}
      endIcon={endIcon}
    >
      {children}
    </Button>
  );
};

export default ButtonCustom;
