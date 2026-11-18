import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./ui/App";
import {
  defaultColorTheme,
  defaultPracticeFont,
  readColorTheme,
  readPracticeFont,
} from "./storage/settingsStorage";
import { readAppPreferences } from "./storage/appPreferences";
import "./ui/styles.css";

const rootElement = document.getElementById("root");

if (rootElement === null) {
  throw new Error("The app root element is missing.");
}

document.documentElement.dataset.colorTheme = readColorTheme() ?? defaultColorTheme;
const appPreferences = readAppPreferences().value;
document.documentElement.dataset.practiceLanguage = appPreferences.practiceLanguage;
document.documentElement.lang = appPreferences.interfaceLanguage;
document.documentElement.dataset.practiceFont = readPracticeFont(appPreferences.practiceLanguage) ?? defaultPracticeFont;

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
