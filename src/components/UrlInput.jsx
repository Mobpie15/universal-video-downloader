import React, { useState, useEffect } from "react";
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
  SparklesIcon,
} from "./icons/Icons.jsx";
import { detectPlatform } from "../engine/extractors/index.js";
import { readClipboard, showToast } from "../engine/nativeBridge.js";

export const UrlInput = ({ url, setUrl, onFetch, isLoading }) => {
  const currentPlatform = detectPlatform(url);
  const [clipboardUrl, setClipboardUrl] = useState(null);

  // Periodic or focus clipboard check
  useEffect(() => {
    const checkClipboard = async () => {
      try {
        const text = await readClipboard();
        if (text && text.trim().startsWith("http") && text.trim() !== url) {
          const lower = text.toLowerCase();
          if (
            lower.includes("instagram.com") ||
            lower.includes("youtube.com") ||
            lower.includes("youtu.be") ||
            lower.includes("tiktok.com") ||
            lower.includes("facebook.com") ||
            lower.includes("x.com") ||
            lower.includes("twitter.com")
          ) {
            setClipboardUrl(text.trim());
          }
        }
      } catch (e) {
        // clipboard permission or empty
      }
    };
    checkClipboard();
  }, [url]);

  const handlePaste = async () => {
    try {
      const text = await readClipboard();
      if (text && text.trim()) {
        setUrl(text.trim());
        setClipboardUrl(null);
        showToast("Link pasted from clipboard");
      } else {
        showToast("Clipboard is empty");
      }
    } catch (e) {
      showToast("Unable to access clipboard");
    }
  };

  const handleApplyClipboard = () => {
    if (clipboardUrl) {
      setUrl(clipboardUrl);
      setClipboardUrl(null);
      showToast("Link applied");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && url.trim() && !isLoading) {
      onFetch();
    }
  };

  const getPlatformIcon = (plat) => {
    switch (plat) {
      case "youtube": return <PlatformYouTubeIcon size={20} />;
      case "instagram": return <PlatformInstagramIcon size={20} />;
      case "tiktok": return <PlatformTikTokIcon size={20} />;
      case "facebook": return <PlatformFacebookIcon size={20} />;
      case "twitter": return <PlatformTwitterIcon size={20} />;
      default: return <DownloadIcon size={20} />;
    }
  };

  const platforms = [
    { name: "Instagram", label: "Reels & Posts", icon: <PlatformInstagramIcon size={18} />, color: "#E1306C" },
    { name: "YouTube", label: "Videos & Shorts", icon: <PlatformYouTubeIcon size={18} />, color: "#FF0000" },
    { name: "TikTok", label: "No Watermark", icon: <PlatformTikTokIcon size={18} />, color: "#00F2FE" },
    { name: "Facebook", label: "Reels & Watch", icon: <PlatformFacebookIcon size={18} />, color: "#1877F2" },
    { name: "Twitter / X", label: "HD MP4", icon: <PlatformTwitterIcon size={18} />, color: "#FFFFFF" },
    { name: "Any Link", label: "Auto-detect", icon: <PlatformGenericIcon size={18} />, color: "#10B981" },
  ];

  return (
    <div style={{ width: "100%", marginBottom: "24px" }}>
      {/* Smart Clipboard Notification Banner */}
      {clipboardUrl && !url && (
        <div
          onClick={handleApplyClipboard}
          style={{
            background: "linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(139, 92, 246, 0.18) 100%)",
            border: "1px solid rgba(239, 68, 68, 0.35)",
            borderRadius: "14px",
            padding: "10px 14px",
            marginBottom: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            animation: "pulse 2s infinite ease-in-out",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
            <SparklesIcon size={16} className="text-red" />
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#FFFFFF" }}>
                Link detected in clipboard
              </div>
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "var(--text-secondary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "240px",
                }}
              >
                {clipboardUrl}
              </div>
            </div>
          </div>
          <span
            style={{
              padding: "4px 10px",
              background: "var(--accent-red)",
              color: "#FFFFFF",
              borderRadius: "8px",
              fontSize: "0.72rem",
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            Paste
          </span>
        </div>
      )}

      {/* Main Input Card */}
      <div
        style={{
          background: "var(--bg-card)",
          border: `1.5px solid ${url ? "rgba(239, 68, 68, 0.4)" : "var(--border)"}`,
          borderRadius: "18px",
          padding: "14px",
          boxShadow: url ? "0 8px 24px rgba(239, 68, 68, 0.15)" : "0 4px 20px rgba(0, 0, 0, 0.2)",
          transition: "all 0.25s ease",
        }}
      >
        {/* Input Bar Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--bg-input)",
            borderRadius: "12px",
            padding: "6px 10px 6px 12px",
            marginBottom: "12px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div style={{ color: "var(--accent-red)", display: "flex", alignItems: "center", marginRight: "10px", flexShrink: 0 }}>
            {getPlatformIcon(currentPlatform)}
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste video or reel link here..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "0.92rem",
              padding: "8px 0",
              minWidth: 0,
            }}
          />

          {url ? (
            <button
              type="button"
              onClick={() => setUrl("")}
              style={{
                padding: "6px",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
              title="Clear"
            >
              <CloseIcon size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePaste}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.08)",
                color: "var(--text-primary)",
                fontSize: "0.78rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                flexShrink: 0,
              }}
            >
              <CopyIcon size={13} />
              <span>Paste</span>
            </button>
          )}
        </div>

        {/* Primary Download / Fetch Action Button (Full Width Mobile Style) */}
        <button
          type="button"
          onClick={onFetch}
          disabled={!url.trim() || isLoading}
          style={{
            width: "100%",
            padding: "13px 18px",
            borderRadius: "12px",
            background: !url.trim() || isLoading
              ? "rgba(255, 255, 255, 0.07)"
              : "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
            color: !url.trim() || isLoading ? "var(--text-muted)" : "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.95rem",
            letterSpacing: "0.01em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            boxShadow: url.trim() && !isLoading ? "0 4px 18px rgba(239, 68, 68, 0.4)" : "none",
            cursor: !url.trim() || isLoading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
        >
          {isLoading ? (
            <>
              <RefreshIcon size={18} className="animate-spin" />
              <span>Analyzing Video Stream...</span>
            </>
          ) : (
            <>
              <DownloadIcon size={18} />
              <span>Analyze & Download</span>
            </>
          )}
        </button>
      </div>

      {/* Supported Platforms Grid */}
      <div style={{ marginTop: "20px" }}>
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--text-muted)",
            marginBottom: "10px",
            paddingLeft: "4px",
          }}
        >
          Supported Platforms
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "8px",
          }}
        >
          {platforms.map((p) => (
            <div
              key={p.name}
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                padding: "10px 8px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: "5px",
              }}
            >
              <div style={{ color: p.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {p.icon}
              </div>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1 }}>
                {p.name}
              </span>
              <span style={{ fontSize: "0.62rem", color: "var(--text-muted)", lineHeight: 1 }}>
                {p.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
