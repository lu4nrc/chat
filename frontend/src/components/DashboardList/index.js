import UserCircleIcon from "@mui/icons-material/Person";
import { Grid } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import moment from "moment";
import "moment/locale/pt-br";
import React from "react";

const styleCenter = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "60px",
};

const slimText = {
  fontSize: "0.666em",
  color: "#97969B",
  fontWeight: "lighter",
  paddingBottom: 5,
};

const titleStyle = {
  paddingBottom: 5,
  whiteSpace: "nowrap",
  fontWeight: 500,
};

const dataStyle = {
  fontSize: "1.2em",
  fontWeight: 500,
};

const DashboardList = ({ data }) => {
  const diffTime = (startTime, endTime) => {
    return moment
      .utc(moment(endTime, "HH:mm:ss").diff(moment(startTime, "HH:mm:ss")))
      .format("mm");
  };

  return (
    <List dense>
      {data != null ? (
        data.map((item, index) => (
          <List.Item key={index} index={index + 1}>
            <Grid container>
              <Grid item xs={2} style={styleCenter}>
                <Avatar
                  src={item["contact"]?.profilePicUrl}
                  alt="@superman66"
                />
              </Grid>
              <Grid
                item
                xs={6}
                style={{
                  ...styleCenter,
                  flexDirection: "column",
                  alignItems: "flex-start",
                  overflow: "hidden",
                }}
              >
                <Typography variant="subtitle1" style={titleStyle}>
                  {item["user"]?.name}
                </Typography>
                <div style={slimText}>
                  <div>
                    <UserCircleIcon />
                    {" " + item["contact"]?.name}
                  </div>
                  <div>{moment(item["initialDate"]).format("DD/MM/YYYY")}</div>
                </div>
              </Grid>
              <Grid item xs={3} style={styleCenter}>
                <div style={{ textAlign: "right" }}>
                  <Typography variant="subtitle2" style={slimText}>
                    Status
                  </Typography>
                  <Typography variant="h6" style={dataStyle}>
                    {item["status"] === "pending"
                      ? "Aguardando"
                      : item["status"] === "open"
                      ? "Aberto"
                      : "Finalizado"}
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={4} style={styleCenter}>
                <div style={{ textAlign: "right" }}>
                  <Typography variant="subtitle2" style={slimText}>
                    Tempo/Aguardando
                  </Typography>
                  <Typography variant="h6" style={dataStyle}>
                    {diffTime(item["initialDate"], item["acceptDate"])}min
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={4} style={styleCenter}>
                <div style={{ textAlign: "right" }}>
                  <Typography variant="subtitle2" style={slimText}>
                    Tempo/Atendimento
                  </Typography>
                  <Typography variant="h6" style={dataStyle}>
                    {diffTime(item["acceptDate"], item["finishDate"])}min
                  </Typography>
                </div>
              </Grid>
              <Grid item xs={4} style={styleCenter}>
                <div style={{ textAlign: "right" }}>
                  <Typography variant="subtitle2" style={slimText}>
                    Tempo/Total
                  </Typography>
                  <Typography variant="h6" style={dataStyle}>
                    {diffTime(item["initialDate"], item["finishDate"])}min
                  </Typography>
                </div>
              </Grid>
            </Grid>
          </List.Item>
        ))
      ) : (
        <p>carregando</p>
      )}
    </List>
  );
};

export default DashboardList;
