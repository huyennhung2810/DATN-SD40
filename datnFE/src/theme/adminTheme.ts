import type { ThemeConfig } from "antd";

/**
 * Admin Theme - Apple-like / Liquid Glass Design System
 * 
 * Design Principles:
 * - Clean, light backgrounds with subtle depth
 * - Glass-morphism with very subtle transparency
 * - Soft shadows for depth
 * - Minimal, neutral color palette with refined accents
 * - Premium, enterprise feel
 */

export const adminTheme: ThemeConfig = {
  token: {
    // Primary - Refined slate blue (Apple-like)
    colorPrimary: "#0A84FF",
    colorPrimaryHover: "#0066CC",
    colorPrimaryActive: "#0052A3",
    colorPrimaryBg: "#F0F7FF",
    colorPrimaryBgHover: "#E5F0FF",
   
    
    // Success - Muted green
    colorSuccess: "#34C759",
    colorSuccessBg: "#E8F5E9",
    colorSuccessBorder: "#A5D6A7",
    
    // Warning - Soft amber
    colorWarning: "#FF9F0A",
    colorWarningBg: "#FFF8E1",
    colorWarningBorder: "#FFE082",
    
    // Error - Soft red
    colorError: "#FF3B30",
    colorErrorBg: "#FFEBEE",
    colorErrorBorder: "#FFCDD2",
    
    // Info - Soft blue
    colorInfo: "#5AC8FA",
    colorInfoBg: "#E3F2FD",
    colorInfoBorder: "#90CAF9",
    
    // Background colors - Light, clean
    colorBgBase: "#FAFBFC",
    colorBgContainer: "#FFFFFF",
    colorBgElevated: "#FFFFFF",
    colorBgLayout: "#F4F5F7",
    colorBgSpotlight: "#F9FAFB",
    
    // Text colors - Refined grays
    colorText: "#1D1D1F",
    colorTextSecondary: "#6E6E73",
    colorTextTertiary: "#A1A1A6",
    colorTextQuaternary: "#D1D1D6",
    
    // Border colors - Subtle
    colorBorder: "#E5E5EA",
    colorBorderSecondary: "#F0F0F5",
    
    // Font family - Apple system stack
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    
    // Font sizes - Refined
    fontSize: 13,
    fontSizeSM: 12,
    fontSizeLG: 14,
    fontSizeXL: 16,
    fontSizeHeading1: 28,
    fontSizeHeading2: 22,
    fontSizeHeading3: 18,
    fontSizeHeading4: 16,
    fontSizeHeading5: 14,
    
    // Line heights
    lineHeight: 1.5,
    lineHeightLG: 1.6,
    lineHeightSM: 1.4,
    
    // Border radius - Larger, more modern
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 6,
    borderRadiusXS: 4,
    
    // Control heights
    controlHeight: 36,
    controlHeightLG: 44,
    controlHeightSM: 28,
    
    // Box shadows - Soft, layered
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
    boxShadowSecondary: "0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04)",
  },
  components: {
    // Layout
    Layout: {
      bodyBg: "#F4F5F7",
      headerBg: "#FFFFFF",
      siderBg: "#FFFFFF",
      triggerBg: "#FFFFFF",
      headerHeight: 56,
      headerPadding: "0 20px",
      siderPadding: "0 0",
    },
    
    // Cards
    Card: {
      colorBgContainer: "#FFFFFF",
      borderRadiusLG: 16,
      paddingLG: 20,
      boxShadowTertiary: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)",
    },
    
    // Buttons
    Button: {
      primaryColor: "#FFFFFF",
      colorPrimary: "#0A84FF",
      colorPrimaryHover: "#0066CC",
      colorPrimaryActive: "#0052A3",
      colorPrimaryBg: "#F0F7FF",
      borderRadius: 8,
      controlHeight: 36,
      controlHeightLG: 44,
      controlHeightSM: 28,
      defaultBorderColor: "#E5E5EA",
      defaultColor: "#1D1D1F",
      defaultBg: "#FFFFFF",
      defaultHoverBorderColor: "#0A84FF",
      defaultHoverColor: "#0A84FF",
      defaultHoverBg: "#F0F7FF",
    },
    
    // Inputs
    Input: {
      colorBgContainer: "#FFFFFF",
      colorBorder: "#E5E5EA",
      colorBorderHover: "#0A84FF",
      colorBorderFocus: "#0A84FF",
      activeBorderColor: "#0A84FF",
      hoverBorderColor: "#0A84FF",
      borderRadius: 8,
      controlHeight: 36,
      activeShadow: "0 0 0 3px rgba(10, 132, 255, 0.1)",
    },
    
    // Select
    Select: {
      colorBgContainer: "#FFFFFF",
      colorBorder: "#E5E5EA",
      colorBorderHover: "#0A84FF",
      borderRadius: 8,
      controlHeight: 36,
      optionSelectedBg: "#F0F7FF",
    },
    
    // Tables
    Table: {
      colorBgContainer: "#FFFFFF",
      headerBg: "#F9FAFB",
      headerColor: "#6E6E73",
      rowHoverBg: "#F5F7FA",
      borderColor: "#F0F0F5",
      headerSortActiveBg: "#EEF1F5",
      headerSortHoverBg: "#EEF1F5",
      bodySortBg: "#F9FAFB",
      rowSelectedBg: "#F0F7FF",
      rowSelectedHoverBg: "#E5F0FF",
    },
    
    // Pagination
    Pagination: {
      colorBgContainer: "#FFFFFF",
      colorBorder: "#E5E5EA",
      colorPrimary: "#0A84FF",
      colorPrimaryHover: "#0066CC",
      itemActiveBg: "#0A84FF",
      itemActiveColor: "#FFFFFF",
      itemHoverColor: "#0066CC",
      itemHoverBg: "#F0F7FF",
    },
    
    // Menu
    Menu: {
      colorItemBg: "transparent",
      colorItemBgHover: "#F5F7FA",
      colorItemBgSelected: "#F0F7FF",
      colorItemText: "#6E6E73",
      colorItemTextHover: "#1D1D1F",
      colorItemTextSelected: "#0A84FF",
      itemBorderRadius: 8,
      itemMarginInline: 8,
      itemPaddingInline: 12,
      iconSize: 16,
      itemHeight: 40,
    },
    
    // Tabs
    Tabs: {
      colorPrimary: "#0A84FF",
      inkBarColor: "#0A84FF",
      itemActiveColor: "#0A84FF",
      itemHoverColor: "#0066CC",
      itemSelectedColor: "#0A84FF",
      cardBg: "#F9FAFB",
      cardHeight: 40,
      borderRadiusLG: 10,
    },
    
    // Modal
    Modal: {
      contentBg: "#FFFFFF",
      headerBg: "#FFFFFF",
      borderRadiusLG: 16,
      paddingLG: 24,
      titleColor: "#1D1D1F",
    },
    
    // Drawer
    Drawer: {
      colorBgElevated: "#FFFFFF",
      borderRadiusLG: 0,
    },
    
    // Popconfirm
    Popconfirm: {
      colorBgElevated: "#FFFFFF",
      borderRadiusLG: 12,
    },
    
    // Tags
    Tag: {
      defaultBg: "#F5F7FA",
      defaultColor: "#6E6E73",
      borderRadiusSM: 6,
    },
    
    // Badge
    Badge: {
      colorBgContainer: "#FF3B30",
      colorTextLabelLight: "#FFFFFF",
    },
    
    // Tooltip
    Tooltip: {
      colorBgSpotlight: "#1D1D1F",
      colorTextLightSolid: "#FFFFFF",
      borderRadiusLG: 8,
    },
    
    // Dropdown
    Dropdown: {
      colorBgElevated: "#FFFFFF",
      borderRadiusLG: 12,
      boxShadowSecondary: "0 6px 16px rgba(0, 0, 0, 0.08), 0 3px 6px rgba(0, 0, 0, 0.04)",
    },
    
    // Form
    Form: {
      labelColor: "#1D1D1F",
      labelFontSize: 13,
      verticalLabelPadding: "0 0 8px",
    },
    
    // Upload
    Upload: {
      colorBorder: "#E5E5EA",
      colorBgContainer: "#FAFBFC",
    },
    
    // Avatar
    Avatar: {
      colorBgContainer: "#F5F7FA",
      colorBorder: "#E5E5EA",
    },
    
    // Notification
    Notification: {
      colorBgElevated: "#FFFFFF",
      borderRadiusLG: 14,
    },
    
    // Message
    Message: {
      contentBg: "#FFFFFF",
      borderRadiusLG: 12,
    },
    
    // Steps
    Steps: {
      colorPrimary: "#0A84FF",
      finishIconColor: "#0A84FF",
    },
    
    // Progress
    Progress: {
      defaultColor: "#0A84FF",
    },
    
    // Spin
    Spin: {
      colorPrimary: "#0A84FF",
    },
    
    // Skeleton
    Skeleton: {
      gradientFromColor: "#F0F0F5",
      gradientToColor: "#E8E8ED",
    },
    
    // Empty
    Empty: {
      colorTextDisabled: "#D1D1D6",
    },
    
    // Divider
    Divider: {
      colorSplit: "#E5E5EA",
    },
    
    // Statistic
    Statistic: {
      colorTextDescription: "#6E6E73",
    },
    
    // Breadcrumb
    Breadcrumb: {
      linkColor: "#6E6E73",
      linkHoverColor: "#0A84FF",
      separatorColor: "#D1D1D6",
    },
    
    // Slider
    Slider: {
      trackBg: "#E5E5EA",
      railBg: "#F0F0F5",
      handleColor: "#0A84FF",
      dotActiveBorderColor: "#0A84FF",
    },
    
    // Switch
    Switch: {
      colorPrimary: "#34C759",
      colorPrimaryHover: "#2DB840",
    },
    
    // Checkbox
    Checkbox: {
      colorBorder: "#E5E5EA",
      colorPrimary: "#0A84FF",
      colorPrimaryHover: "#0066CC",
    },
    
    // Radio
    Radio: {
      colorBorder: "#E5E5EA",
      colorPrimary: "#0A84FF",
      colorPrimaryHover: "#0066CC",
    },
  },
};

