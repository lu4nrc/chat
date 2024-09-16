import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React, { useContext, useEffect, useReducer } from "react";

import { ArrowBackOutlined } from "@mui/icons-material/";
import AddAlertIcon from "@mui/icons-material/AddAlert";
import ArrowRightAltIcon from "@mui/icons-material/ArrowRightAlt";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import ptBR from "date-fns/locale/pt-BR";
import { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

import { Stack } from "@mui/material";
import { DateTimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { AuthContext } from "../../context/Auth/AuthContext";
import AutocompleteAsyncPagination from "./AutocompleteAsyncPagination";
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 512,
  borderRadius: 1,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 2,
};

registerLocale("pt-br", ptBR);
const steps = ["Dados de Agendamento", "Participantes"];

const ScheduleModal = ({
  handleClose,
  openStatus,
  scheduled,
  callback,
  selectedDate,
}) => {
  var err = {
    response: {
      data: {
        message: "",
      },
    },
  };
  const { user } = useContext(AuthContext);
  const [activeStep, setActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set());
  const [startDate, setStartDate] = React.useState(new Date());
  const [endDate, setEndDate] = React.useState(new Date());
  const [users, setUsers] = React.useState([]);
  const [anfitriao, setAnfitriao] = React.useState([]);
  const [atendentes, setAtendentes] = React.useState([]);
  const [participantes, setParticipantes] = React.useState([]);

  const [topico, setTopico] = React.useState("");
  const [locale, setLocale] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [typeEvent] = React.useState(1);
  const [recorrencia] = React.useState(1);
  const [level] = React.useState(1);
  const [notificationType, setNotificationType] = React.useState([1]);
  const [notifyDate, setNotifyDate] = React.useState(startDate);

  const [datesNotify, setDatesNotify] = React.useState([]);

  const [searchParam] = React.useState("");
  const [, setLoading] = React.useState(false);
  const reducer = (state, action) => {
    if (action.type === "LOAD_CONTACTS") {
      const contacts = action.payload;
      const newContacts = [];

      contacts.forEach((contact) => {
        const contactIndex = state.findIndex((c) => c.id === contact.id);
        if (contactIndex !== -1) {
          state[contactIndex] = contact;
        } else {
          newContacts.push(contact);
        }
      });

      return [...state, ...newContacts];
    }
  };

  const [open] = React.useState(false);
  const [, setOptions] = React.useState([]);
  const [pageNumber] = React.useState(1);
  const [, setHasMore] = React.useState(true);
  const [, dispatch] = useReducer(reducer, []);

  const fetchOptions = async (query, page) => {
    try {
      setLoading(true);
      const { data } = await api.get("/contacts/", {
        params: { searchParam: query, pageNumber: page },
      });
      dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
      setHasMore(data.hasMore);
      setLoading(false);
    } catch (err) {
              const errorMsg =
            err.response?.data?.message || err.response.data.error;
          toast({
            variant: "destructive",
            title: errorMsg,
          });
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    fetchOptions("", pageNumber);
  }, [open, pageNumber]);

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };
  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }

    if (!topico) {
      err.response.data.message = "Insira o título";
              const errorMsg =
            err.response?.data?.message || err.response.data.error;
          toast({
            variant: "destructive",
            title: errorMsg,
          });
    } else if (!locale) {
      err.response.data.message = "Insira o local da reunião";
              const errorMsg =
            err.response?.data?.message || err.response.data.error;
          toast({
            variant: "destructive",
            title: errorMsg,
          });
    } else if (!description) {
      err.response.data.message = "Insira a descrição";
              const errorMsg =
            err.response?.data?.message || err.response.data.error;
          toast({
            variant: "destructive",
            title: errorMsg,
          });
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setSkipped(newSkipped);
    }
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const saveSchedule = async () => {
    let newSkipped = skipped;

    if (anfitriao.length <= 0) {
      err.response.data.message = "Insira um anfitrião da reunião";
              const errorMsg =
            err.response?.data?.message || err.response.data.error;
          toast({
            variant: "destructive",
            title: errorMsg,
          });
    } else if (participantes.length <= 0) {
      err.response.data.message = "Insira algum usuário na reunião";
              const errorMsg =
            err.response?.data?.message || err.response.data.error;
          toast({
            variant: "destructive",
            title: errorMsg,
          });
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setSkipped(newSkipped);
    }

    var newScheduled = {
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      externals: users,
      anfitriao: anfitriao[0],
      attendants: participantes,
      title: topico,
      locale: locale,
      description: description,
      typeEvent: typeEvent,
      recorrency: recorrencia,
      level: level,
      notificationType: notificationType,
      datesNotify: datesNotify,
      user: user,
    };

    if (scheduled?.id) {
      try {
        await api.put(`scheduleds/${scheduled.id}`, newScheduled);

        callback();

        handleCloseModal();
      } catch (err) {
                const errorMsg =
            err.response?.data?.message || err.response.data.error;
          toast({
            variant: "destructive",
            title: errorMsg,
          });
      }
    } else {
      try {
        await api.post("scheduleds", newScheduled);

        callback();

        handleCloseModal();
      } catch (err) {
                const errorMsg =
            err.response?.data?.message || err.response.data.error;
          toast({
            variant: "destructive",
            title: errorMsg,
          });
      }
    }
  };

  const handleChangeAnfitriao = (event) => {
    const {
      target: { value },
    } = event;

    anfitriao.length > 0 ? setAnfitriao([]) : setAnfitriao(value);
  };

  const removeDateNotify = (value) => {
    var array = datesNotify;
    const index = array.indexOf(value);
    if (index > -1) {
      array.splice(index, 1);
    }

    setDatesNotify([...array]);
  };
  useEffect(() => {
    if (scheduled !== undefined) {
      setTopico(scheduled.title);
      setStartDate(new Date(scheduled.startDate));
      setEndDate(new Date(scheduled.endDate));
      setLocale(scheduled.locale);
      setDescription(scheduled.description);

      setAnfitriao([scheduled.anfitriao]);
      setParticipantes(scheduled.attendants);
      setNotifyDate(new Date(scheduled.notifyDate));
      setNotificationType(scheduled.notificationType);
      setDatesNotify(scheduled.datesNotify);

      setUsers(scheduled.externals);
    } else {
      setStartDate(selectedDate);
      setEndDate(selectedDate);
    }

    const delayDebounceFn = setTimeout(() => {
      const fetchContacts = async () => {
        try {
          const { data } = await api.get("contacts", {
            params: { searchParam },
          });
          const sortedContacts = data.contacts.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setOptions(sortedContacts);

          setLoading(false);
        } catch (err) {
          setLoading(false);
                  const errorMsg =
            err.response?.data?.message || err.response.data.error;
          toast({
            variant: "destructive",
            title: errorMsg,
          });
        }
      };
      const fetchUsers = async () => {
        try {
          const { data } = await api.get("/users/", {});

          setAtendentes(data.users);
          setLoading(false);
        } catch (err) {
          setLoading(false);
                  const errorMsg =
            err.response?.data?.message || err.response.data.error;
          toast({
            variant: "destructive",
            title: errorMsg,
          });
        }
      };

      fetchUsers();
      fetchContacts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, scheduled, openStatus, selectedDate]);

  const handleCloseModal = () => {
    setActiveStep(0);
    setSkipped(new Set());
    setStartDate(new Date());
    setEndDate(new Date());
    handleClose();
  };

  return (
    <>
      <Modal
        open={openStatus}
        onClose={handleCloseModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        sx={{ justifyContent: "center" }}
      >
        <Box sx={style}>
          <Stack spacing={2}>
            <Stepper activeStep={activeStep}>
              {steps.map((label, index) => {
                const stepProps = {};
                const labelProps = {};

                if (isStepSkipped(index)) {
                  stepProps.completed = false;
                }
                return (
                  <Step key={index} {...stepProps}>
                    <StepLabel {...labelProps}>{label}</StepLabel>
                  </Step>
                );
              })}
            </Stepper>
            {activeStep === 0 ? (
              <Stack spacing={2}>
                <Stack spacing={0.5}>
                  <Typography variant="body1">
                    <strong>Título</strong>
                  </Typography>
                  <TextField
                    size="small"
                    helperText="Por favor, insira um título!"
                    defaultValue={topico}
                    onChange={(e) => setTopico(e.target.value)}
                    placeholder="Adicionar Título"
                    fullWidth
                  />
                </Stack>
                <Stack spacing={0.5}>
                  <Typography variant="body1">
                    <strong>Selecionar Data e Hora </strong>
                  </Typography>
                  <Stack direction={"row"} spacing={1} alignItems={"center"}>
                    <DateTimePicker
                      disablePast
                      value={dayjs(startDate)}
                      onChange={(newStartDate) => setStartDate(newStartDate)}
                      label="início"
                    />

                    <Typography variant="body1" style={{ textAlign: "center" }}>
                      Até
                    </Typography>

                    <DateTimePicker
                      disablePast
                      value={dayjs(startDate)}
                      onChange={(newEndDate) => setEndDate(newEndDate)}
                      label="finalização"
                    />
                  </Stack>
                </Stack>
                <Stack spacing={0.5}>
                  <Typography variant="body1">
                    <strong>Local</strong>
                  </Typography>

                  <TextField
                    size="small"
                    InputProps={{}}
                    defaultValue={locale}
                    onChange={(e) => setLocale(e.target.value)}
                    placeholder={i18n.t("scheduleModal.labels.locale")}
                    fullWidth
                  />
                </Stack>

                <Stack spacing={0.5}>
                  <Typography variant="body1">
                    <strong>Descrição</strong>
                  </Typography>
                  <TextField
                    size="small"
                    InputProps={{}}
                    defaultValue={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Insira uma descrição para o agendamento, por exemplo, tópico de reunião ou detalhes relevantes"
                    fullWidth
                    multiline
                    minRows={2}
                    maxRows={2}
                  />
                </Stack>

                <Button variant="contained" onClick={() => handleNext()}>
                  Ir para participantes{" "}
                  <ArrowRightAltIcon style={{ paddingLeft: 5, fontSize: 35 }} />
                </Button>
              </Stack>
            ) : (
              <Stack spacing={2}>
                <Stack>
                  <Stack>
                    <Typography variant="subtitle1" fontWeight={"bold"}>
                      Anfitrião
                    </Typography>
                    <FormControl style={{ height: 44, width: "100%" }}>
                      <Select
                        style={{ height: "100%" }}
                        fullWidth
                        labelId="demo-multiple-chip-label"
                        id="demo-multiple-chip"
                        multiple
                        value={anfitriao}
                        onChange={handleChangeAnfitriao}
                        renderValue={(selected) => (
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            {selected.map((value) => (
                              <Chip key={value.id} label={value.name} />
                            ))}
                          </Box>
                        )}
                      >
                        {atendentes.map((value) => (
                          <MenuItem key={value.id} value={value}>
                            {value.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                </Stack>
                <Stack>
                  <Stack spacing={0.5}>
                    <Typography variant="body1" fontWeight={"bold"}>
                      Participantes
                    </Typography>

                    <AutocompleteAsyncPagination
                      users={users}
                      setUsers={setUsers}
                    />
                  </Stack>
                </Stack>

                <Stack>
                  <Stack spacing={1}>
                    <Typography variant="body1">
                      <strong>Notificação</strong>
                    </Typography>
                    {/*          <FormGroup
                        style={{ display: "flex", flexDirection: "row" }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              style={{
                                transform: "scale(0.7)",
                              }}
                              checked={notificationType.includes(1)}
                              onChange={() => addNotification(1)}
                            />
                          }
                          label={
                            <Typography variant="caption">Whatsapp</Typography>
                          }
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              style={{
                                transform: "scale(0.7)",
                              }}
                              checked={notificationType.includes(2)}
                              onChange={() => addNotification(2)}
                            />
                          }
                          label={
                            <Typography variant="caption">Email</Typography>
                          }
                          style={{ height: 25 }}
                        />
                      </FormGroup> */}

                    <Stack direction={"row"} spacing={1}>
                      <DateTimePicker
                        disablePast
                        defaultValue={dayjs(notifyDate)}
                        onChange={(date) => setNotifyDate(date)}
                      />
                      {/*                         <DatePicker
                          
                          selected={notifyDate}
                          onChange={(date) => setNotifyDate(date)}
                          locale="pt-br"
                          timeFormat="HH:mm"
                          timeInputLabel="Horas:"
                          showTimeInput
                          timeIntervals={10}
                          timeCaption="Horas"
                          dateFormat="d MMMM yyyy h:mm a"
                          filterTime={filterPassedTime}
                        /> */}

                      <Button
                        variant="text"
                        onClick={() => {
                          setDatesNotify([...datesNotify, notifyDate]);
                        }}
                      >
                        <Stack direction={"row"} spacing={0.5}>
                          <AddAlertIcon />
                          <Typography variant="body2">
                            Adicionar notificação
                          </Typography>
                        </Stack>
                      </Button>
                    </Stack>
                    <Stack direction={"row"} flexWrap={"wrap"} spacing={0.5}>
                      {datesNotify.map((value, i) => (
                        <Chip
                          key={i}
                          label={` ${new Date(value).toLocaleString("pt-br", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`}
                          onDelete={() => removeDateNotify(value)}
                        />
                      ))}
                    </Stack>
                  </Stack>
                </Stack>

                <Stack>
                  <Stack direction={"row"} justifyContent={"space-between"}>
                    <Button onClick={() => handleBack()}>
                      <ArrowBackOutlined />
                    </Button>

                    <Button variant="contained" onClick={() => saveSchedule()}>
                      Salvar Agendamento
                    </Button>
                  </Stack>
                </Stack>
              </Stack>
            )}
          </Stack>
        </Box>
      </Modal>
    </>
  );
};
export default ScheduleModal;
