import React from "react";
import { HomeIcon, LibraryIcon, SettingsIcon } from "./icons/Icons.jsx";

export const BottomNav = ({ activeTab, onSelectTab, downloadsCount = 0 }) => {
  const tabs = [
    { id: "downloader", label: "Home", icon: <HomeIcon size={20} /> },
    { id: "downloads", label: "Library", icon: <LibraryIcon size={20} />, badge: downloadsCount > 0 ? downloadsCount : null },
    { id: "settings", label: "Settings", icon: <SettingsIcon size={20} /> },
  ];

  return (
    <nav className="mobile-only"
      style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 90,
        backgroundColor: "rgba(5, 5, 7, 0.88)",
        backdropFilter: "blur(30px)", WebkitBackdropFilter: "blur(30px)",
        borderTop: "1px solid var(--border)",
        paddingBottom: "max(env(safe-area-inset-bottom, 0px), 4px)",
        paddingTop: "4px",
      }}
    >
      <div style={{ maxWidth: "400px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-around" }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button key={tab.id} type="button" onClick={() => onSelectTab(tab.id)}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: "2px", padding: "6px 0", position: "relative",
                color: isActive ? "var(--accent-light)" : "var(--text-tertiary)",
                background: "transparent",
              }}
            >
              {/* Active glow dot */}
              {isActive && (
                <div style={{
                  position: "absolute",
                  top: "-1px",
                  width: "16px",
                  height: "3px",
                  borderRadius: "2px",
                  background: "var(--accent-gradient)",
                  boxShadow: "0 0 10px rgba(139, 92, 246, 0.5)",
                }} />
              )}
              <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {tab.icon}
                {tab.badge && (
                  <span style={{
                    position: "absolute", top: "-3px", right: "-8px",
                    minWidth: "14px", height: "14px", padding: "0 3px",
                    borderRadius: "7px", background: "var(--accent-gradient)",
                    color: "#FFF", fontSize: "0.56rem", fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: "var(--accent-glow)",
                  }}>
                    {tab.badge}
                  </span>
                )}
              </div>
              <span style={{ fontSize: "0.62rem", fontWeight: isActive ? 700 : 500 }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
