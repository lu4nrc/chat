import { Navigate, createBrowserRouter, useRoutes } from "react-router-dom";
import LoggedInLayout from "../layout";
import Dashboard from "../pages/Dashboard/";

import Login from "../pages/Login/";
import Connections from "../pages/Connections/";
import Settings from "../pages/Settings/";
import Users from "../pages/Users";
import Contacts from "../pages/Contacts/";
import QuickAnswers from "../pages/QuickAnswers/";
import Queues from "../pages/Queues/";

import { AuthProvider, useAuthContext } from "../context/Auth/AuthContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import Transmission from "../pages/Transmission";
import { LocalizationProvider } from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import "dayjs/locale/pt-br";
import ErrorPage from "../pages/error";

import Search from "../pages/Search";
import PanelPage from "../pages/Panel";
import { ToastContainer } from "react-toastify";
import ThemeProvider from "@/components/theme/theme-provider";
import Ticket from "@/components/Ticket";
import "react-toastify/dist/ReactToastify.css";
import Chat from "../pages/Chat";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

const PrivateRoute = ({ element }) => {
  const { isAuth } = useAuthContext();

  return isAuth ? element : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: (
      <AuthProvider>
        <Toaster />
        <Login />
      </AuthProvider>
    ),
  },
  {
    path: "/",
    element: (
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="pt-br"
          >
            <ToastContainer /> {/* Remover em breve react-toastify*/}
            <TooltipProvider>
              <PrivateRoute element={<LoggedInLayout />} />
            </TooltipProvider>
          </LocalizationProvider>
        </ThemeProvider>
      </AuthProvider>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/tickets",
        element: <Chat />,
        children: [
          {
            path: ":ticketId",
            element: <Ticket />,
          },
        ],
      },
      {
        path: "/connections",
        element: (
          <WhatsAppsProvider>
            <Connections />
          </WhatsAppsProvider>
        ),
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
]);

export default router;
