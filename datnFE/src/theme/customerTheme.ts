import type { ThemeConfig } from "antd";

// Red theme configuration for Hikari Camera Shop
export const theme: ThemeConfig = {
  token: {
    // Primary color - Red (#D32F2F)
    colorPrimary: "#D32F2F",
    colorPrimaryHover: "#C62828",
    colorPrimaryActive: "#B71C1C",
    colorPrimaryBg: "#FFEBEE",
    colorPrimaryBgHover: "#FFCDD2",
    
    // Success, Warning, Error colors
    colorSuccess: "#4CAF50",
    colorWarning: "#FF9800",
    colorError: "#F44336",
    colorInfo: "#2196F3",
    
    // Background colors
    colorBgBase: "#FFFFFF",
    colorBgContainer: "#FFFFFF",
    colorBgElevated: "#FFFFFF",
    colorBgLayout: "#F5F5F5",
    
    // Border radius
    borderRadius: 8,
    
    // Font family
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    
    // Font sizes
    fontSize: 14,
    fontSizeHeading1: 32,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,
  },
  components: {
    Button: {
      primaryColor: "#FFFFFF",
      colorPrimary: "#D32F2F",
      colorPrimaryHover: "#C62828",
      colorPrimaryActive: "#B71C1C",
      borderRadius: 8,
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 16,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    },
    Input: {
      borderRadius: 8,
      controlHeight: 40,
      activeBorderColor: "#D32F2F",
      hoverBorderColor: "#EF5350",
    },
    Select: {
      borderRadius: 8,
      controlHeight: 40,
    },
    Pagination: {
      itemActiveBg: "#D32F2F",
      itemActiveColor: "#FFFFFF",
    },
    Menu: {
      itemSelectedBg: "#FFEBEE",
      itemSelectedColor: "#D32F2F",
    },
    Tabs: {
      colorPrimary: "#D32F2F",
      inkBarColor: "#D32F2F",
    },
    Tag: {
      colorPrimary: "#D32F2F",
    },
    Checkbox: {
      colorPrimary: "#D32F2F",
      colorPrimaryHover: "#C62828",
    },
    Slider: {
      colorPrimary: "#D32F2F",
      colorPrimaryBorder: "#D32F2F",
      colorPrimaryBorderHover: "#C62828",
    },
  },
};

// CSS variables for custom use
export const cssVariables = {
  "--color-primary": "#D32F2F",
  "--color-primary-hover": "#C62828",
  "--color-primary-active": "#B71C1C",
  "--color-primary-light": "#FFEBEE",
  "--color-text-primary": "#212121",
  "--color-text-secondary": "#757575",
  "--color-border": "#E0E0E0",
  "--color-bg-base": "#FFFFFF",
  "--color-bg-gray": "#F5F5F5",
  "--shadow-card": "0 2px 8px rgba(0, 0, 0, 0.08)",
  "--shadow-hover": "0 4px 16px rgba(0, 0, 0, 0.12)",
  "--radius-sm": "8px",
  "--radius-md": "12px",
  "--radius-lg": "16px",
};

export default theme;

