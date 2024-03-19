import React, { useContext, useEffect, useRef, useState } from "react";

import Badge from "@mui/material/Badge";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";

import NewTicketModal from "../NewTicketModal";
import TabPanel from "../TabPanel";
import TicketsList from "../TicketsList";

import { AuthContext } from "../../context/Auth/AuthContext";
import TicketsQueueSelect from "../TicketsQueueSelect";
import {
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { Chat, ChatsCircle, MagnifyingGlass } from "@phosphor-icons/react";
import { Switch, styled } from "@mui/material";
const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 42,
  height: 17,
  padding: 0,
  display: "flex",
  "&:active": {
    "& .MuiSwitch-thumb": {
      width: 15,
    },
    "& .MuiSwitch-switchBase.Mui-checked": {
      transform: "translateX(20px)",
    },
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      transform: "translateX(25px)",
      color: "#fff",
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor:
          theme.palette.mode === "dark"
            ? theme.palette.primary.main
            : theme.palette.primary.main,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "0 2px 4px 0 rgb(0 35 11 / 20%)",
    width: 12,
    height: 12,
    borderRadius: 8,
    transition: theme.transitions.create(["width"], {
      duration: 200,
    }),
  },
  "& .MuiSwitch-track": {
    borderRadius: 20 / 2,
    opacity: 1,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,.35)"
        : "rgba(0,0,0,.25)",
    boxSizing: "border-box",
  },
}));
const TicketsManager = () => {
  const theme = useTheme();
  const [tab] = useState("open");
  const [tabOpen, setTabOpen] = useState("open");
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const [filter, setFilter] = useState("");

  const { user } = useContext(AuthContext);
  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const userQueueIds = user?.queues?.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

  useEffect(() => {
    if (user.profile.toUpperCase() === "ADMIN") {
      setShowAllTickets(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChangeFilter = (event) => {
    setFilter(event.target.value);
  };

  /*   useEffect(() => {
    if (tab === "search") {
      searchInputRef.current.focus();
    }
  }, [tab]); */

  const handleChangeTabOpen = (e, newValue) => {
    setTabOpen(newValue);
  };

  const applyPanelStyle = (status) => {
    if (tabOpen !== status) {
      return { display: "none" };
    }
  };

  return (
    <>
      <NewTicketModal
        modalOpen={newTicketModalOpen}
        onClose={(e) => setNewTicketModalOpen(false)}
      />
      <Stack
        height={"100%"}
        width={360}
        border={1}
        padding={1}
        gap={2}
        borderColor={theme.palette.background.paper}
        sx={{
          width: { xs: "100vw", sm: 360 } ,
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background.default,
          boxShadow: "0px 0px 2px rgba(0,0,0, 0.25)",
        }}
      >
        <Button
          variant="contained"
          onClick={() => setNewTicketModalOpen(true)}
          size="medium"
        >
          Iniciar novo atendimento
          <ChatsCircle style={{ paddingLeft: "3px" }} size={24} />
        </Button>
        <Stack flexDirection={"row"} gap={2}>
          <TextField
            value={filter}
            fullWidth
            size="small"
            onChange={handleInputChangeFilter}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MagnifyingGlass size={22} />
                </InputAdornment>
              ),
            }}
          />
          {user.profile === "admin" && (
            <Stack alignItems={"center"}>
              <Typography variant="caption">Todos</Typography>
              <AntSwitch
                size="small"
                checked={showAllTickets}
                onChange={() => setShowAllTickets((prevState) => !prevState)}
                name="showAllTickets"
                color="primary"
              />
            </Stack>
          )}
          <TicketsQueueSelect
            selectedQueueIds={selectedQueueIds}
            userQueues={user?.queues}
            onChange={(values) => setSelectedQueueIds(values)}
            s
          />
        </Stack>

        <TabPanel value={tab} name="open">
          <Tabs
            value={tabOpen}
            onChange={handleChangeTabOpen}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
            scrollButtons={false}
          >
            <Tab
              label={<Badge badgeContent={openCount}>Atendendo</Badge>}
              value={"open"}
            />
            <Tab
              label={<Badge badgeContent={pendingCount}>Aguardando</Badge>}
              value={"pending"}
            />
          </Tabs>

          <TicketsList
            filter={filter}
            setFilter={setFilter}
            status="open"
            showAll={showAllTickets}
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setOpenCount(val)}
            style={applyPanelStyle("open")}
          />
          <TicketsList
            filter={filter}
            setFilter={setFilter}
            status="pending"
            selectedQueueIds={selectedQueueIds}
            updateCount={(val) => setPendingCount(val)}
            style={applyPanelStyle("pending")}
          />
        </TabPanel>
      </Stack>
    </>
  );
};

export default TicketsManager;
