import React from "react";
import { HomeIcon, LibraryIcon, SettingsIcon } from "./icons/Icons.jsx";

export const BottomNav = ({ activeTab, onSelectTab, downloadsCount = 0 }) => {
  const tabs = [
    {
      id: "downloader",
      label: "Downloader",
      icon: <HomeIcon size={22} />,
    },
    {
      id: "downloads",
      label: "My Files",
      icon: <LibraryIcon size={22} />,
      badge: downloadsCount > 0 ? downloadsCount : null,
    },
    {
      id: "settings",
      label: "Settings",
      icon: <SettingsIcon size={22} />,
    },
  ];

  return (
    <nav
      className="mobile-only"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 90,
        backgroundColor: "rgba(6, 9, 15, 0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 8px)",
        paddingTop: "6px",
      }}
    >
      <div
        style={{
          maxWidth: "540px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          padding: "0 12px",
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "3px",
                padding: "6px 8px",
                borderRadius: "12px",
                background: isActive ? "rgba(56, 189, 248, 0.12)" : "transparent",
                color: isActive ? "var(--accent-cyan)" : "var(--text-muted)",
                position: "relative",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {tab.icon}
                {tab.badge && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-8px",
                      minWidth: "16px",
                      height: "16px",
                      padding: "0 4px",
                      borderRadius: "10px",
                      background: "var(--accent-gradient)",
                      boxShadow: "0 2px 8px rgba(56, 189, 248, 0.5)",
                      color: "#FFFFFF",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                style={{
                  fontSize: "0.72rem",
                  fontWeight: isActive ? 700 : 500,
                  letterSpacing: "0.01em",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
