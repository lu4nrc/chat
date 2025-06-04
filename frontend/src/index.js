import React from "react";
import ReactDOM from "react-dom/client";
import "./scrollbar.css";

import "./index.css";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'; // Import TanStack Query
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'; // Import Devtools

import router from "./routes";

// Create a client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
