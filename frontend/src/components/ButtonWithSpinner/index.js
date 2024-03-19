import React from "react";

import { CircularProgress, Button } from "@mui/material";

const ButtonWithSpinner = ({ loading, children, ...rest }) => {
  return (
    <Button disabled={loading} {...rest} sx={{ fontSize: 10, width: 130, marginTop: "4px" }}>
      {children}
      {loading && <CircularProgress size={24} />}
    </Button>
  );
};

export default ButtonWithSpinner;
