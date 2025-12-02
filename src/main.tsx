import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store/store";
import "./index.css";
import { Toaster } from "sonner";
import { checkSessionThunk } from "./store/authSlice";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
store.dispatch(checkSessionThunk()); // Para que al recargar la página se mantenga la sesión activa si el token es válido

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster richColors position="top-right" />
        </QueryClientProvider>
      </Provider>
    </BrowserRouter>
  </React.StrictMode>
);