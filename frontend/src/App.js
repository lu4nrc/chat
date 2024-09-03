import React from "react";
/* import ThemeProvider from "./theme"; */
import ThemeProvider from "./components/theme/theme-provider";
/* import ThemeSettings from "./components/settings"; */
import Router from "./routes";
import SettingsProvider from "./context/SettingsContext";
import { styled } from "@mui/material";
import { AuthProvider } from "./context/Auth/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

const GlobalStyles = styled("div")({
  "*::-webkit-scrollbar": {
    width: "0.4em",
  },
  "*::-webkit-scrollbar-track": {
    WebkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
  },
  "*::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(0,0,0,.1)",
    borderRadius: 5,
    visibility: "hidden",
    transition: "visibility 0.3s",
  },
  "*:hover *::-webkit-scrollbar-thumb": {
    visibility: "visible",
  },
  "*:not(:hover) *::-webkit-scrollbar-thumb": {
    visibility: "hidden",
  },
});

/* https://shadcnui-expansions.typeart.cc/docs/infinite-scroll */

const App = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <ToastContainer />
        {/* <GlobalStyles> */}
          {/* <ThemeProvider> */}
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
           {/*  <ThemeSettings> */}
              <Router />
            {/* </ThemeSettings> */}
          </ThemeProvider>
        {/* </GlobalStyles> */}
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
