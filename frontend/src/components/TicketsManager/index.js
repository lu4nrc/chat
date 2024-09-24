import React, { useContext, useEffect, useRef, useState } from "react";

import NewTicketModal from "../NewTicketModal";

import TicketsList from "../TicketsList";

import { AuthContext } from "../../context/Auth/AuthContext";
//import TicketsQueueSelect from "../TicketsQueueSelect"; //!Corrigir Selecionar filas

import { Button } from "../ui/button";
import { BotOff, LoaderCircle, Plus, Wifi } from "lucide-react";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import { cn } from "@/lib/utils";

const TicketsManager = () => {
  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const [hasMoreManageOpen, sethasMoreManageOpen] = useState(false);
  const [hasMoreManagePending, sethasMoreManagePending] = useState(false);
  const [filter, setFilter] = useState("");

  const checkConnections = (connectionsArray) => {
    // Retorna false se algum objeto no array tiver um status diferente de "CONNECTED"
    return connectionsArray.every((connection) => {
      return connection.status === "CONNECTED";
    });
  };

  const allConnected = checkConnections(whatsApps);

  const { user } = useContext(AuthContext);
  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const userQueueIds = user?.queues?.map((q) => q.id);
  const [selectedQueueIds, setSelectedQueueIds] = useState(userQueueIds || []);

  const [activeTab, setActiveTab] = useState("open");

  useEffect(() => {
    if (user.profile === "admin") {
      setShowAllTickets(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChangeFilter = (event) => {
    setFilter(event.target.value);
  };

  return (
    <div className="border-r h-screen flex flex-col gap-1  pt-1 min-w-0">
      <div className="flex justify-between items-center px-1 ">
        <h1 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
          Chats
        </h1>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              onClick={() => setNewTicketModalOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white   "
            >
              <NewTicketModal
                modalOpen={newTicketModalOpen}
                onClose={(e) => setNewTicketModalOpen(false)}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">Nova conversa</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex gap-1 px-1">
        <Input
          onChange={handleInputChangeFilter}
          value={filter}
          placeholder="Pesquisar.."
        />
        <Tooltip>
          <TooltipTrigger asChild>
            {user.profile === "admin" && (
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showAllTickets}
                  onCheckedChange={() =>
                    setShowAllTickets((prevState) => !prevState)
                  }
                  id="showAllTickets"
                />
              </div>
            )}
          </TooltipTrigger>
          <TooltipContent side="right">
            {showAllTickets ? "Somente os meus" : "Mostrar todos"}
          </TooltipContent>
        </Tooltip>
        {/*//! Preciso corrigir isso!
         <TicketsQueueSelect
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        /> */}
      </div>
      {!allConnected && (
        <div
          className={cn(
            "bg-orange-200 w-full py-6 px-2 flex items-center gap-2"
          )}
        >
          <Wifi className="bg-orange-100 rounded-full p-[4px] text-primary w-12 h-9" />
          <div>
            <p className="text-sm font-semibold">Conexão Perdida</p>
            <p className="text-sm opacity-90">
              Por favor, verifique a página de conexões para restabelecer a
              comunicação.
            </p>
          </div>
        </div>
      )}
      <div>
        <div className="grid grid-cols-2 m-1 gap-2 bg-muted rounded-full overflow-hidden">
          <Button
            variant={activeTab === "open" ? "" : "ghost"}
            onClick={() => setActiveTab("open")}
          >
            Em atendimento
            {openCount ? (
              <div className="ml-2 flex justify-center items-center">
                {hasMoreManageOpen ? <Plus className="w-4 h-4" /> : ""}
                <span className="">{openCount}</span>
              </div>
            ) : (
              <span className="ml-2">0</span>
            )}
          </Button>
          <Button
            variant={activeTab === "pending" ? "" : "ghost"}
            onClick={() => setActiveTab("pending")}
          >
            Pendentes
            {pendingCount ? (
              <span className="ml-2"> {pendingCount}</span>
            ) : (
              <span className="ml-2">0</span>
            )}
          </Button>
        </div>

        <TicketsList
          allConnected={allConnected}
          filter={filter}
          setFilter={setFilter}
          status="open"
          showAll={showAllTickets}
          selectedQueueIds={selectedQueueIds}
          updateCount={(val) => setOpenCount(val)}
          activeTab={activeTab}
          sethasMoreManage={sethasMoreManageOpen}
        />

        <TicketsList
          allConnected={allConnected}
          filter={filter}
          setFilter={setFilter}
          status="pending"
          selectedQueueIds={selectedQueueIds}
          updateCount={(val) => setPendingCount(val)}
          activeTab={activeTab}
          sethasMoreManage={sethasMoreManagePending}
        />
      </div>
    </div>
  );
};

export default TicketsManager;
