import React from "react";
import ReactDOM from "react-dom/client";
import "./scrollbar.css";
import App from "./App";
import SettingsProvider from "./context/SettingsContext";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "./components/ui/tooltip";
ReactDOM.createRoot(document.getElementById("root")).render(
  <SettingsProvider>
    <BrowserRouter>
      <TooltipProvider>
        <App />
      </TooltipProvider>
    </BrowserRouter>
  </SettingsProvider>
);
