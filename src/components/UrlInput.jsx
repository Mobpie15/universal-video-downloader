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
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && url.trim() && !isLoading) {
      onFetch();
    }
  };

  const platform = detectPlatform(url);
  const platformLabel = {
    youtube: "YouTube",
    instagram: "Instagram",
    tiktok: "TikTok",
    facebook: "Facebook",
    twitter: "X / Twitter",
  }[platform];

  return (
    <div style={{ width: "100%", marginBottom: "20px" }} className="animate-fadeIn">
      {/* Clipboard Smart Banner */}
      {clipboardUrl && !url && (
        <button
          type="button"
          onClick={handleApplyClipboard}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "10px 14px",
            marginBottom: "12px",
            borderRadius: "var(--radius-md)",
            background: "var(--accent-muted)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            color: "var(--text-primary)",
            textAlign: "left",
          }}
        >
          <SparklesIcon size={16} style={{ color: "var(--accent-light)", flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.8rem", fontWeight: 600, marginBottom: "1px" }}>
              Video link found in clipboard
            </div>
            <div style={{
              fontSize: "0.72rem",
              color: "var(--text-secondary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}>
              {clipboardUrl}
            </div>
          </div>
          <span style={{
            padding: "4px 12px",
            borderRadius: "var(--radius-sm)",
            background: "var(--accent-gradient)",
            color: "#FFF",
            fontSize: "0.72rem",
            fontWeight: 700,
            flexShrink: 0,
          }}>
            Use
          </span>
        </button>
      )}

      {/* Input + Button */}
      <div style={{
        background: "var(--bg-secondary)",
        border: `1px solid ${url ? "var(--border-active)" : "var(--border)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "6px",
        transition: "border-color 0.2s ease",
      }}>
        {/* Input Row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "6px 10px",
          gap: "8px",
        }}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Paste video link here..."
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
            <button
              type="button"
              onClick={() => setUrl("")}
              style={{
                padding: "6px",
                color: "var(--text-tertiary)",
                display: "flex",
                alignItems: "center",
                borderRadius: "6px",
              }}
            >
              <CloseIcon size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePaste}
              style={{
                padding: "5px 10px",
                borderRadius: "var(--radius-sm)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                color: "var(--text-secondary)",
                fontSize: "0.76rem",
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

        {/* Fetch Button */}
        <button
          type="button"
          onClick={onFetch}
          disabled={!url.trim() || isLoading}
          style={{
            width: "100%",
            padding: "11px 16px",
            borderRadius: "var(--radius-md)",
            background: !url.trim() || isLoading
              ? "var(--bg-elevated)"
              : "var(--accent-gradient)",
            color: !url.trim() || isLoading ? "var(--text-tertiary)" : "#FFFFFF",
            fontWeight: 600,
            fontSize: "0.88rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            cursor: !url.trim() || isLoading ? "not-allowed" : "pointer",
            boxShadow: url.trim() && !isLoading ? "var(--accent-glow)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          {isLoading ? (
            <>
              <RefreshIcon size={16} className="animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <DownloadIcon size={16} />
              <span>Get Download Links</span>
            </>
          )}
        </button>
      </div>

      {/* Platform Detection Label */}
      {platformLabel && (
        <div style={{
          marginTop: "8px",
          paddingLeft: "4px",
          fontSize: "0.72rem",
          color: "var(--text-tertiary)",
          fontWeight: 500,
        }}>
          Detected: <span style={{ color: "var(--accent-light)", fontWeight: 600 }}>{platformLabel}</span>
        </div>
      )}
    </div>
  );
};