// CSS Variables for custom styling
export const adminCssVariables = {
  // Colors - Clean, Apple-like
  "--color-primary": "#0A84FF",
  "--color-primary-hover": "#0066CC",
  "--color-primary-active": "#0052A3",
  "--color-primary-light": "#F0F7FF",
  "--color-primary-subtle": "#E5F0FF",
  
  "--color-success": "#34C759",
  "--color-success-light": "#E8F5E9",
  "--color-success-border": "#A5D6A7",
  
  "--color-warning": "#FF9F0A",
  "--color-warning-light": "#FFF8E1",
  "--color-warning-border": "#FFE082",
  
  "--color-error": "#FF3B30",
  "--color-error-light": "#FFEBEE",
  "--color-error-border": "#FFCDD2",
  
  "--color-info": "#5AC8FA",
  "--color-info-light": "#E3F2FD",
  "--color-info-border": "#90CAF9",
  
  // Neutral colors
  "--color-text-primary": "#1D1D1F",
  "--color-text-secondary": "#6E6E73",
  "--color-text-tertiary": "#A1A1A6",
  "--color-text-quaternary": "#D1D1D6",
  
  "--color-border": "#E5E5EA",
  "--color-border-secondary": "#F0F0F5",
  "--color-border-tertiary": "#F5F7FA",
  
  "--color-bg-base": "#FAFBFC",
  "--color-bg-container": "#FFFFFF",
  "--color-bg-elevated": "#FFFFFF",
  "--color-bg-layout": "#F4F5F7",
  "--color-bg-spotlight": "#F9FAFB",
  "--color-bg-hover": "#F5F7FA",
  "--color-bg-mask": "rgba(0, 0, 0, 0.4)",
  
  // Glass effect (subtle)
  "--glass-bg": "rgba(255, 255, 255, 0.72)",
  "--glass-bg-strong": "rgba(255, 255, 255, 0.85)",
  "--glass-border": "rgba(255, 255, 255, 0.5)",
  "--glass-shadow": "0 8px 32px rgba(0, 0, 0, 0.08)",
  "--glass-blur": "blur(20px)",
  
  // Spacing
  "--spacing-xs": "4px",
  "--spacing-sm": "8px",
  "--spacing-md": "12px",
  "--spacing-lg": "16px",
  "--spacing-xl": "20px",
  "--spacing-2xl": "24px",
  "--spacing-3xl": "32px",
  
  // Border radius
  "--radius-sm": "6px",
  "--radius-md": "10px",
  "--radius-lg": "14px",
  "--radius-xl": "20px",
  "--radius-full": "9999px",
  
  // Shadows - Soft, layered
  "--shadow-sm": "0 1px 2px rgba(0, 0, 0, 0.04)",
  "--shadow-md": "0 2px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.04)",
  "--shadow-lg": "0 4px 12px rgba(0, 0, 0, 0.06), 0 2px 6px rgba(0, 0, 0, 0.04)",
  "--shadow-xl": "0 8px 24px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.05)",
  "--shadow-2xl": "0 16px 48px rgba(0, 0, 0, 0.1), 0 8px 20px rgba(0, 0, 0, 0.06)",
  
  // Typography
  "--font-family": "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  "--font-size-xs": "11px",
  "--font-size-sm": "12px",
  "--font-size-base": "13px",
  "--font-size-lg": "14px",
  "--font-size-xl": "16px",
  "--font-size-2xl": "18px",
  "--font-size-3xl": "22px",
  "--font-size-4xl": "28px",
  
  // Transitions
  "--transition-fast": "0.15s ease",
  "--transition-base": "0.2s ease",
  "--transition-slow": "0.3s ease",
  "--transition-spring": "0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
  
  // Layout
  "--sidebar-width": "240px",
  "--sidebar-collapsed-width": "64px",
  "--header-height": "56px",
  "--content-padding": "20px",
  "--border-width": "1px",
};

export default adminTheme;
