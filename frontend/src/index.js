import React from "react";
import ReactDOM from "react-dom/client";
import "./scrollbar.css";
import App from "./App";
import SettingsProvider from "./context/SettingsContext";
import { BrowserRouter } from "react-router-dom";
ReactDOM.createRoot(document.getElementById("root")).render(
  <SettingsProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </SettingsProvider>
);
