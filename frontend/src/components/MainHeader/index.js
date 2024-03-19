import React from "react";

/* const useStyles = styled((theme) => ({
  contactsHeader: {
    display: "flex",
    alignItems: "center",
    padding: "10px 10px 0px 13px",
  },
})); */

const MainHeader = ({ children }) => {
  /* const classes = useStyles(); */

  return <div /* className={classes.contactsHeader} */>{children}</div>;
};

export default MainHeader;
