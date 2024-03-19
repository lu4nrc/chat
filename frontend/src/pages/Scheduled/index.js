import React, { useEffect, useState } from "react";

import Typography from "@mui/material/Typography";

import ScheduleCancelModal from "../../components/ScheduleCancelModal/index";
import ScheduledDetailsModal from "../../components/ScheduleDetailsModal";
import ScheduleModal from "../../components/ScheduleModal";
import toastError from "../../errors/toastError";
import api from "../../services/api";

import { Box, Grid, Skeleton, Stack } from "@mui/material";
import "./css/calendarStyle.css";

import moment from "moment";
import "moment/locale/pt-br";
import { Calendar, momentLocalizer } from "react-big-calendar";

function SkeletonCalendar() {
  return (
    <Stack sx={{ flexGrow: 1 }} spacing={1.5}>
      <Stack justifyContent={"space-between"} direction="row">
        <Skeleton width={200} height={50}/>
        <Skeleton width={200}/>
        <Skeleton width={200}/>
      </Stack>
      <Grid container>
        {Array.from({ length: 7 }, (_, index) => (
          <Grid item key={index} xs={1.7}>
            <Box sx={{ border: "1px solid rgba(128, 128, 128, 0.2)", paddingLeft: 2 }}>
              <Skeleton width={80} />
            </Box>
          </Grid>
        ))}
        {Array.from({ length: 35 }, (_, index) => (
          <Grid item key={index} xs={1.7}>
            <Box sx={{ border: "1px solid rgba(128, 128, 128, 0.2)", height: 110, padding: 2 }}>
              <Skeleton />
              <Skeleton width={80} />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}

moment.locale("pt-br");

const localizer = momentLocalizer(moment);

const messages = {
  allDay: "Dia inteiro",
  previous: "Anterior",
  next: "Próximo",
  today: "Hoje",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Evento", // or "Eventos"
  noEventsInRange: "Não há eventos neste intervalo",
  showMore: (total) => `+ ${total} mais`,
};

const formats = {
  dateFormat: "DD",
  dayFormat: (date, culture, localizer) =>
    localizer.format(date, "DD", culture),
  timeGutterFormat: (date, culture, localizer) =>
    localizer.format(date, "HH:mm", culture),
  selectRangeFormat: ({ start, end }, culture, localizer) =>
    `${localizer.format(start, "DD", culture)} - ${localizer.format(
      end,
      "DD",
      culture
    )}`,
  eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
    `${localizer.format(start, "HH:mm", culture)} - ${localizer.format(
      end,
      "HH:mm",
      culture
    )}`,
  dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
    `${localizer.format(start, "DD", culture)} - ${localizer.format(
      end,
      "DD",
      culture
    )}`,
};

const Scheduled = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  const [scheduleModal, setScheduleModal] = useState(false);

  const [scheduleCancelModal, setScheduleCancelModal] = useState(false);
  const [scheduleDetailsModal, setScheduleDetailsModal] = useState(false);

  const [scheduled, setScheduled] = useState({});
  const [scheduleds, setScheduleds] = useState([]);

  const handleOpenScheduleModal = (slotInfo) => {
    setSelectedDate(slotInfo.start);
    setScheduleModal(true);
  };
  const handleClosedScheduleModal = () => {
    setScheduleModal(false);
  };
  const handleOpenScheduleCancelModal = (scheduled) => {
    setScheduled(scheduled);
    setScheduleCancelModal(true);
  };
  const handleClosedScheduleCancelModal = () => {
    setScheduleCancelModal(false);
  };
  const handleOpenScheduleDetailsModal = (scheduled) => {
    setScheduled(scheduled);
    setScheduleDetailsModal(true);
  };
  const handleClosedScheduleDetailsModal = () => {
    setScheduleDetailsModal(false);
  };

  const loadScheduleds = async () => {
    try {
      const scheduledsData = await api.post("/scheduleds/search");
      setScheduleds(scheduledsData.data);
        setLoading(false);  
    } catch (err) {
      toastError(err);
    }
  };

  useEffect(() => {
    const fetch = async () => {
      try {
        const scheduledsData = await api.post("/scheduleds/search");
        setScheduleds(scheduledsData.data);
          setLoading(false);  
      } catch (err) {
        toastError(err);
      }
    };
    fetch();
  }, []);

  return (
    <Stack direction={"column"} height={"100vh"} spacing={2} p={2}>
      <Typography variant="h5">Agendamentos</Typography>
      <Stack flex={1} spacing={2}>
        {loading ? (
          <SkeletonCalendar />
        ) : (
          <Calendar
            messages={messages}
            formats={formats}
            localizer={localizer}
            /* events={events} */
            events={scheduleds.map((el) => {
              el.startDate = new Date(el.startDate);
              el.endDate = new Date(el.endDate);
              return el;
            })}
            startAccessor="startDate"
            endAccessor="endDate"
            onSelectSlot={(slotInfo) => {
              const today = new Date();
              if (slotInfo.start < today.setDate(today.getDate() - 1)) {
                // Disable selection for past dates

                return;
              }
              // Allow selection for future dates
              // Your custom logic here
              handleOpenScheduleModal(slotInfo); // Your custom handler for slot selection
            }}
            onSelectEvent={handleOpenScheduleDetailsModal}
            selectable={true}
            style={{ height: "100%" }}
          />
        )}
      </Stack>

      <ScheduleCancelModal
        openStatus={scheduleCancelModal}
        handleClose={handleClosedScheduleCancelModal}
        value={scheduled}
        callback={loadScheduleds}
      />
      <ScheduleModal
        selectedDate={selectedDate}
        openStatus={scheduleModal}
        handleClose={handleClosedScheduleModal}
        callback={loadScheduleds}
      />
      <ScheduledDetailsModal
        openStatus={scheduleDetailsModal}
        handleClose={handleClosedScheduleDetailsModal}
        value={scheduled}
        callback={loadScheduleds}
        openCancelModal={handleOpenScheduleCancelModal}
      />
    </Stack>
  );
};

export default Scheduled;
