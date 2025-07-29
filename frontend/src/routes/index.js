import { Navigate, createBrowserRouter, Route, Routes } from 'react-router-dom';
import LoggedInLayout from '../layout';
import Dashboard from '../pages/Dashboard';

import Login from '../pages/Login';
import Connections from '../pages/Connections';
import Settings from '../pages/Settings';
import Users from '../pages/Users';
import Contacts from '../pages/Contacts';
import QuickAnswers from '../pages/QuickAnswers';
import Queues from '../pages/Queues';

import { AuthProvider, useAuthContext } from '../context/Auth/AuthContext';
import { WhatsAppsProvider } from '../context/WhatsApp/WhatsAppsContext';
import Transmission from '../pages/Transmission';

import 'dayjs/locale/pt-br';
import ErrorPage from '../pages/error';

import Search from '../pages/Search';
import PanelPage from '../pages/Panel';

import ThemeProvider from '@/components/theme/theme-provider';
import Ticket from '@/components/Ticket';

import Chat from '../pages/Chat';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';

const PrivateRoute = ({ children }) => {
  const { isAuth } = useAuthContext();

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <AuthProvider>
        <Toaster />
        <Login />
      </AuthProvider>
    ),
  },
  {
    path: '/',
    element: (
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <TooltipProvider>
            <PrivateRoute>
              <LoggedInLayout />
            </PrivateRoute>
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      {
        path: '/tickets',
        element: (
          <WhatsAppsProvider>
            <Chat />
          </WhatsAppsProvider>
        ),
        children: [
          {
            path: ':ticketId',
            element: <Ticket />,
          },
        ],
      },
      {
        path: '/connections',
        element: (
          <WhatsAppsProvider>
            <Connections />
          </WhatsAppsProvider>
        ),
      },
      {
        path: '/contacts',
        element: <Contacts />,
      },
      {
        path: '/search',
        element: <Search />,
      },
      {
        path: '/users',
        element: <Users />,
      },
      {
        path: '/quickAnswers',
        element: <QuickAnswers />,
      },
      {
        path: '/settings',
        element: <Settings />,
      },
      {
        path: '/queues',
        element: <Queues />,
      },
      {
        path: '/transmission',
        element: <Transmission />,
      },
      {
        path: '/panel',
        element: <PanelPage />,
      },
      {
        path: '/404',
        element: <ErrorPage />,
      },
    ],
  },
]);

export default router;
