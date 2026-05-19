import React from "react";
import ReactDOM from "react-dom/client";
import "@pierre/trees/web-components";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
