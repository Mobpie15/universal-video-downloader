import React from "react";
import { DownloadIcon, SettingsIcon, LibraryIcon } from "./icons/Icons.jsx";

export const Navbar = ({ onOpenSettings, onOpenDownloads, downloadsCount = 0 }) => {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        backgroundColor: "rgba(10, 14, 23, 0.88)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.07)",
        paddingTop: "max(env(safe-area-inset-top, 0px), 12px)",
        paddingBottom: "12px",
        paddingLeft: "16px",
        paddingRight: "16px",
      }}
    >
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Brand Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src="/logo.png"
            alt="Pie Video Downloader"
            style={{
              width: "36px",
              height: "36px",
              objectFit: "contain",
              filter: "drop-shadow(0 2px 10px rgba(56, 189, 248, 0.4))",
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  letterSpacing: "-0.02em",
                  color: "var(--text-primary)",
                }}
              >
                Pie Video
              </span>
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  padding: "1px 5px",
                  borderRadius: "4px",
                  background: "rgba(239, 68, 68, 0.15)",
                  color: "var(--accent-red)",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  letterSpacing: "0.05em",
                }}
              >
                PRO
              </span>
            </div>
            <p
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              Universal Downloader
            </p>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Quick Downloads Pill */}
          <button
            type="button"
            onClick={onOpenDownloads}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "6px 10px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "var(--text-secondary)",
              fontSize: "0.76rem",
              fontWeight: 600,
            }}
            title="My Downloads"
          >
            <LibraryIcon size={15} />
            <span>Files</span>
            {downloadsCount > 0 && (
              <span
                style={{
                  background: "var(--accent-red)",
                  color: "#FFFFFF",
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
              width: "34px",
              height: "34px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
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
      </div>
    </header>
  );
};
