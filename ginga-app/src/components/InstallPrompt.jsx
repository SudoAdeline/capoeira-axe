import { useState, useEffect } from "react";

export default function InstallPrompt({ colors: c }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);
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

    // Show the modal after a short delay so it feels intentional
    const timer = setTimeout(() => {
      if (!localStorage.getItem("axe_install_dismissed")) {
        setShowModal(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, [isStandalone]);

  if (isStandalone || dismissed || localStorage.getItem("axe_install_dismissed")) return null;
  if (!showModal) return null;

  const dismiss = () => {
    setDismissed(true);
    setShowModal(false);
    localStorage.setItem("axe_install_dismissed", "1");
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") dismiss();
      setDeferredPrompt(null);
    }
  };

  return (
    <div
      onClick={dismiss}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
        animation: "fadeUp 0.3s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(145deg, #2A1A10, #1A0F08)",
          border: `1px solid ${c.gold}44`,
          borderRadius: 20,
          padding: "40px 32px",
          width: "100%",
          maxWidth: 380,
          textAlign: "center",
          animation: "fadeUp 0.4s ease both 0.1s",
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${c.gold}15`,
        }}
      >
        {/* App icon */}
        <div style={{
          width: 72, height: 72, margin: "0 auto 20px",
          borderRadius: 16,
          background: `linear-gradient(135deg, #E8652B, #D4A843)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2rem",
          boxShadow: `0 8px 32px rgba(232,101,43,0.3)`,
        }}>
          <span style={{
            fontFamily: "'Helvetica Neue','Arial Black',Arial,sans-serif",
            fontWeight: 900, fontSize: "1.4rem", color: "#fff",
            letterSpacing: "0.05em",
          }}>AXÉ</span>
        </div>

        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "1.8rem",
          letterSpacing: "0.06em",
          color: c.text || "#F5E6D3",
          margin: "0 0 8px",
        }}>Get the App</h2>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.92rem",
          color: c.textMuted || "#8B7355",
          lineHeight: 1.6,
          margin: "0 0 28px",
        }}>
          {isIOS
            ? "Add AXÉ to your home screen for instant access — works offline, feels native."
            : "Install AXÉ on your device. One tap, instant access, works offline."
          }
        </p>

        {!deferredPrompt && (
          <div style={{
            textAlign: "left",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.9rem",
            color: c.textMuted || "#8B7355",
            lineHeight: 1.8,
            marginBottom: 24,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 12,
            padding: "18px 20px",
          }}>
            {isIOS ? (
              <>
                <p style={{ marginBottom: 10 }}>
                  <strong style={{ color: c.text || "#F5E6D3" }}>1.</strong>{" "}
                  Tap <strong style={{ color: c.text || "#F5E6D3" }}>Share</strong>{" "}
                  <span style={{ fontSize: "1.1em" }}>(&#x2191;)</span> at the bottom of Safari
                </p>
                <p style={{ marginBottom: 10 }}>
                  <strong style={{ color: c.text || "#F5E6D3" }}>2.</strong>{" "}
                  Scroll down and tap <strong style={{ color: c.text || "#F5E6D3" }}>"Add to Home Screen"</strong>
                </p>
                <p>
                  <strong style={{ color: c.text || "#F5E6D3" }}>3.</strong>{" "}
                  Tap <strong style={{ color: c.text || "#F5E6D3" }}>"Add"</strong> — that's it! Open AXÉ from your home screen.
                </p>
              </>
            ) : (
              <>
                <p style={{ marginBottom: 10 }}>
                  <strong style={{ color: c.text || "#F5E6D3" }}>1.</strong>{" "}
                  Tap the <strong style={{ color: c.text || "#F5E6D3" }}>menu</strong>{" "}
                  <span style={{ fontSize: "1.1em" }}>(&#x22EE;)</span> in your browser
                </p>
                <p style={{ marginBottom: 10 }}>
                  <strong style={{ color: c.text || "#F5E6D3" }}>2.</strong>{" "}
                  Tap <strong style={{ color: c.text || "#F5E6D3" }}>"Add to Home Screen"</strong> or <strong style={{ color: c.text || "#F5E6D3" }}>"Install App"</strong>
                </p>
                <p>
                  <strong style={{ color: c.text || "#F5E6D3" }}>3.</strong>{" "}
                  Tap <strong style={{ color: c.text || "#F5E6D3" }}>"Install"</strong> — done! Open AXÉ from your home screen.
                </p>
              </>
            )}
          </div>
        )}

        <button
          onClick={deferredPrompt ? handleInstall : dismiss}
          style={{
            width: "100%",
            padding: "16px 24px",
            background: `linear-gradient(135deg, #E8652B, #D4A843)`,
            border: "none",
            borderRadius: 12,
            color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
            letterSpacing: "0.02em",
            boxShadow: "0 4px 20px rgba(232,101,43,0.3)",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={e => { e.target.style.transform = "scale(1.03)"; e.target.style.boxShadow = "0 6px 28px rgba(232,101,43,0.4)"; }}
          onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 4px 20px rgba(232,101,43,0.3)"; }}
        >
          {deferredPrompt ? "Install Now" : "Got it"}
        </button>

        <button
          onClick={dismiss}
          style={{
            marginTop: 14,
            background: "none",
            border: "none",
            color: c.textMuted || "#8B7355",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.82rem",
            cursor: "pointer",
            padding: "8px",
            opacity: 0.7,
          }}
        >Maybe later</button>
      </div>
    </div>
  );
}
