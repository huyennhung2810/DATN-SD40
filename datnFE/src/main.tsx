import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { App as AntdApp, ConfigProvider } from "antd";
import { store } from "./redux/store";
import App from "./App";
import adminTheme from "./theme/adminTheme";
import "./styles/admin.css";
import "./styles/customer.css"
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <ConfigProvider theme={adminTheme}>
        <AntdApp>
          <App />
        </AntdApp>
      </ConfigProvider>
    </Provider>
  </StrictMode>,
);
