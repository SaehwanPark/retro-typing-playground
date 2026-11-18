import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./ui/App";
import { defaultColorTheme, readColorTheme } from "./storage/settingsStorage";
import "./ui/styles.css";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("The app root element is missing.");
}

document.documentElement.dataset.colorTheme = readColorTheme() ?? defaultColorTheme;

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
