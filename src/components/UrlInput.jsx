import React, { useEffect } from "react";
import {
  DownloadIcon,
  CloseIcon,
  CopyIcon,
  RefreshIcon,
  PlatformYouTubeIcon,
  PlatformInstagramIcon,
  PlatformTikTokIcon,
  PlatformFacebookIcon,
  PlatformTwitterIcon,
  PlatformGenericIcon,
} from "./icons/Icons.jsx";
import { detectPlatform } from "../engine/extractors/index.js";
import { readClipboard } from "../engine/nativeBridge.js";

export const UrlInput = ({ url, setUrl, onFetch, isLoading }) => {
  const currentPlatform = detectPlatform(url);

  const handlePaste = async () => {
    const text = await readClipboard();
    if (text && text.trim().startsWith("http")) {
      setUrl(text.trim());
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && url.trim() && !isLoading) {
      onFetch();
    }
  };

  const getPlatformIcon = (plat) => {
    switch (plat) {
      case "youtube": return <PlatformYouTubeIcon size={18} />;
      case "instagram": return <PlatformInstagramIcon size={18} />;
      case "tiktok": return <PlatformTikTokIcon size={18} />;
      case "facebook": return <PlatformFacebookIcon size={18} />;
      case "twitter": return <PlatformTwitterIcon size={18} />;
      default: return <PlatformGenericIcon size={18} />;
    }
  };

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Search Input Box */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          background: "var(--bg-input)",
          border: `1.5px solid ${url ? "var(--border-focus)" : "var(--border)"}`,
          borderRadius: "14px",
          padding: "6px 8px 6px 16px",
          transition: "border-color 0.2s, box-shadow 0.2s",
          boxShadow: url ? "0 0 0 3px rgba(59, 130, 246, 0.15)" : "none",
        }}
      >
        <div style={{ color: "var(--text-muted)", display: "flex", alignItems: "center", marginRight: "10px" }}>
          {url ? getPlatformIcon(currentPlatform) : <DownloadIcon size={20} />}
        </div>

        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste YouTube, Instagram, TikTok, FB, or X video link..."
          style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "var(--text-primary)",
            fontSize: "0.95rem",
            padding: "8px 0",
          }}
        />

        {/* Clear Button */}
        {url && (
          <button
            type="button"
            onClick={() => setUrl("")}
            style={{
              padding: "6px",
              borderRadius: "6px",
              color: "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              marginRight: "6px",
            }}
          >
            <CloseIcon size={16} />
          </button>
        )}

        {/* Quick Paste Button */}
        {!url && (
          <button
            type="button"
            onClick={handlePaste}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              background: "var(--bg-hover)",
              color: "var(--text-secondary)",
              fontSize: "0.82rem",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginRight: "6px",
            }}
          >
            <CopyIcon size={14} />
            <span>Paste</span>
          </button>
        )}

        {/* Action Button */}
        <button
          type="button"
          onClick={onFetch}
          disabled={!url.trim() || isLoading}
          style={{
            padding: "10px 22px",
            borderRadius: "10px",
            background: !url.trim() || isLoading ? "var(--bg-hover)" : "var(--accent-red)",
            color: !url.trim() || isLoading ? "var(--text-muted)" : "#FFFFFF",
            fontWeight: 700,
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: !url.trim() || isLoading ? "not-allowed" : "pointer",
            boxShadow: url.trim() && !isLoading ? "0 4px 14px rgba(239, 68, 68, 0.3)" : "none",
          }}
        >
          {isLoading ? (
            <>
              <RefreshIcon size={16} className="animate-spin" />
              <span>Fetching...</span>
            </>
          ) : (
            <>
              <DownloadIcon size={16} />
              <span>Get Video</span>
            </>
          )}
        </button>
      </div>

      {/* Supported Platforms Pill Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "14px",
          marginTop: "14px",
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 500 }}>
          Supported Platforms:
        </span>

        {[
          { name: "YouTube", icon: <PlatformYouTubeIcon size={14} /> },
          { name: "Instagram", icon: <PlatformInstagramIcon size={14} /> },
          { name: "TikTok", icon: <PlatformTikTokIcon size={14} /> },
          { name: "Facebook", icon: <PlatformFacebookIcon size={14} /> },
          { name: "Twitter / X", icon: <PlatformTwitterIcon size={14} /> },
        ].map((p) => (
          <div
            key={p.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontSize: "0.75rem",
              color: "var(--text-secondary)",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              padding: "4px 10px",
              borderRadius: "12px",
            }}
          >
            {p.icon}
            <span>{p.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
