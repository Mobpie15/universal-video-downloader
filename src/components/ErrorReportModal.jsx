import React, { useState } from "react";
import { CloseIcon, RefreshIcon, CheckIcon, ShieldIcon } from "./icons/Icons.jsx";
import { sendErrorReport } from "../engine/reporter.js";

export const ErrorReportModal = ({
  isOpen,
  onClose,
  errorMessage,
  errorStack,
  targetUrl,
  context = "Operation Error",
}) => {
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sendError, setSendError] = useState(null);

  if (!isOpen) return null;

  const handleReport = async () => {
    setIsSending(true);
    setSendError(null);
    try {
      const result = await sendErrorReport({
        errorMessage,
        errorStack,
        targetUrl,
        context,
      });

      if (result.success) {
        setIsSent(true);
        setTimeout(() => {
          onClose();
          setIsSent(false);
        }, 2200);
      } else {
        setSendError(result.error || "Failed to send report");
      }
    } catch (err) {
      setSendError(err.message || "Failed to transmit report");
    } finally {
      setIsSending(false);
    }
  };

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
        className="glass-panel"
        style={{
          width: "100%",
          maxWidth: "460px",
          borderRadius: "22px",
          border: "1px solid rgba(239, 68, 68, 0.35)",
          padding: "24px",
          boxShadow: "0 20px 48px rgba(0, 0, 0, 0.7), 0 0 24px rgba(239, 68, 68, 0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "var(--accent-red)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShieldIcon size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#FFFFFF", margin: 0 }}>
                Facing an Issue?
              </h3>
              <p style={{ fontSize: "0.74rem", color: "var(--text-secondary)", margin: 0 }}>
                Diagnostics &amp; Developer Report
              </p>
            </div>
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

        {/* Error Info Box */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "12px",
            padding: "12px 14px",
            marginBottom: "16px",
          }}
        >
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", marginBottom: "4px" }}>
            ERROR DETAILS
          </div>
          <div
            style={{
              fontSize: "0.8rem",
              color: "var(--accent-red)",
              fontFamily: "var(--font-mono)",
              wordBreak: "break-word",
              maxHeight: "100px",
              overflowY: "auto",
            }}
          >
            {errorMessage || "An unexpected error occurred while processing the request."}
          </div>
          {targetUrl && (
            <div style={{ marginTop: "6px", fontSize: "0.72rem", color: "var(--text-secondary)" }}>
              URL: <span style={{ fontFamily: "var(--font-mono)" }}>{targetUrl.slice(0, 60)}...</span>
            </div>
          )}
        </div>

        {/* Status Feedback */}
        {isSent ? (
          <div
            style={{
              background: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              borderRadius: "12px",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              color: "var(--accent-green)",
              fontWeight: 700,
              fontSize: "0.85rem",
              marginBottom: "12px",
            }}
          >
            <CheckIcon size={18} />
            <span>Report Sent! Developer Notified.</span>
          </div>
        ) : sendError ? (
          <div
            style={{
              fontSize: "0.75rem",
              color: "var(--accent-red)",
              marginBottom: "12px",
              textAlign: "center",
            }}
          >
            {sendError}
          </div>
        ) : null}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: "11px",
              borderRadius: "12px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "var(--text-secondary)",
              fontWeight: 700,
              fontSize: "0.84rem",
              cursor: "pointer",
            }}
          >
            Dismiss
          </button>

          {!isSent && (
            <button
              type="button"
              onClick={handleReport}
              disabled={isSending}
              style={{
                flex: 1.5,
                padding: "11px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                boxShadow: "0 4px 16px rgba(239, 68, 68, 0.35)",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "0.84rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                cursor: isSending ? "not-allowed" : "pointer",
              }}
            >
              {isSending ? (
                <>
                  <RefreshIcon size={15} className="animate-spin" />
                  <span>Sending Report...</span>
                </>
              ) : (
                <span>Report to Developer</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
