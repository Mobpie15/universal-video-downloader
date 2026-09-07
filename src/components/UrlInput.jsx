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
          if (["instagram.com","youtube.com","youtu.be","tiktok.com","facebook.com","x.com","twitter.com"]
              .some(d => lower.includes(d))) {
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
        showToast("Link pasted");
      } else {
        showToast("Clipboard empty");
      }
    } catch (e) { showToast("Clipboard unavailable"); }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && url.trim() && !isLoading) onFetch();
  };

  const platform = detectPlatform(url);
  const platformMeta = {
    youtube: { label: "YouTube", color: "#FF0000", emoji: "▶️" },
    instagram: { label: "Instagram", color: "#E1306C", emoji: "📸" },
    tiktok: { label: "TikTok", color: "#00F2FE", emoji: "🎵" },
    facebook: { label: "Facebook", color: "#1877F2", emoji: "📘" },
    twitter: { label: "X / Twitter", color: "#FFFFFF", emoji: "𝕏" },
  }[platform];

  return (
    <div style={{ width: "100%", marginBottom: "24px" }} className="animate-fadeUp">
      {/* Hero Text */}
      <div style={{ marginBottom: "20px", textAlign: "center", padding: "0 8px" }}>
        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: 900,
          letterSpacing: "-0.03em",
          lineHeight: 1.2,
          marginBottom: "6px",
          background: "linear-gradient(135deg, #F4F4F6 0%, #A78BFA 50%, #F472B6 100%)",
          backgroundSize: "200% 200%",
          animation: "gradientShift 6s ease infinite",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Download any video
        </h1>
        <p style={{
          fontSize: "0.82rem",
          color: "var(--text-secondary)",
          fontWeight: 500,
        }}>
          YouTube · Instagram · TikTok · Facebook · Twitter
        </p>
      </div>

      {/* Clipboard Banner */}
      {clipboardUrl && !url && (
        <button type="button" onClick={() => { setUrl(clipboardUrl); setClipboardUrl(null); }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 14px",
            marginBottom: "12px",
            borderRadius: "var(--radius-md)",
            background: "var(--accent-muted)",
            border: "1px solid rgba(139, 92, 246, 0.2)",
            color: "var(--text-primary)",
            textAlign: "left",
          }}
        >
          <SparklesIcon size={14} style={{ color: "var(--accent-light)", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600 }}>Link found in clipboard</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-tertiary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {clipboardUrl}
            </div>
          </div>
          <span style={{
            padding: "4px 12px",
            borderRadius: "8px",
            background: "var(--accent-gradient)",
            color: "#FFF",
            fontSize: "0.7rem",
            fontWeight: 700,
            flexShrink: 0,
            boxShadow: "var(--accent-glow)",
          }}>
            Use
          </span>
        </button>
      )}

      {/* Input Card */}
      <div style={{
        background: "var(--bg-secondary)",
        border: `1px solid ${url ? "var(--border-active)" : "var(--border)"}`,
        borderRadius: "var(--radius-xl)",
        padding: "6px",
        transition: "all 0.3s ease",
        boxShadow: url ? "0 0 40px rgba(139, 92, 246, 0.08)" : "none",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "8px 12px",
          gap: "8px",
        }}>
          {/* Platform indicator dot */}
          {platformMeta && (
            <span style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: platformMeta.color,
              boxShadow: `0 0 8px ${platformMeta.color}`,
              flexShrink: 0,
            }} />
          )}

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste video link..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-primary)",
              fontSize: "0.9rem",
              fontWeight: 500,
              padding: "4px 0",
              minWidth: 0,
            }}
          />

          {url ? (
            <button type="button" onClick={() => setUrl("")}
              style={{ padding: "6px", color: "var(--text-tertiary)", display: "flex", borderRadius: "6px" }}
            >
              <CloseIcon size={16} />
            </button>
          ) : (
            <button type="button" onClick={handlePaste}
              style={{
                padding: "5px 12px",
                borderRadius: "8px",
                background: "var(--accent-muted)",
                border: "1px solid rgba(139, 92, 246, 0.2)",
                color: "var(--accent-light)",
                fontSize: "0.74rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "4px",
                flexShrink: 0,
              }}
            >
              <CopyIcon size={12} />
              <span>Paste</span>
            </button>
          )}
        </div>

        {/* Big gradient CTA button */}
        <button
          type="button"
          onClick={onFetch}
          disabled={!url.trim() || isLoading}
          className={url.trim() && !isLoading ? "animate-glow" : ""}
          style={{
            width: "100%",
            padding: "13px 20px",
            borderRadius: "var(--radius-lg)",
            background: !url.trim() || isLoading
              ? "var(--bg-elevated)"
              : "var(--accent-gradient)",
            color: !url.trim() || isLoading ? "var(--text-tertiary)" : "#FFF",
            fontWeight: 700,
            fontSize: "0.92rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: !url.trim() || isLoading ? "not-allowed" : "pointer",
            letterSpacing: "-0.01em",
            transition: "all 0.3s ease",
          }}
        >
          {isLoading ? (
            <>
              <RefreshIcon size={17} className="animate-spin" />
              <span>Analyzing video...</span>
            </>
          ) : (
            <>
              <DownloadIcon size={17} />
              <span>Get Download Links</span>
            </>
          )}
        </button>
      </div>

      {/* Platform detection badge */}
      {platformMeta && (
        <div style={{
          marginTop: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}>
          <span style={{
            fontSize: "0.72rem",
            color: "var(--text-tertiary)",
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "3px 10px",
            borderRadius: "20px",
            background: "var(--bg-secondary)",
            border: "1px solid var(--border)",
          }}>
            <span style={{ fontSize: "0.8rem" }}>{platformMeta.emoji}</span>
            {platformMeta.label} detected
          </span>
        </div>
      )}
    </div>
  );
};
