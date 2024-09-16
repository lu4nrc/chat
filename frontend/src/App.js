import React from "react";
import ThemeProvider from "./components/theme/theme-provider";
import Router from "./routes";

import { AuthProvider } from "./context/Auth/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

/* https://shadcnui-expansions.typeart.cc/docs/infinite-scroll */

const App = () => {
  return (
    <AuthProvider>
      <ToastContainer />
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router />
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
