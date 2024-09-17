import React, { useEffect, useState } from "react";
import openSocket from "../../services/socket-io";

import Typography from "@mui/material/Typography";

import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import { toast } from "react-toastify";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody/TableBody";
import TableCell from "@mui/material/TableCell";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import ListItem from "@mui/material/ListItem";

import { Button, Card, Stack, styled} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { registerLocale } from "react-datepicker";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

import { CopySimple } from "@phosphor-icons/react";
import ptBR from "date-fns/locale/pt-BR";
import dayjs from "dayjs";
import Queues from "../Queues";
import QuickAnswers from "../QuickAnswers";
import Tags from "../Tags";
import Users from "../Users";
import { useOutletContext } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

registerLocale("pt-br", ptBR);

/* const StyledTimePicker = styled(TimePicker)(({ theme }) => ({
  "& .MuiInputBase-root": {
    height: 34,
    maxWidth: 110,
  },
})); */

const TabPanel = (props) => {
  const { children, index, value, ...other } = props;
  return (
    <Card role="tabpanel" hidden={value !== index} {...other} elevation={0}>
      {value === index && <div>{children}</div>}
    </Card>
  );
};

const Settings = () => {
  const [settings, setSettings] = useState([]);

  const [openingHours, setOpeningHours] = useState({});
  const { toast } = useToast();

  const replicateDays = (data) => {
    const { days } = data;
    if (days.length > 1) {
      const { start1, end1, start2, end2 } = days[0];
      for (let i = 1; i < days.length; i++) {
        days[i].start1 = start1;
        days[i].end1 = end1;
        days[i].start2 = start2;
        days[i].end2 = end2;
      }
    }
    setOpeningHours(data);
  };

  const updateOpeningHours = async () => {
    const update = async () => {
      try {
        await api.put("/openingHours", {
          openingHours: openingHours,
        });

        toast.success(i18n.t("settings.settings.openingHours.update"), {
          style: {
            backgroundColor: "#D4EADD",
            color: "#64A57B",
          },
        });
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.response.data.error;
        toast({
          variant: "destructive",
          title: errorMsg,
        });
      }
    };
    update();
  };
  useEffect(() => {
    const fetchOpeningHours = async () => {
      const update = async () => {
        try {
          const { data } = await api.get("/openinghours");
          setOpeningHours(data);
        } catch (err) {
          const errorMsg =
            err.response?.data?.message || err.response.data.error;
          toast({
            variant: "destructive",
            title: errorMsg,
          });
        }
      };
      update();
    };

    const fetchSession = async () => {
      try {
        const { data } = await api.get("/settings");
        setSettings(data);
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.response.data.error;
        toast({
          variant: "destructive",
          title: errorMsg,
        });
      }
    };
    fetchSession();
    fetchOpeningHours();
  }, []);

  useEffect(() => {
    const socket = openSocket();

    socket.on("settings", (data) => {
      if (data.action === "update") {
        setSettings((prevState) => {
          const aux = [...prevState];
          const settingIndex = aux.findIndex((s) => s.key === data.setting.key);
          aux[settingIndex].value = data.setting.value;
          return aux;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleChangeSetting = async (e) => {
    const selectedValue = e.target.value;
    const settingKey = e.target.name;

    try {
      await api.put(`/settings/${settingKey}`, {
        value: selectedValue,
      });
      toast.success(i18n.t("settings.success"), {
        style: {
          backgroundColor: "#D4EADD",
          color: "#64A57B",
        },
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response.data.error;
      toast({
        variant: "destructive",
        title: errorMsg,
      });
    }
  };

  const getSettingValue = (key) => {
    const { value } = settings.find((s) => s.key === key);
    return value;
  };
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const handleMessage = (e) => {
    setOpeningHours({ ...openingHours, message: e.target.value });
  };

  return (
    <div>
      <Stack p={2} spacing={2}>
        <Tabs
          value={value}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons={false}
        >
          <Tab label="Horário de funcionamento" />
          <Tab label="Usuários" />
          <Tab label="Departamentos" />
          <Tab label="Tags" />
          <Tab label="Respostas Rápidas" />
          <Tab label="Api" />
        </Tabs>

        <TabPanel sx={{ height: "calc(100vh - 98px)" }} index={0} value={value}>
          <Stack p={2}>
            <Stack pt={0.5} spacing={2}>
              <Typography variant="h5">Horário de funcionamento</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Dias da semana</TableCell>
                    <TableCell align="center">Aberto</TableCell>
                    <TableCell align="center">Início</TableCell>
                    <TableCell align="center">Final</TableCell>
                    <TableCell align="center">Início</TableCell>
                    <TableCell align="center">Final</TableCell>
                    <TableCell align="center">Configurações</TableCell>
                  </TableRow>
                </TableHead>
               {/*  <TableBody>
                  {openingHours?.days?.length
                    ? openingHours?.days.map((day, i) => (
                        <TableRow>
                          <TableCell
                            component="th"
                            scope="row"
                            style={{ borderBottom: "none" }}
                          >
                            <ListItem>
                              <Typography variant="body2">
                                {day.label}
                              </Typography>
                            </ListItem>
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={day.open}
                              onClick={() => {
                                var newState = openingHours;
                                newState.days[day.index].open = !day.open;
                                setOpeningHours({ ...newState });
                              }}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <StyledTimePicker
                              value={dayjs(day.start1)}
                              onChange={(date) => {
                                var newState = openingHours;
                                newState.days[day.index].start1 = date;
                                setOpeningHours({ ...newState });
                              }}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <StyledTimePicker
                              value={dayjs(day.end1)}
                              onChange={(date) => {
                                var newState = openingHours;
                                newState.days[day.index].end1 = date;
                                setOpeningHours({ ...newState });
                              }}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <StyledTimePicker
                              value={dayjs(day.start2)}
                              onChange={(date) => {
                                var newState = openingHours;
                                newState.days[day.index].start2 = date;
                                setOpeningHours({ ...newState });
                              }}
                            />
                          </TableCell>

                          <TableCell align="center">
                            <StyledTimePicker
                              value={dayjs(day.end2)}
                              onChange={(date) => {
                                var newState = openingHours;
                                newState.days[day.index].end2 = date;
                                setOpeningHours({ ...newState });
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {day.index === 0 && (
                              <Button
                                onClick={() => replicateDays(openingHours)}
                                startIcon={<CopySimple size={24} />}
                              >
                                Replicar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    : null}
                </TableBody> */}
              </Table>

              <Stack spacing={1}>
                <Typography variant="subtitle1">
                  Mensagem de ausência
                </Typography>

                <Stack direction={"row"} spacing={2}>
                  <TextField
                    defaultValue={openingHours.message}
                    onChange={handleMessage}
                    placeholder={i18n.t("scheduleModal.labels.description")}
                    fullWidth
                    multiline
                    maxRows={2}
                    minRows={2}
                  />
                  <Button
                    variant="contained"
                    onClick={() => updateOpeningHours()}
                  >
                    Salvar horário
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </TabPanel>

        <TabPanel sx={{ height: "calc(100vh - 98px)" }} index={1} value={value}>
          <Users />
        </TabPanel>

        <TabPanel sx={{ height: "calc(100vh - 98px)" }} index={2} value={value}>
          <Queues />
        </TabPanel>
        <TabPanel sx={{ height: "calc(100vh - 98px)" }} index={3} value={value}>
          <Tags />
        </TabPanel>
        <TabPanel sx={{ height: "calc(100vh - 98px)" }} index={4} value={value}>
          <QuickAnswers />
        </TabPanel>

        <TabPanel sx={{ height: "calc(100vh - 98px)" }} index={5} value={value}>
          <Stack direction={"row"} spacing={2} p={2} alignItems={"end"}>
            <Stack flex={1}>
              <Typography variant="body2">
                {i18n.t("settings.settings.userCreation.name")}
              </Typography>
              <Select
                margin="dense"
                variant="outlined"
                native
                id="userCreation-setting"
                name="userCreation"
                value={
                  settings &&
                  settings.length > 0 &&
                  getSettingValue("userCreation")
                }
                /* className={classes.settingOption} */
                onChange={handleChangeSetting}
              >
                <option value="enabled">
                  {i18n.t("settings.settings.userCreation.options.enabled")}
                </option>
                <option value="disabled">
                  {i18n.t("settings.settings.userCreation.options.disabled")}
                </option>
              </Select>
            </Stack>
            <Stack flex={1}>
              <Typography variant="body2">
                {i18n.t("settings.settings.createTicket.name")}
              </Typography>
              <Select
                margin="dense"
                variant="outlined"
                native
                id="ticketCreate-setting"
                name="ticketCreate"
                value={
                  settings &&
                  settings.length > 0 &&
                  getSettingValue("ticketCreate")
                }
                /* className={classes.settingOption} */
                onChange={handleChangeSetting}
              >
                <option value="enabled">
                  {i18n.t("settings.settings.createTicket.options.enabled")}
                </option>
                <option value="disabled">
                  {i18n.t("settings.settings.createTicket.options.disabled")}
                </option>
              </Select>
            </Stack>

            <Stack flex={1}>
              <TextField
                id="api-token-setting"
                readOnly
                label="Token Api"
                margin="dense"
                variant="outlined"
                fullWidth
                value={
                  settings &&
                  settings.length > 0 &&
                  getSettingValue("userApiToken")
                }
              />
            </Stack>
          </Stack>
        </TabPanel>
      </Stack>
    </div>
  );
};

export default Settings;
