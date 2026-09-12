import React from "react";
import { CloseIcon, LightbulbIcon } from "./icons/Icons.jsx";

export default function ShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      category: "Navigation & Input",
      shortcuts: [
        { keys: ["Ctrl", "K"], description: "Focus & select URL input field" },
        { keys: ["Ctrl", "V"], description: "Instant paste clipboard & analyze" },
        { keys: ["Enter"], description: "Analyze URL or start active download" },
        { keys: ["Esc"], description: "Close modal / clear current media" },
      ],
    },
    {
      category: "Studio & Trimmer Controls",
      shortcuts: [
        { keys: ["Ctrl", "T"], description: "Toggle Video Trimmer ON / OFF" },
        { keys: ["Ctrl", "D"], description: "Start 1-click high-speed download" },
        { keys: ["Ctrl", "1"], description: "Select Recommended 1080p Full HD" },
        { keys: ["Ctrl", "2"], description: "Select 4K Ultra HD (2160p)" },
        { keys: ["Ctrl", "3"], description: "Select Studio Audio MP3 (320k)" },
      ],
    },
    {
      category: "General & Help",
      shortcuts: [
        { keys: ["Ctrl", ","], description: "Open Settings & App Updates" },
        { keys: ["Ctrl", "/"], description: "Show Keyboard Shortcuts Guide" },
      ],
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 110,
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "88vh",
          overflowY: "auto",
          background: "#0E131F",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "18px",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.65), 0 0 40px rgba(99, 102, 241, 0.12)",
          padding: "24px",
          color: "#FFFFFF",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
              }}
            >
              ⌨️
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 700, color: "#FFFFFF" }}>
                Keyboard Shortcuts
              </h3>
              <p style={{ margin: 0, fontSize: "0.74rem", color: "rgba(255, 255, 255, 0.55)" }}>
                Fast productivity hotkeys for Windows desktop
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "none",
              color: "rgba(255, 255, 255, 0.7)",
              borderRadius: "8px",
              width: "30px",
              height: "30px",
              cursor: "pointer",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Shortcut Groups */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <div
                style={{
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: "#818CF8",
                  marginBottom: "8px",
                }}
              >
                {group.category}
              </div>
              <div
                style={{
                  background: "rgba(255, 255, 255, 0.025)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {group.shortcuts.map((item, sIdx) => (
                  <div
                    key={sIdx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      borderBottom:
                        sIdx === group.shortcuts.length - 1
                          ? "none"
                          : "1px solid rgba(255, 255, 255, 0.04)",
                    }}
                  >
                    <span style={{ fontSize: "0.82rem", color: "rgba(255, 255, 255, 0.85)" }}>
                      {item.description}
                    </span>
                    <div style={{ display: "flex", gap: "4px" }}>
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          style={{
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.18)",
                            boxShadow: "0 2px 0 rgba(0, 0, 0, 0.4)",
                            borderRadius: "6px",
                            padding: "3px 8px",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            fontFamily: "monospace",
                            color: "#E0E7FF",
                          }}
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Hint */}
        <div
          style={{
            marginTop: "20px",
            padding: "10px 14px",
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            borderRadius: "10px",
            fontSize: "0.75rem",
            color: "rgba(255, 255, 255, 0.7)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <LightbulbIcon size={16} style={{ color: "#FBBF24", flexShrink: 0 }} />
          <span>Tip: Press <kbd style={{ background: "rgba(255,255,255,0.1)", padding: "1px 5px", borderRadius: "4px" }}>Ctrl + V</kbd> anywhere in the window to instantly paste and load your video.</span>
        </div>
      </div>
    </div>
  );
}
