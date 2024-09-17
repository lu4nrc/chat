import { useContext } from "react";

import { AuthContext, useAuthContext } from "../context/Auth/AuthContext";

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

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ModeToggle from "@/components/ModeToggle";
import { Link } from "react-router-dom";

const SideBar = ({ user }) => {
  //const [connectionWarning, setConnectionWarning] = useState(false);
  const { handleLogout } = useAuthContext();
  /*   useEffect(() => {
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
  }, [whatsApps]); */

  return (
    <nav className="flex flex-col items-center border-r  gap-4 px-2 sm:py-5 bg-muted">
      {user.profile === "admin" && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white   "
            >
              <Gauge className="h-6 w-6" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">Dashboard</TooltipContent>
        </Tooltip>
      )}

      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/connections"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white"
          >
            <Wifi className="h-6 w-6" />
            <span className="sr-only">Conexões</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Conexões</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/tickets"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white"
          >
            <MessageCircleMore className="h-6 w-6" />
            <span className="sr-only">Atendimentos</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Atendimentos</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/contacts"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white"
          >
            <NotebookText className="h-6 w-6" />
            <span className="sr-only">Contatos</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Contatos</TooltipContent>
      </Tooltip>

      {/*  
     <Tooltip>
        <TooltipTrigger asChild>
          <Link
            to="/search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white"
          >
            <Search className="h-6 w-6" />
            <span className="sr-only">Pesquisar</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">Pesquisar</TooltipContent>
      </Tooltip> 
      */}

      {user.profile === "admin" && (
        <>
          {/*
           <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/panel"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white"
              >
                <Monitor className="h-6 w-6" />
                <span className="sr-only">Painel</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Painel</TooltipContent>
          </Tooltip> 
          */}

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                to="/settings"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white"
              >
                <Settings className="h-6 w-6" />
                <span className="sr-only">Configurações</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Configurações</TooltipContent>
          </Tooltip>

          {/* //TODO: Lista de transmissao */}
          {/*               <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/transmission"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-9 md:w-9 aria-[current=page]:bg-primary aria-[current=page]:text-white"
                  >
                    <Ratio className="h-6 w-6" />
                    <span className="sr-only">Listas de transmissão</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Listas de transmissão
                </TooltipContent>
              </Tooltip> */}
        </>
      )}

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
