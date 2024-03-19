import { Avatar, Card, CardHeader } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import React from "react";

/* const useStyles = styled((theme) => ({
  ticketHeader: {
    display: "flex",
    backgroundColor: "#eee",
    flex: "none",
  },
})); */

const TicketHeaderSkeleton = () => {
  /* const classes = useStyles(); */

  return (
    <Card square /* className={classes.ticketHeader} */ elevation={0}>
      <CardHeader
        titleTypographyProps={{ noWrap: true }}
        subheaderTypographyProps={{ noWrap: true }}
        avatar={
          <Skeleton animation="wave" variant="circular">
            <Avatar alt="contact_image" />
          </Skeleton>
        }
        title={<Skeleton animation="wave" width={80} />}
        subheader={<Skeleton animation="wave" width={140} />}
      />
    </Card>
  );
};

export default TicketHeaderSkeleton;
