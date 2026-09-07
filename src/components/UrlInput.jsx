import React, { useState, useEffect } from "react";
import { DownloadIcon, CloseIcon, CopyIcon, RefreshIcon, SparklesIcon } from "./icons/Icons.jsx";
import { detectPlatform } from "../engine/extractors/index.js";
import { readClipboard, showToast } from "../engine/nativeBridge.js";

export const UrlInput = ({ url, setUrl, onFetch, isLoading }) => {
  const [clipboardUrl, setClipboardUrl] = useState(null);

  useEffect(() => {
    const checkClipboard = async () => {
      try {
        const text = await readClipboard();
        if (text && text.trim().startsWith("http") && text.trim() !== url) {
          const lower = text.toLowerCase();
          if (
            ["instagram.com", "youtube.com", "youtu.be", "tiktok.com", "facebook.com", "fb.watch", "x.com", "twitter.com", "reddit.com"]
              .some((d) => lower.includes(d))
          ) {
            setClipboardUrl(text.trim());
          }
        }
      } catch (e) {}
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
      showToast("Clipboard access denied");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && url.trim() && !isLoading) onFetch();
  };

  const platform = detectPlatform(url);
  const platformMeta = {
    youtube: { label: "YouTube", color: "#FF0000", glow: "rgba(255, 0, 0, 0.4)", tag: "4K / 1080p / MP3" },
    instagram: { label: "Instagram", color: "#E1306C", glow: "rgba(225, 48, 108, 0.4)", tag: "Reels / Photos" },
    tiktok: { label: "TikTok", color: "#00F2FE", glow: "rgba(0, 242, 254, 0.4)", tag: "HD No Watermark" },
    facebook: { label: "Facebook", color: "#1877F2", glow: "rgba(24, 119, 242, 0.4)", tag: "High Definition" },
    twitter: { label: "X / Twitter", color: "#FFFFFF", glow: "rgba(255, 255, 255, 0.4)", tag: "Universal MP4" },
    direct: { label: "Direct Video", color: "#34D399", glow: "rgba(52, 211, 153, 0.4)", tag: "Direct Stream" },
  }[platform];

  const popularPlatforms = [
    { id: "youtube", name: "YouTube", color: "#FF0000" },
    { id: "instagram", name: "Instagram", color: "#E1306C" },
    { id: "tiktok", name: "TikTok", color: "#00F2FE" },
    { id: "facebook", name: "Facebook", color: "#1877F2" },
    { id: "twitter", name: "X", color: "#F4F4F6" },
  ];

  return (
    <div style={{ width: "100%", marginBottom: "28px" }} className="animate-fadeUp">
      {/* Studio Hero Title */}
      <div style={{ textAlign: "center", marginBottom: "20px", padding: "0 10px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 12px",
            borderRadius: "20px",
            background: "rgba(139, 92, 246, 0.1)",
            border: "1px solid rgba(139, 92, 246, 0.25)",
            marginBottom: "12px",
          }}
        >
          <SparklesIcon size={13} style={{ color: "#A78BFA" }} />
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              color: "#C4B5FD",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Studio Media Downloader
          </span>
        </div>

        <h1
          style={{
            fontSize: "clamp(1.5rem, 4vw, 2.1rem)",
            fontWeight: 900,
            letterSpacing: "-0.035em",
            lineHeight: 1.18,
            marginBottom: "8px",
            background: "linear-gradient(135deg, #FFFFFF 0%, #E2E8F0 40%, #A78BFA 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Download Any Stream in High-Def
        </h1>
        <p
          style={{
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
            fontWeight: 500,
            maxWidth: "460px",
            margin: "0 auto",
            lineHeight: 1.5,
          }}
        >
          Fast, crystal-clear 1080p, 4K, and 320kbps MP3 extraction with universal gallery playback.
        </p>

        {/* Platform Quick Pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "14px",
          }}
        >
          {popularPlatforms.map((p) => {
            const isDetected = platform === p.id;
            return (
              <span
                key={p.id}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: isDetected ? "#FFF" : "var(--text-tertiary)",
                  background: isDetected
                    ? "rgba(139, 92, 246, 0.2)"
                    : "rgba(255, 255, 255, 0.03)",
                  border: `1px solid ${isDetected ? "rgba(139, 92, 246, 0.4)" : "rgba(255, 255, 255, 0.05)"}`,
                  transition: "all 0.2s ease",
                  boxShadow: isDetected ? "0 0 12px rgba(139, 92, 246, 0.3)" : "none",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: p.color,
                    boxShadow: isDetected ? `0 0 8px ${p.color}` : "none",
                  }}
                />
                {p.name}
              </span>
            );
          })}
        </div>
      </div>

      {/* Intelligent Clipboard Sniffer Banner */}
      {clipboardUrl && !url && (
        <button
          type="button"
          onClick={() => {
            setUrl(clipboardUrl);
            setClipboardUrl(null);
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "11px 16px",
            marginBottom: "14px",
            borderRadius: "var(--radius-lg)",
            background: "linear-gradient(135deg, rgba(139, 92, 246, 0.16) 0%, rgba(99, 102, 241, 0.12) 100%)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            color: "var(--text-primary)",
            textAlign: "left",
            cursor: "pointer",
            boxShadow: "0 6px 20px rgba(139, 92, 246, 0.15)",
          }}
        >
          <div
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "8px",
              background: "rgba(139, 92, 246, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#C4B5FD",
              flexShrink: 0,
            }}
          >
            <SparklesIcon size={15} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#EDE9FE" }}>
              Link detected in your clipboard
            </div>
            <div
              style={{
                fontSize: "0.7rem",
                color: "var(--text-secondary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontFamily: "var(--font-mono)",
              }}
            >
              {clipboardUrl}
            </div>
          </div>
          <span
            style={{
              padding: "5px 14px",
              borderRadius: "10px",
              background: "var(--accent-gradient)",
              color: "#FFF",
              fontSize: "0.72rem",
              fontWeight: 800,
              flexShrink: 0,
              boxShadow: "0 2px 10px rgba(139, 92, 246, 0.5)",
              letterSpacing: "0.02em",
            }}
          >
            Paste & Analyze
          </span>
        </button>
      )}

      {/* Input Glass Container */}
      <div
        className="studio-card"
        style={{
          padding: "8px",
          border: url
            ? "1px solid rgba(139, 92, 246, 0.45)"
            : "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: url
            ? "0 20px 50px -10px rgba(0, 0, 0, 0.8), 0 0 35px rgba(139, 92, 246, 0.2)"
            : "0 20px 50px -10px rgba(0, 0, 0, 0.7)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px 12px 8px 14px",
            gap: "10px",
          }}
        >
          {/* Active Platform Glowing Dot */}
          {platformMeta ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 8px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${platformMeta.glow}`,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: platformMeta.color,
                  boxShadow: `0 0 8px ${platformMeta.color}`,
                }}
              />
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: "#FFF",
                }}
              >
                {platformMeta.label}
              </span>
            </div>
          ) : (
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.2)",
                flexShrink: 0,
              }}
            />
          )}

          {/* Text Input */}
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
              color: "var(--text-primary)",
              fontSize: "0.94rem",
              fontWeight: 500,
              padding: "6px 0",
              minWidth: 0,
            }}
          />

          {/* Action Button: Clear or Quick Paste */}
          {url ? (
            <button
              type="button"
              onClick={() => setUrl("")}
              style={{
                padding: "6px",
                color: "var(--text-tertiary)",
                display: "flex",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.04)",
                cursor: "pointer",
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
                padding: "6px 14px",
                borderRadius: "9px",
                background: "rgba(139, 92, 246, 0.15)",
                border: "1px solid rgba(139, 92, 246, 0.25)",
                color: "var(--accent-light)",
                fontSize: "0.76rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: "5px",
                flexShrink: 0,
                cursor: "pointer",
              }}
            >
              <CopyIcon size={13} />
              <span>Paste</span>
            </button>
          )}
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={onFetch}
          disabled={!url.trim() || isLoading}
          style={{
            width: "100%",
            padding: "14px 22px",
            borderRadius: "var(--radius-lg)",
            background: !url.trim() || isLoading
              ? "rgba(30, 30, 38, 0.8)"
              : "linear-gradient(135deg, #8B5CF6 0%, #6366F1 45%, #06B6D4 100%)",
            color: !url.trim() || isLoading ? "var(--text-tertiary)" : "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.94rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "9px",
            cursor: !url.trim() || isLoading ? "not-allowed" : "pointer",
            letterSpacing: "-0.01em",
            boxShadow: url.trim() && !isLoading
              ? "0 4px 24px rgba(139, 92, 246, 0.45), 0 0 12px rgba(6, 182, 212, 0.2)"
              : "none",
            transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {isLoading ? (
            <>
              <RefreshIcon size={18} className="animate-spin" />
              <span>Analyzing Stream & Resolving Tracks...</span>
            </>
          ) : (
            <>
              <DownloadIcon size={18} />
              <span>Analyze & Get Download Formats</span>
            </>
          )}
        </button>
      </div>

      {/* Feature Highlights Bar */}
      <div
        style={{
          marginTop: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          fontSize: "0.72rem",
          color: "var(--text-tertiary)",
          fontWeight: 600,
          flexWrap: "wrap",
        }}
      >
        <span>⚡ Turbo Multi-Stream</span>
        <span>•</span>
        <span>🎬 1080p / 4K Video</span>
        <span>•</span>
        <span>🎵 320kbps MP3 Audio</span>
        <span>•</span>
        <span>🛡️ 100% Ad-Free</span>
      </div>
    </div>
  );
};
