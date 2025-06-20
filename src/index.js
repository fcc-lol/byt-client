import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider, StyleSheetManager } from "styled-components";
import isPropValid from "@emotion/is-prop-valid";
import theme from "./theme";
import "./index.css";
import SpringBoard from "./SpringBoard";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <StyleSheetManager shouldForwardProp={isPropValid}>
    <ThemeProvider theme={theme}>
      <SpringBoard />
    </ThemeProvider>
  </StyleSheetManager>
);
