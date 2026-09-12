import React from "react";
import {
  DownloadIcon,
  ScissorsIcon,
  PhotoIcon,
  SparklesIcon,
  ZapIcon,
  MusicIcon,
  ShieldIcon,
  KeyIcon,
  CommandIcon,
  VideoIcon,
  CheckCircleIcon,
} from "./icons/Icons.jsx";

export default function AppInstructions() {
  const guideSections = [
    {
      id: "quick-download",
      badge: "Step 1",
      badgeColor: "#3B82F6",
      title: "1-Click Universal Download",
      icon: <DownloadIcon size={18} />,
      desc: "Paste any video or post link from YouTube, Instagram, TikTok, Facebook, Twitter/X, Reddit, or 1,000+ supported sites.",
      tips: [
        "Press Ctrl + V anywhere in the app to auto-paste and analyze.",
        "Automatic quality scanner extracts 4K, 1080p, 720p, and MP3 audio instantly.",
        "TikTok videos are automatically stripped of watermarks in Full HD.",
      ],
    },
    {
      id: "trimmer",
      badge: "Step 2",
      badgeColor: "#8B5CF6",
      title: "Frame-Accurate Video Trimmer",
      icon: <ScissorsIcon size={18} />,
      desc: "Download only the exact highlight clip you need without wasting bandwidth or disk storage.",
      tips: [
        "Toggle the 'Video Trimmer' switch in the media preview panel.",
        "Set custom Start (e.g. 00:15) and End (e.g. 00:45) timestamps.",
        "Built-in 0ms Audio-Video Sync Guard ensures video frames and audio remain in perfect lockstep.",
      ],
    },
    {
      id: "instagram-suite",
      badge: "Step 3",
      badgeColor: "#EC4899",
      title: "Instagram Pro Studio",
      icon: <PhotoIcon size={18} />,
      desc: "All-in-one downloader for Reels, Posts, Carousels, Stories, Highlights, and Profile DPs.",
      tips: [
        "Download Full-HD (1080x1080) Profile Pictures by entering @username or profile URL.",
        "Click 'Connect Account' to unlock Private Stories and friends' Highlights securely.",
        "Batch-extract all photos and videos from multi-slide carousel posts.",
      ],
    },
    {
      id: "audio-4k",
      badge: "Step 4",
      badgeColor: "#10B981",
      title: "4K UHD & 320kbps MP3 Audio",
      icon: <MusicIcon size={18} />,
      desc: "Extract pristine audio tracks or download maximum resolution video streams without compression artifacts.",
      tips: [
        "Extract 320kbps high-bitrate MP3 or AAC with full ID3 album tags.",
        "Multi-threaded chunk engine downloads at maximum connection speeds.",
        "All videos are encoded into universal mobile-friendly MP4 files.",
      ],
    },
  ];

  const quickHotkeys = [
    { key: "Ctrl + K", action: "Focus & clear URL input" },
    { key: "Ctrl + V", action: "Instant paste & analyze" },
    { key: "Ctrl + T", action: "Toggle trimmer studio" },
    { key: "Ctrl + ,", action: "Open settings & accounts" },
  ];

  return (
    <section
      style={{
        marginTop: "32px",
        marginBottom: "20px",
        animation: "fadeIn 0.3s ease",
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "18px",
          paddingBottom: "12px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#A78BFA",
            }}
          >
            <SparklesIcon size={18} />
          </div>
          <div>
            <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#FFFFFF", margin: 0, letterSpacing: "-0.01em" }}>
              Quickstart & Feature Instructions
            </h3>
            <p style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", margin: "2px 0 0 0" }}>
              Master 4K downloads, clip trimming, Instagram HD DPs, and desktop shortcuts
            </p>
          </div>
        </div>

        {/* Hotkeys Quick Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flexWrap: "wrap",
            background: "rgba(255, 255, 255, 0.03)",
            padding: "5px 10px",
            borderRadius: "10px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
            <CommandIcon size={12} /> Hotkeys:
          </span>
          {quickHotkeys.map((hk, i) => (
            <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <kbd
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.15)",
                  color: "var(--text-primary)",
                  fontSize: "0.68rem",
                  padding: "2px 6px",
                  borderRadius: "5px",
                  fontFamily: "monospace",
                  fontWeight: 700,
                }}
              >
                {hk.key}
              </kbd>
              <span style={{ fontSize: "0.68rem", color: "var(--text-secondary)" }}>{hk.action}</span>
              {i < quickHotkeys.length - 1 && <span style={{ color: "rgba(255,255,255,0.15)" }}>•</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Grid of Instruction Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "14px",
        }}
      >
        {guideSections.map((sec) => (
          <div
            key={sec.id}
            style={{
              background: "rgba(18, 22, 32, 0.7)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.07)",
              borderRadius: "14px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            {/* Card Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  color: sec.badgeColor,
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "8px",
                    background: `${sec.badgeColor}18`,
                    border: `1px solid ${sec.badgeColor}35`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {sec.icon}
                </div>
                <span style={{ fontSize: "0.86rem", fontWeight: 800, color: "#FFFFFF" }}>{sec.title}</span>
              </div>
              <span
                style={{
                  fontSize: "0.64rem",
                  fontWeight: 800,
                  padding: "2px 7px",
                  borderRadius: "12px",
                  background: `${sec.badgeColor}22`,
                  color: sec.badgeColor,
                  border: `1px solid ${sec.badgeColor}40`,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {sec.badge}
              </span>
            </div>

            {/* Description */}
            <p
              style={{
                fontSize: "0.78rem",
                color: "var(--text-secondary)",
                lineHeight: 1.45,
                margin: "0 0 12px 0",
              }}
            >
              {sec.desc}
            </p>

            {/* Bullet Highlights */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "auto" }}>
              {sec.tips.map((tip, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: "6px", fontSize: "0.73rem", color: "var(--text-tertiary)", lineHeight: 1.35 }}>
                  <div style={{ marginTop: "2px", flexShrink: 0, color: sec.badgeColor }}>
                    <CheckCircleIcon size={12} />
                  </div>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
