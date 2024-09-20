import React, { useEffect, useState } from "react";
import openSocket from "../../services/socket-io";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { registerLocale } from "react-datepicker";

import api from "../../services/api";
import { i18n } from "../../translate/i18n.js";

import { CopySimple } from "@phosphor-icons/react";
import ptBR from "date-fns/locale/pt-BR";
import dayjs from "dayjs";
import Queues from "../Queues";
import QuickAnswers from "../QuickAnswers";
import Tags from "../Tags";
import Users from "../Users";

import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

registerLocale("pt-br", ptBR);

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

  const handleChangeSetting = async (selectedValue, settingKey) => {
    try {
      await api.put(`/settings/${settingKey}`, {
        value: selectedValue,
      });
      toast({
        variant: "success",
        title: "Configurações atualizadas com sucesso!",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Algo deu errado",
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

          <TabsContent value="openinghours"></TabsContent>
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
          <TabsContent value="api" className="grid grid-cols-3  gap-2 ">
            <div className="grid w-full items-center gap-1.5 relative pb-5">
              <Label htmlFor="name">
                {i18n.t("settings.settings.userCreation.name")}
              </Label>
              <Select
                id="userCreation-setting"
                name="userCreation"
                onValueChange={(selectedValue) =>
                  handleChangeSetting(selectedValue, "userCreation")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o tipo de usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">
                    {i18n.t("settings.settings.userCreation.options.enabled")}
                  </SelectItem>
                  <SelectItem value="disabled">
                    {i18n.t("settings.settings.userCreation.options.disabled")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-1.5 relative pb-5">
              <Label htmlFor="name">
                {i18n.t("settings.settings.createTicket.name")}
              </Label>
              <Select
                id="ticketCreate-setting"
                name="ticketCreate"
                onValueChange={(selectedValue) =>
                  handleChangeSetting(selectedValue, "ticketCreate")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Criação de atendimento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">
                    {i18n.t("settings.settings.createTicket.options.enabled")}
                  </SelectItem>
                  <SelectItem value="disabled">
                    {i18n.t("settings.settings.createTicket.options.disabled")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid w-full items-center gap-1.5 relative pb-5">
              <Label htmlFor="name">Token Api</Label>
              <p className="text-muted-foreground bg-muted py-2 text-center border w-full rounded-sm text-sm">
                {settings &&
                  settings.length > 0 &&
                  getSettingValue("userApiToken")}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
