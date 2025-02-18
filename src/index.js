import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "styled-components";
import theme from "./theme";
import "./index.css";
import SpringBoard from "./SpringBoard";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ThemeProvider theme={theme}>
    <SpringBoard />
  </ThemeProvider>
);
