import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import "./index.css";
import { AskiMateAuthProvider } from "@/contexts/AskiMateAuthContext";

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <AskiMateAuthProvider>
      <App />
    </AskiMateAuthProvider>
  </HelmetProvider>
);
