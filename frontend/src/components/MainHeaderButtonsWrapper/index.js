import React from "react";

/* const useStyles = styled((theme) => ({
  mainHeaderButtonsWrapper: {
    flex: "none",
    marginLeft: "auto",
    "& > *": {
      margin: theme.spacing(1),
    },
  },
})); */

const MainHeaderButtonsWrapper = ({ children }) => {
  /* const classes = useStyles(); */

  return <div /* className={classes.mainHeaderButtonsWrapper} */>{children}</div>;
};

export default MainHeaderButtonsWrapper;
