import { useState, useEffect } from "react";

export default function InstallPrompt({ colors: c }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    || navigator.standalone === true;

  useEffect(() => {
    if (isStandalone || localStorage.getItem("axe_install_dismissed")) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isStandalone]);

  if (isStandalone || dismissed || localStorage.getItem("axe_install_dismissed")) return null;

  // Nothing to show if not iOS and no deferred prompt
  if (!isIOS && !deferredPrompt) return null;

  const dismiss = () => {
    setDismissed(true);
    localStorage.setItem("axe_install_dismissed", "1");
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") dismiss();
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <div style={{
        background: `${c.gold}15`,
        border: `1px solid ${c.gold}33`,
        borderRadius: 12,
        padding: "12px 16px",
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "0.85rem",
        color: c.text,
        animation: "fadeUp 0.4s ease both",
      }}>
        <span style={{ flex: 1 }}>
          Install AXE on your phone for the full experience
        </span>
        <button
          onClick={handleInstall}
          style={{
            background: c.gold,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "8px 16px",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 600,
            fontSize: "0.8rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {isIOS ? "How?" : "Install"}
        </button>
        <button onClick={dismiss} style={{
          background: "none",
          border: "none",
          color: c.textMuted,
          cursor: "pointer",
          fontSize: "1.1rem",
          padding: "0 2px",
          lineHeight: 1,
        }}>&times;</button>
      </div>

      {showIOSGuide && (
        <div
          onClick={() => setShowIOSGuide(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "flex-end", justifyContent: "center",
            padding: 24, animation: "fadeUp 0.2s ease both",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: c.bgCard || "#2A1A10",
              border: `1px solid ${c.border}`,
              borderRadius: 16,
              padding: "28px 24px",
              width: "100%",
              maxWidth: 400,
              animation: "fadeUp 0.3s ease both",
            }}
          >
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "1.4rem",
              letterSpacing: "0.04em",
              color: c.text,
              margin: "0 0 16px",
            }}>Install on iPhone / iPad</h3>
            <div style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "0.9rem",
              color: c.textMuted,
              lineHeight: 1.7,
            }}>
              <p style={{ marginBottom: 12 }}>
                <strong style={{ color: c.text }}>1.</strong> Tap the{" "}
                <strong style={{ color: c.text }}>Share</strong> button{" "}
                <span style={{ fontSize: "1.1em" }}>(&#x2191;)</span> at the bottom of Safari
              </p>
              <p style={{ marginBottom: 12 }}>
                <strong style={{ color: c.text }}>2.</strong> Scroll down and tap{" "}
                <strong style={{ color: c.text }}>"Add to Home Screen"</strong>
              </p>
              <p style={{ marginBottom: 12 }}>
                <strong style={{ color: c.text }}>3.</strong> Tap{" "}
                <strong style={{ color: c.text }}>"Add"</strong> — done! Open it from your home screen.
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              style={{
                marginTop: 16,
                width: "100%",
                padding: "12px",
                background: c.gold,
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                fontSize: "0.9rem",
                cursor: "pointer",
              }}
            >Got it</button>
          </div>
        </div>
      )}
    </>
  );
}
