import React from "react";
import { HomeIcon, LibraryIcon, SettingsIcon } from "./icons/Icons.jsx";

export const BottomNav = ({ activeTab, onSelectTab, downloadsCount = 0 }) => {
  const tabs = [
    { id: "downloader", label: "Home", icon: <HomeIcon size={20} /> },
    { id: "downloads", label: "Library", icon: <LibraryIcon size={20} />, badge: downloadsCount > 0 ? downloadsCount : null },
    { id: "settings", label: "Settings", icon: <SettingsIcon size={20} /> },
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
        backgroundColor: "rgba(10, 10, 12, 0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 6px)",
        paddingTop: "4px",
      }}
    >
      <div style={{
        maxWidth: "420px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 8px",
      }}>
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
                gap: "2px",
                padding: "6px 0",
                color: isActive ? "var(--accent-light)" : "var(--text-tertiary)",
                position: "relative",
                background: "transparent",
              }}
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {tab.icon}
                {tab.badge && (
                  <span style={{
                    position: "absolute",
                    top: "-3px",
                    right: "-8px",
                    minWidth: "14px",
                    height: "14px",
                    padding: "0 3px",
                    borderRadius: "7px",
                    background: "var(--accent)",
                    color: "#FFF",
                    fontSize: "0.58rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: "0.65rem",
                fontWeight: isActive ? 600 : 500,
                letterSpacing: "0.01em",
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
