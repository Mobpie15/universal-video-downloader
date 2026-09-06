import React from "react";
import { SettingsIcon } from "./icons/Icons.jsx";
import appLogo from "../assets/logo.png";

export const Navbar = ({
  onOpenSettings,
  activeTab = "downloader",
  onSelectTab,
}) => {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(10, 10, 12, 0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid var(--border)",
        paddingTop: "max(env(safe-area-inset-top, 0px), 10px)",
        paddingBottom: "10px",
        paddingLeft: "20px",
        paddingRight: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "640px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
          onClick={() => onSelectTab && onSelectTab("downloader")}
        >
          <img
            src={appLogo}
            alt="Pie"
            style={{
              width: "32px",
              height: "32px",
              objectFit: "contain",
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontWeight: 700,
              fontSize: "1.05rem",
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            Pie Downloader
          </span>
        </div>

        {/* Desktop Tabs */}
        {onSelectTab && (
          <div
            className="desktop-only"
            style={{
              alignItems: "center",
              gap: "2px",
              background: "var(--bg-elevated)",
              borderRadius: "10px",
              padding: "3px",
            }}
          >
            {[
              { id: "downloader", label: "Download" },
              { id: "downloads", label: "Library" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "8px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                    background: isActive ? "var(--accent-gradient)" : "transparent",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Settings */}
        <button
          type="button"
          onClick={onOpenSettings}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Settings"
        >
          <SettingsIcon size={16} />
        </button>
      </div>
    </header>
  );
};
