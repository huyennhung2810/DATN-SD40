import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { App as AntdApp } from "antd";
import { store } from "./redux/store";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AntdApp>
        <App />
      </AntdApp>
    </Provider>
  </StrictMode>,
);
