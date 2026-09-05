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
      case "youtube":
        return <PlatformYouTubeIcon size={20} />;
      case "instagram":
        return <PlatformInstagramIcon size={20} />;
      case "tiktok":
        return <PlatformTikTokIcon size={20} />;
      case "facebook":
        return <PlatformFacebookIcon size={20} />;
      case "twitter":
        return <PlatformTwitterIcon size={20} />;
      default:
        return <DownloadIcon size={20} />;
    }
  };

  const platforms = [
    { name: "YouTube", label: "4K, HD & MP3", icon: <PlatformYouTubeIcon size={20} />, color: "#FF0000", glow: "rgba(255, 0, 0, 0.25)" },
    { name: "Instagram", label: "Reels & Stories", icon: <PlatformInstagramIcon size={20} />, color: "#E1306C", glow: "rgba(225, 48, 108, 0.25)" },
    { name: "TikTok", label: "No Watermark", icon: <PlatformTikTokIcon size={20} />, color: "#00F2FE", glow: "rgba(0, 242, 254, 0.25)" },
    { name: "Facebook", label: "Reels & Video", icon: <PlatformFacebookIcon size={20} />, color: "#1877F2", glow: "rgba(24, 119, 242, 0.25)" },
    { name: "Twitter / X", label: "Crisp MP4", icon: <PlatformTwitterIcon size={20} />, color: "#FFFFFF", glow: "rgba(255, 255, 255, 0.18)" },
    { name: "Any Link", label: "Direct Stream", icon: <PlatformGenericIcon size={20} />, color: "#10B981", glow: "rgba(16, 185, 129, 0.25)" },
  ];

  return (
    <div style={{ width: "100%", marginBottom: "28px" }}>
      {/* Smart Clipboard Notification Banner */}
      {clipboardUrl && !url && (
        <div
          onClick={handleApplyClipboard}
          className="glass-panel"
          style={{
            background: "linear-gradient(135deg, rgba(37, 99, 235, 0.22) 0%, rgba(56, 189, 248, 0.18) 100%)",
            border: "1px solid rgba(56, 189, 248, 0.4)",
            borderRadius: "16px",
            padding: "12px 16px",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            cursor: "pointer",
            boxShadow: "0 0 24px rgba(56, 189, 248, 0.2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "rgba(56, 189, 248, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-cyan)",
                flexShrink: 0,
              }}
            >
              <SparklesIcon size={16} />
            </div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#FFFFFF" }}>
                Found link in clipboard
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-secondary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "320px",
                }}
              >
                {clipboardUrl}
              </div>
            </div>
          </div>
          <span
            style={{
              padding: "6px 14px",
              background: "var(--accent-gradient)",
              color: "#FFFFFF",
              borderRadius: "10px",
              fontSize: "0.78rem",
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: "0 2px 10px rgba(56, 189, 248, 0.35)",
            }}
          >
            Paste
          </span>
        </div>
      )}

      {/* Main Glass Console */}
      <div
        className="glass-panel"
        style={{
          borderRadius: "22px",
          padding: "16px",
          border: `1.5px solid ${url ? "rgba(56, 189, 248, 0.5)" : "rgba(255, 255, 255, 0.09)"}`,
          boxShadow: url
            ? "0 12px 36px rgba(0, 0, 0, 0.45), 0 0 30px rgba(56, 189, 248, 0.18)"
            : "0 8px 30px rgba(0, 0, 0, 0.35)",
          transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Input Bar Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--bg-input)",
            borderRadius: "14px",
            padding: "8px 12px 8px 14px",
            marginBottom: "14px",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "inset 0 2px 6px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            style={{
              color: currentPlatform !== "generic" ? "var(--accent-cyan)" : "var(--text-muted)",
              display: "flex",
              alignItems: "center",
              marginRight: "10px",
              flexShrink: 0,
            }}
          >
            {getPlatformIcon(currentPlatform)}
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste YouTube, Instagram, TikTok, Facebook link..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#FFFFFF",
              fontSize: "0.96rem",
              fontWeight: 500,
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
                borderRadius: "8px",
              }}
              title="Clear input"
            >
              <CloseIcon size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePaste}
              style={{
                padding: "7px 12px",
                borderRadius: "10px",
                background: "rgba(56, 189, 248, 0.14)",
                border: "1px solid rgba(56, 189, 248, 0.25)",
                color: "var(--accent-cyan)",
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

        {/* Primary Download / Fetch Action Button */}
        <button
          type="button"
          onClick={onFetch}
          disabled={!url.trim() || isLoading}
          style={{
            width: "100%",
            padding: "14px 20px",
            borderRadius: "14px",
            background:
              !url.trim() || isLoading
                ? "rgba(255, 255, 255, 0.06)"
                : "var(--accent-gradient)",
            color: !url.trim() || isLoading ? "var(--text-muted)" : "#FFFFFF",
            fontWeight: 800,
            fontSize: "1rem",
            letterSpacing: "0.01em",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            boxShadow:
              url.trim() && !isLoading
                ? "0 6px 24px rgba(37, 99, 235, 0.4), 0 0 20px rgba(56, 189, 248, 0.3)"
                : "none",
            cursor: !url.trim() || isLoading ? "not-allowed" : "pointer",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {isLoading ? (
            <>
              <RefreshIcon size={20} className="animate-spin" />
              <span>Resolving Stream Qualities...</span>
            </>
          ) : (
            <>
              <DownloadIcon size={20} />
              <span>Analyze & Download</span>
            </>
          )}
        </button>
      </div>

      {/* Sleek Platform Indicator Chips */}
      <div style={{ marginTop: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "10px",
            paddingLeft: "4px",
            paddingRight: "4px",
          }}
        >
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
            }}
          >
            Universal Media Engine
          </span>
          <span
            style={{
              fontSize: "0.7rem",
              color: "var(--accent-cyan)",
              fontWeight: 600,
              background: "rgba(56, 189, 248, 0.1)",
              padding: "2px 8px",
              borderRadius: "12px",
              border: "1px solid rgba(56, 189, 248, 0.2)",
            }}
          >
            HD 1080p &amp; 4K
          </span>
        </div>

        {/* Elegant Minimalist Platform Pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          {platforms.map((p) => {
            const isMatch = currentPlatform === p.name.toLowerCase().split(" ")[0] || (p.name.includes("Twitter") && currentPlatform === "twitter");

            return (
              <button
                key={p.name}
                type="button"
                onClick={() => {
                  if (!url) handlePaste();
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "7px 12px",
                  borderRadius: "12px",
                  background: isMatch
                    ? "rgba(56, 189, 248, 0.16)"
                    : "rgba(255, 255, 255, 0.04)",
                  border: isMatch
                    ? "1px solid rgba(56, 189, 248, 0.45)"
                    : "1px solid rgba(255, 255, 255, 0.07)",
                  color: isMatch ? "#FFFFFF" : "var(--text-secondary)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: p.color,
                    boxShadow: `0 0 8px ${p.color}`,
                    flexShrink: 0,
                  }}
                />
                <span>{p.name}</span>
                <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  ({p.label.split("&")[0].trim()})
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
