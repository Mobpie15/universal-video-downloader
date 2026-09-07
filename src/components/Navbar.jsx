import React from "react";
import { SettingsIcon } from "./icons/Icons.jsx";
import appLogo from "../assets/logo.png";

export const Navbar = ({ onOpenSettings, activeTab = "downloader", onSelectTab }) => {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(5, 5, 7, 0.8)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        borderBottom: "1px solid var(--border)",
        paddingTop: "max(env(safe-area-inset-top, 0px), 8px)",
        paddingBottom: "8px",
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <div style={{
        maxWidth: "640px",
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        {/* Brand with glow */}
        <div
          style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
          onClick={() => onSelectTab && onSelectTab("downloader")}
        >
          <div style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}>
            <img src={appLogo} alt="Pie" style={{
              width: "30px",
              height: "30px",
              objectFit: "contain",
              filter: "drop-shadow(0 0 12px rgba(139, 92, 246, 0.5))",
            }} />
          </div>
          <span style={{
            fontWeight: 800,
            fontSize: "1.02rem",
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #F4F4F6 0%, #A78BFA 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Pie Downloader
          </span>
        </div>

        {/* Desktop Tab Switcher */}
        {onSelectTab && (
          <div className="desktop-only" style={{
            alignItems: "center",
            gap: "2px",
            background: "var(--bg-elevated)",
            borderRadius: "12px",
            padding: "3px",
            border: "1px solid var(--border)",
          }}>
            {[
              { id: "downloader", label: "Download" },
              { id: "downloads", label: "Library" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button key={tab.id} type="button" onClick={() => onSelectTab(tab.id)}
                  style={{
                    padding: "6px 18px",
                    borderRadius: "9px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: isActive ? "#FFF" : "var(--text-tertiary)",
                    background: isActive ? "var(--accent-gradient)" : "transparent",
                    boxShadow: isActive ? "var(--accent-glow)" : "none",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Settings */}
        <button type="button" onClick={onOpenSettings}
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            color: "var(--text-tertiary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <SettingsIcon size={16} />
        </button>
      </div>
    </header>
  );
};
