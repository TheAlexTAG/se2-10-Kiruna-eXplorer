import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { GlobalAuthProvider } from "./contexts/GlobalStateProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <GlobalAuthProvider>
        <App />
      </GlobalAuthProvider>
    </BrowserRouter>
  </StrictMode>
);
