import { Navigate, useRoutes } from "react-router-dom";
import LoggedInLayout from "../layout";
import Dashboard from "../pages/Dashboard/";
import Tickets from "../pages/Tickets/";
import Login from "../pages/Login/";
import Connections from "../pages/Connections/";
import Settings from "../pages/Settings/";
import Users from "../pages/Users";
import Contacts from "../pages/Contacts/";
import QuickAnswers from "../pages/QuickAnswers/";
import Queues from "../pages/Queues/";

import { useAuthContext } from "../context/Auth/AuthContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import Transmission from "../pages/Transmission";
import { LocalizationProvider } from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import "dayjs/locale/pt-br";
import ErrorPage from "../pages/error";
import NewPainel from "../components/NewPainel";
import Search from "../pages/Search";
import PanelPage from "../pages/Panel";
// import SettingsDrawer from "../components/settings/drawer";

function Router() {
  const { isAuth } = useAuthContext();

  return useRoutes([
    {
      path: "/login",
      element: isAuth ? <Navigate to="/" replace /> : <Login />,
    },
    {
      path: "/",
      element: isAuth ? (
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
          <WhatsAppsProvider>
            <LoggedInLayout />
            {/* <SettingsDrawer /> */}
          </WhatsAppsProvider>
        </LocalizationProvider>
      ) : (
        <Navigate to="/login" replace />
      ),
      children: [
        {
          path: "/",
          element: <Dashboard />,
        },
        {
          path: "/tickets/:ticketId?",
          element: <Tickets />,
        },
        {
          path: "/connections",
          element: <Connections />,
        },
        {
          path: "/contacts",
          element: <Contacts />,
        },
        {
          path: "/search",
          element: <Search />,
        },
        {
          path: "/users",
          element: <Users />,
        },
        {
          path: "/quickAnswers",
          element: <QuickAnswers />,
        },
        {
          path: "/Settings",
          element: <Settings />,
        },
        {
          path: "/Queues",
          element: <Queues />,
        },
   
        {
          path: "/Transmission",
          element: <Transmission />,
        },
        {
          path: "/Panel",
          element: <PanelPage />,
        },
        {
          path: "/404",
          element: <ErrorPage />,
        },
      ],
    },
    { path: "*", element: <Navigate to="/404" replace /> },
  ]);
}

export default Router;
