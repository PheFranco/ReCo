import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./style/global.css";

const root = document.getElementById("root");
if (root) {
  try {
    createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error("Render error:", err);
    root.innerHTML = `<pre style="color: red; padding: 1rem; white-space: pre-wrap">Render error:\n${String(err)}</pre>`;
  }
} else {
  console.error("Root element not found");
}
