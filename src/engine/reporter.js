import { getPlatformName } from "./nativeBridge.js";
import { CURRENT_VERSION } from "./updater.js";

export const DISCORD_WEBHOOK_URL =
  "https://discord.com/api/webhooks/1540228264092631091/hgjPsnKnL5iwQkoQ2sx-h75TBQSPqteSNEDKSNnBpFIpK_Tw8FngO7qK7sW38pABHe4g";

/**
 * Send automated or user-reported error diagnostic to Discord Webhook
 */
export async function sendErrorReport({
  errorMessage,
  errorStack,
  targetUrl,
  context = "General Error",
}) {
  const isElectron =
    typeof window !== "undefined" && Boolean(window.electronAPI?.isElectron);
  const platform = isElectron
    ? "Windows Desktop (Electron)"
    : `Mobile (${getPlatformName().toUpperCase()})`;

  const payload = {
    username: "Pie Downloader Error Bot",
    avatar_url: "https://raw.githubusercontent.com/Mobpie15/universal-video-downloader/main/public/logo.png",
    embeds: [
      {
        title: "Pie Video Downloader - Issue Report",
        color: 0xef4444, // Bright Red
        description: `An error occurred during **${context}**.`,
        fields: [
          {
            name: "Platform",
            value: platform,
            inline: true,
          },
          {
            name: "App Version",
            value: `v${CURRENT_VERSION}`,
            inline: true,
          },
          {
            name: "Target URL",
            value: targetUrl ? `\`${targetUrl.slice(0, 100)}\`` : "*Not specified*",
            inline: false,
          },
          {
            name: "Error Message",
            value: `\`\`\`\n${(errorMessage || "Unknown error").slice(0, 1000)}\n\`\`\``,
            inline: false,
          },
          ...(errorStack
            ? [
                {
                  name: "Stack Trace",
                  value: `\`\`\`\n${errorStack.slice(0, 500)}\n\`\`\``,
                  inline: false,
                },
              ]
            : []),
        ],
        footer: {
          text: "Pie Video Downloader Automated Diagnostics",
        },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Discord API responded with status ${response.status}`);
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to send error report to Discord:", err);
    return { success: false, error: err.message };
  }
}
