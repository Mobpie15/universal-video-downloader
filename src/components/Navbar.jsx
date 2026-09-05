import React from "react";
import { DownloadIcon, SettingsIcon, ShieldIcon, DevicePhoneIcon, DevicePcIcon } from "./icons/Icons.jsx";
import { getPlatformName } from "../engine/nativeBridge.js";

export const Navbar = ({ onOpenSettings }) => {
  const platform = getPlatformName();

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(12px)",
        backgroundColor: "rgba(11, 15, 25, 0.85)",
        borderBottom: "1px solid var(--border)",
        padding: "14px 20px",
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
        {/* Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              boxShadow: "0 2px 10px rgba(239, 68, 68, 0.35)",
            }}
          >
            <DownloadIcon size={20} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: 800, fontSize: "1.1rem", letterSpacing: "-0.02em" }}>
                PIE<span style={{ color: "var(--accent-red)" }}>Tools</span>
              </span>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: "rgba(6, 182, 212, 0.15)",
                  color: "var(--accent-cyan)",
                  border: "1px solid rgba(6, 182, 212, 0.3)",
                }}
              >
                App
              </span>
            </div>
            <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: 0 }}>
              Universal Video Downloader
            </p>
          </div>
        </div>

        {/* Right Action Icons & Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "none",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "20px",
              background: "rgba(16, 185, 129, 0.12)",
              border: "1px solid rgba(16, 185, 129, 0.25)",
              color: "var(--accent-green)",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
            className="md-flex"
          >
            <ShieldIcon size={14} />
            <span>100% Client-Side</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              padding: "5px 9px",
              borderRadius: "8px",
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              fontSize: "0.75rem",
            }}
          >
            {platform === "android" ? (
              <DevicePhoneIcon size={14} />
            ) : (
              <DevicePcIcon size={14} />
            )}
            <span style={{ textTransform: "capitalize" }}>{platform}</span>
          </div>

          <button
            type="button"
            onClick={onOpenSettings}
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "8px",
              background: "var(--bg-input)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Settings & Info"
          >
            <SettingsIcon size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
