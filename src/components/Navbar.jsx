import React from "react";
import { SettingsIcon, LibraryIcon, DownloadIcon } from "./icons/Icons.jsx";
import appLogo from "../assets/logo.png";

export const Navbar = ({ onOpenSettings, onOpenShortcuts, activeTab = "downloader", onSelectTab, downloadsCount = 0 }) => {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backgroundColor: "rgba(8, 8, 11, 0.75)",
        backdropFilter: "blur(28px)",
        WebkitBackdropFilter: "blur(28px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
        paddingTop: "max(env(safe-area-inset-top, 0px), 10px)",
        paddingBottom: "10px",
        paddingLeft: "20px",
        paddingRight: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "860px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        {/* Brand with Glowing Neon Aura */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "11px",
            cursor: "pointer",
            userSelect: "none",
          }}
          onClick={() => onSelectTab && onSelectTab("downloader")}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "11px",
              background: "linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(99, 102, 241, 0.15) 100%)",
              border: "1px solid rgba(139, 92, 246, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              boxShadow: "0 0 16px rgba(139, 92, 246, 0.35)",
            }}
          >
            <img
              src={appLogo}
              alt="Pie"
              style={{
                width: "22px",
                height: "22px",
                objectFit: "contain",
                filter: "drop-shadow(0 0 6px rgba(167, 139, 250, 0.8))",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: "1.08rem",
                  letterSpacing: "-0.025em",
                  background: "linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 50%, #A78BFA 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  lineHeight: 1.15,
                }}
              >
                Pie Downloader
              </span>
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  padding: "1px 6px",
                  borderRadius: "6px",
                  background: "var(--accent-gradient)",
                  color: "#FFF",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  boxShadow: "0 0 10px rgba(139, 92, 246, 0.4)",
                }}
              >
                PRO
              </span>
            </div>
            <span
              style={{
                fontSize: "0.68rem",
                color: "var(--text-tertiary)",
                fontWeight: 600,
                letterSpacing: "0.01em",
              }}
            >
              Universal High-Def Studio
            </span>
          </div>
        </div>

        {/* Desktop Segmented Tab Switcher */}
        {onSelectTab && (
          <div
            className="desktop-only"
            style={{
              alignItems: "center",
              gap: "4px",
              background: "rgba(22, 22, 28, 0.85)",
              borderRadius: "14px",
              padding: "4px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.4)",
            }}
          >
            {[
              { id: "downloader", label: "Studio", icon: <DownloadIcon size={14} /> },
              { id: "downloads", label: "Media Vault", icon: <LibraryIcon size={14} /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onSelectTab(tab.id)}
                  style={{
                    padding: "7px 18px",
                    borderRadius: "10px",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: "7px",
                    color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                    background: isActive
                      ? "linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%)"
                      : "transparent",
                    boxShadow: isActive
                      ? "0 4px 14px rgba(139, 92, 246, 0.4)"
                      : "none",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.id === "downloads" && downloadsCount > 0 && (
                    <span
                      style={{
                        fontSize: "0.68rem",
                        padding: "1px 6px",
                        borderRadius: "10px",
                        background: isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                        color: "#FFF",
                        fontWeight: 800,
                      }}
                    >
                      {downloadsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Quick Engine Status Pill */}
          <div
            className="desktop-only"
            style={{
              alignItems: "center",
              gap: "6px",
              padding: "5px 11px",
              borderRadius: "20px",
              background: "rgba(52, 211, 153, 0.08)",
              border: "1px solid rgba(52, 211, 153, 0.2)",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#34D399",
                boxShadow: "0 0 8px #34D399",
              }}
              className="animate-pulse"
            />
            <span
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: "#34D399",
                letterSpacing: "0.02em",
              }}
            >
              Turbo Ready
            </span>
          </div>

          {/* Shortcuts Trigger */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            style={{
              height: "36px",
              padding: "0 10px",
              borderRadius: "11px",
              background: "rgba(25, 25, 32, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer",
              fontSize: "0.78rem",
              fontWeight: 600,
              transition: "all 0.18s ease",
            }}
            title="Keyboard Shortcuts (Ctrl+/)"
          >
            <span>⌨️</span>
            <span className="desktop-only">Shortcuts</span>
          </button>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={onOpenSettings}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "11px",
              background: "rgba(25, 25, 32, 0.8)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.18s ease",
            }}
            title="Settings & Config (Ctrl+,)"
          >
            <SettingsIcon size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};
