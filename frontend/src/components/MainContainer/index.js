import React from "react";

import Container from "@mui/material/Container";

/* const useStyles = styled((theme) => ({
  mainContainer: {
    flex: 1,
    padding: 0,
    height: "100%",
  },

  contentWrapper: {
    height: "100%",
    overflowY: "hidden",
    display: "flex",
    flexDirection: "column",
  },
})); */

const MainContainer = ({ children }) => {

  return (
    <Container /* className={classes.mainContainer} */ maxWidth={false}>
      <div /* className={classes.contentWrapper} */>{children}</div>
    </Container>
  );
};

export default MainContainer;
