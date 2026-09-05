import React from "react";
import { DownloadIcon, SettingsIcon, LibraryIcon } from "./icons/Icons.jsx";
import appLogo from "../assets/logo.png";

export const Navbar = ({
  onOpenSettings,
  onOpenDownloads,
  downloadsCount = 0,
  activeTab = "downloader",
  onSelectTab,
}) => {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        backgroundColor: "rgba(6, 9, 15, 0.82)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
        paddingTop: "max(env(safe-area-inset-top, 0px), 12px)",
        paddingBottom: "12px",
        paddingLeft: "20px",
        paddingRight: "20px",
      }}
    >
      <div
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img
            src={appLogo}
            alt="Pie Video Downloader"
            style={{
              width: "38px",
              height: "38px",
              objectFit: "contain",
              filter: "drop-shadow(0 4px 14px rgba(56, 189, 248, 0.45))",
              flexShrink: 0,
              cursor: "pointer",
            }}
            onClick={() => onSelectTab && onSelectTab("downloader")}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "1.1rem",
                  letterSpacing: "-0.02em",
                  color: "#FFFFFF",
                }}
              >
                Pie Downloader
              </span>
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  padding: "1px 6px",
                  borderRadius: "5px",
                  background: "rgba(56, 189, 248, 0.15)",
                  color: "var(--accent-cyan)",
                  border: "1px solid rgba(56, 189, 248, 0.35)",
                  letterSpacing: "0.06em",
                }}
              >
                PRO
              </span>
            </div>
            <p
              style={{
                fontSize: "0.72rem",
                color: "var(--text-secondary)",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Universal 4K & MP3 Studio
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        {onSelectTab && (
          <div
            className="desktop-only"
            style={{
              alignItems: "center",
              gap: "6px",
              background: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: "14px",
              padding: "4px",
            }}
          >
            <button
              type="button"
              onClick={() => onSelectTab("downloader")}
              style={{
                padding: "6px 14px",
                borderRadius: "10px",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: activeTab === "downloader" ? "#FFFFFF" : "var(--text-secondary)",
                background:
                  activeTab === "downloader"
                    ? "linear-gradient(135deg, rgba(37, 99, 235, 0.6) 0%, rgba(56, 189, 248, 0.5) 100%)"
                    : "transparent",
                boxShadow: activeTab === "downloader" ? "0 2px 10px rgba(56, 189, 248, 0.25)" : "none",
              }}
            >
              Downloader
            </button>
            <button
              type="button"
              onClick={() => onSelectTab("downloads")}
              style={{
                padding: "6px 14px",
                borderRadius: "10px",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: activeTab === "downloads" ? "#FFFFFF" : "var(--text-secondary)",
                background:
                  activeTab === "downloads"
                    ? "linear-gradient(135deg, rgba(37, 99, 235, 0.6) 0%, rgba(56, 189, 248, 0.5) 100%)"
                    : "transparent",
                boxShadow: activeTab === "downloads" ? "0 2px 10px rgba(56, 189, 248, 0.25)" : "none",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <span>My Files</span>
              {downloadsCount > 0 && (
                <span
                  style={{
                    background: "var(--accent-cyan)",
                    color: "#06090F",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    padding: "0 6px",
                    borderRadius: "10px",
                  }}
                >
                  {downloadsCount}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Quick Header Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Quick Downloads Pill for Mobile */}
          <button
            type="button"
            className="mobile-only"
            onClick={onOpenDownloads}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 10px",
              borderRadius: "11px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "var(--text-secondary)",
              fontSize: "0.78rem",
              fontWeight: 600,
            }}
            title="My Downloads"
          >
            <LibraryIcon size={15} />
            <span>Files</span>
            {downloadsCount > 0 && (
              <span
                style={{
                  background: "var(--accent-cyan)",
                  color: "#06090F",
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  padding: "1px 5px",
                  borderRadius: "8px",
                  marginLeft: "2px",
                }}
              >
                {downloadsCount}
              </span>
            )}
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Settings"
          >
            <SettingsIcon size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};
