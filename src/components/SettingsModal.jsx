import React from "react";
import { CloseIcon, ShieldIcon, DevicePhoneIcon, DevicePcIcon } from "./icons/Icons.jsx";
import { getPlatformName } from "../engine/nativeBridge.js";

export const SettingsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const platform = getPlatformName();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "500px",
          padding: "24px",
          position: "relative",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            borderBottom: "1px solid var(--border)",
            paddingBottom: "14px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <ShieldIcon size={20} className="text-cyan" />
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
              App Architecture &amp; Settings
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px",
              borderRadius: "8px",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ display: "grid", gap: "16px", fontSize: "0.86rem" }}>
          {/* Platform info */}
          <div
            style={{
              background: "var(--bg-input)",
              borderRadius: "12px",
              padding: "14px",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              {platform === "android" ? <DevicePhoneIcon size={16} /> : <DevicePcIcon size={16} />}
              <span>Current Platform: {platform.toUpperCase()}</span>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", margin: 0 }}>
              Native storage integration is active. Downloaded files are saved straight to your device&apos;s Downloads/Documents folder.
            </p>
          </div>

          {/* Client-side privacy card */}
          <div
            style={{
              background: "var(--bg-input)",
              borderRadius: "12px",
              padding: "14px",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ fontWeight: 600, color: "var(--accent-green)", marginBottom: "4px" }}>
              Zero Server Load (100% Client-Side)
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", margin: 0, lineHeight: 1.4 }}>
              All video extraction and chunk downloads execute directly on your local device. The video never routes through PIETools servers, ensuring complete privacy, zero server costs, and zero rate-limiting.
            </p>
          </div>

          {/* Engine Version */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "var(--text-muted)",
              fontSize: "0.78rem",
              paddingTop: "6px",
            }}
          >
            <span>Universal Downloader Engine</span>
            <span>v1.0.0 (Native Core)</span>
          </div>
        </div>

        {/* Close Action */}
        <div style={{ marginTop: "24px", textAlign: "right" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "10px 24px",
              borderRadius: "10px",
              background: "var(--bg-hover)",
              color: "var(--text-primary)",
              fontWeight: 600,
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
