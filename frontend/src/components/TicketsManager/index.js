import React, { useContext, useEffect, useRef, useState } from "react";

import NewTicketModal from "../NewTicketModal";

import TicketsList from "../TicketsList";

import { AuthContext } from "../../context/Auth/AuthContext";
import TicketsQueueSelect from "../TicketsQueueSelect";

import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";
import { Input } from "../ui/input";
import { Switch } from "../ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const TicketsManager = () => {
  const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
  const [showAllTickets, setShowAllTickets] = useState(false);
  const searchInputRef = useRef();
  const [filter, setFilter] = useState("");

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

              <span className="sr-only">Dashboard</span>
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
        <TicketsQueueSelect
          selectedQueueIds={selectedQueueIds}
          userQueues={user?.queues}
          onChange={(values) => setSelectedQueueIds(values)}
        />
      </div>

      <div>
        <div className="grid grid-cols-2 m-1 gap-2 bg-muted rounded-full overflow-hidden">
          <Button
            variant={activeTab === "open" ? "" : "ghost"}
            onClick={() => setActiveTab("open")}
          >
            Em atendimento
            {openCount ? (
              <span className="ml-2">{openCount}</span>
            ) : (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            )}
          </Button>
          <Button
            variant={activeTab === "pending" ? "" : "ghost"}
            onClick={() => setActiveTab("pending")}
          >
            Pendentes
            {pendingCount ? (
              <span className="ml-2">{pendingCount}</span>
            ) : (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            )}
          </Button>
        </div>

        <TicketsList
          filter={filter}
          setFilter={setFilter}
          status="open"
          showAll={showAllTickets}
          selectedQueueIds={selectedQueueIds}
          updateCount={(val) => setOpenCount(val)}
          activeTab={activeTab}
        />

        <TicketsList
          filter={filter}
          setFilter={setFilter}
          status="pending"
          selectedQueueIds={selectedQueueIds}
          updateCount={(val) => setPendingCount(val)}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
};

export default TicketsManager;
