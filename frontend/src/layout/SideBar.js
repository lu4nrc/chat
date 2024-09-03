import { useContext, useEffect, useState } from "react";

import { Can } from "../components/Can";
import { AuthContext, useAuthContext } from "../context/Auth/AuthContext";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";

import {
  Gauge,
  LogOut,
  MessageCircleMore,
  Monitor,
  NotebookText,
  Search,
  Settings,
  Wifi,
  WifiOff,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ModeToggle from "@/components/ModeToggle";

const SideBar = (props) => {
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  const [connectionWarning, setConnectionWarning] = useState(false);
  const { handleLogout } = useAuthContext();
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  return (
    <nav className="flex flex-col items-center border-r  gap-4 px-2 sm:py-5 bg-muted">
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink
                to="/"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white   "
              >
                <Gauge className="h-6 w-6" />
                <span className="sr-only">Dashboard</span>
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right">Dashboard</TooltipContent>
          </Tooltip>
        )}
      />

      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to="/connections"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white"
          >
            {connectionWarning ? (
              <WifiOff className="h-6 w-6 text-red-400 " />
            ) : (
              <Wifi className="h-6 w-6 text-emerald-400 " />
            )}
            <span className="sr-only">Conexões</span>
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side="right">Conexões</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to="/tickets"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white"
          >
            <MessageCircleMore className="h-6 w-6" />
            <span className="sr-only">Atendimentos</span>
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side="right">Atendimentos</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to="/contacts"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white"
          >
            <NotebookText className="h-6 w-6" />
            <span className="sr-only">Contatos</span>
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side="right">Contatos</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to="/search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white"
          >
            <Search className="h-6 w-6" />
            <span className="sr-only">Pesquisar</span>
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side="right">Pesquisar</TooltipContent>
      </Tooltip>
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/panel"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white"
                >
                  <Monitor className="h-6 w-6" />
                  <span className="sr-only">Painel</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">Painel</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <NavLink
                  to="/settings"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white"
                >
                  <Settings className="h-6 w-6" />
                  <span className="sr-only">Configurações</span>
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">Configurações</TooltipContent>
            </Tooltip>

            {/* //TODO: Lista de transmissao */}
            {/*               <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/transmission"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white"
                  >
                    <Ratio className="h-6 w-6" />
                    <span className="sr-only">Listas de transmissão</span>
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Listas de transmissão
                </TooltipContent>
              </Tooltip> */}
          </>
        )}
      />

      <ModeToggle />

      <Tooltip>
        <TooltipTrigger asChild>
          <div
            aria-label="sair"
            onClick={() => {
              handleLogout();
            }}
            className="absolute bottom-2 flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white"
          >
            <LogOut className="h-6 w-6" />
            <span className="sr-only">Sair</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">Sair</TooltipContent>
      </Tooltip>
    </nav>
  );
};

export default SideBar;
