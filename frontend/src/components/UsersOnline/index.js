import React, { useEffect, useState } from "react";

import { Chip, List, Tooltip } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { getBackendUrl } from "../../config";
import toastError from "../../errors/toastError";
import api from "../../services/api";

/* const useStyles = styled((theme) => ({
  contactNameWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignContent: "center",
  },

  contactLastMessage: {
    paddingRight: 20,
  },

  green: {
    backgroundColor: "#98E3C3",
    color: "#ffff",
    fontWeight: "bold",
  },
  yellow: {
    backgroundColor: "#FBED90",
    color: "#ffff",
    fontWeight: "bold",
  },
  red: {
    backgroundColor: "#FB2A2A",
    color: "#ffff",
    fontWeight: "bold",
  },
  list: {
    padding: 0,
    margin: 0,
    overflowY: "scroll",
    maxHeight: "70vh",
  },
})); */

const UsersOnline = () => {
  /* const classes = useStyles(); */
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/");
          setUsers(data.users);
        } catch (err) {
          const errorMsg =
          err.response?.data?.message || err.response.data.error;
        toast({
          variant: "destructive",
          title: errorMsg,
        });
        }
      };
      fetchUsers();
    }, 10000);
    const firtRequest = setTimeout(() => {
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/");
          setUsers(data.users);
        } catch (err) {
          const errorMsg =
          err.response?.data?.message || err.response.data.error;
        toast({
          variant: "destructive",
          title: errorMsg,
        });
        }
      };
      fetchUsers();
    }, 500);

    return () => {
      clearTimeout(firtRequest);
      clearInterval(interval);
    };
  }, []);

  return (
    <React.Fragment>
      <List /* className={classes.list} */>
        {users.length > 0
          ? users.map((user) => {
            return (
              <React.Fragment key={user.id}>
                <ListItem
                  dense
                  button
                  /* classes={classes.selected}
                  className={classes.ticket} */
                >
                  <ListItemAvatar>
                    <Tooltip arrow placement="right" title="teste">
                      <Avatar
                        src={
                          user.imageUrl != null
                            ? `${getBackendUrl() + "public/" + user.imageUrl}`
                            : null
                        }
                        style={{ height: 30, width: 30 }}
                      />
                    </Tooltip>
                  </ListItemAvatar>
                  <ListItemText
                    disableTypography
                    primary={
                      <span /* className={classes.contactNameWrapper} */>
                        <Typography
                          style={{ fontWeight: "bold" }}
                          noWrap
                          component="span"
                          variant="body2"
                          color="textPrimary"
                        >
                          {user.name}
                        </Typography>
                      </span>
                    }
                  />
                  <div>
                    <Chip
                      label={
                        user.status === "active"
                          ? "Disponível"
                          : user.status === "lazy"
                            ? "Indisponível"
                            : "Offline"
                      }
/*                       className={
                        user.status === "active"
                          ? classes.green
                          : user.status === "lazy"
                            ? classes.yellow
                            : classes.red
                      } */
                      size="small"
                    ></Chip>
                  </div>
                </ListItem>
                <Divider
                  variant="inset"
                  component="li"
                  style={{ backgroundColor: "#f9f9f9" }}
                />
              </React.Fragment>
            );
          })
          : null}
      </List>
    </React.Fragment>
  );
};

export default UsersOnline;
