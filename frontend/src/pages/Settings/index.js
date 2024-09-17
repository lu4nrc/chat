import React, { useEffect, useState } from "react";
import openSocket from "../../services/socket-io";

import Typography from "@mui/material/Typography";

import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody/TableBody";
import TableCell from "@mui/material/TableCell";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import ListItem from "@mui/material/ListItem";

import { Button, Card, Stack, styled } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { registerLocale } from "react-datepicker";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";

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
      <div className="flex p-1 gap-1 flex-col">
        <Tabs defaultValue="openinghours" className="w-full">
          <TabsList>
            <TabsTrigger value="openinghours">
              Horário de funcionamento
            </TabsTrigger>
            <TabsTrigger value="user">Usuários</TabsTrigger>
            <TabsTrigger value="queue">Departamentos</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
            <TabsTrigger value="quickresponses">Respostas Rápidas</TabsTrigger>
            <TabsTrigger value="api">Api</TabsTrigger>
          </TabsList>
      
          <TabsContent value="openinghours">
            {" "}
            <Stack p={2}>
              <Stack pt={0.5} spacing={2}>
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
          </TabsContent>
          <TabsContent value="user">
            <Users />
          </TabsContent>
          <TabsContent value="queue">
            <Queues />
          </TabsContent>
          <TabsContent value="tags">
            <Tags />
          </TabsContent>
          <TabsContent value="quickresponses">
            <QuickAnswers />
          </TabsContent>
          <TabsContent value="api">
            {" "}
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
          </TabsContent>
        </Tabs>
      
      </div>
    </div>
  );
};

export default Settings;
