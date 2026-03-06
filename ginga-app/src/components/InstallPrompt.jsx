import { useState, useEffect } from "react";

export default function InstallPrompt({ colors: c }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = isIOS || (/Safari/.test(ua) && !/Chrome/.test(ua));
  const isSamsung = /SamsungBrowser/.test(ua);
  const isFirefox = /Firefox/.test(ua);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    || navigator.standalone === true;

  useEffect(() => {
    if (isStandalone || localStorage.getItem("axe_install_dismissed")) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

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

  // Pick the right instructions for this browser
  const getSteps = () => {
    if (isIOS) {
      return [
        <>Tap the <strong>Share</strong> button <span style={{ fontSize: "1.2em" }}>⬆</span> at the bottom of your screen</>,
        <>Scroll the menu and tap <strong>"Add to Home Screen"</strong> <span style={{ fontSize: "1.1em" }}>➕</span></>,
        <>Tap <strong>"Add"</strong> in the top right — AXÉ is now on your home screen!</>,
      ];
    }
    if (isSamsung) {
      return [
        <>Tap the <strong>menu icon</strong> <span style={{ fontSize: "1.1em" }}>☰</span> (bottom right)</>,
        <>Tap <strong>"Add page to"</strong> then <strong>"Home screen"</strong></>,
        <>Tap <strong>"Add"</strong> — AXÉ is now on your home screen!</>,
      ];
    }
    if (isFirefox) {
      return [
        <>Tap the <strong>three dots</strong> <span style={{ fontSize: "1.1em" }}>⋮</span> menu (top or bottom right)</>,
        <>Tap <strong>"Install"</strong> or <strong>"Add to Home Screen"</strong></>,
        <>Confirm — AXÉ is now on your home screen!</>,
      ];
    }
    // Chrome / Edge / default Android
    return [
      <>Tap the <strong>three dots</strong> <span style={{ fontSize: "1.1em" }}>⋮</span> menu (top right corner)</>,
      <>Tap <strong>"Add to Home Screen"</strong> or <strong>"Install app"</strong></>,
      <>Tap <strong>"Install"</strong> — AXÉ is now on your home screen!</>,
    ];
  };

  const steps = getSteps();
  const showNativeInstall = !!deferredPrompt;

  const stepStyle = {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  };

  const numStyle = {
    flexShrink: 0,
    width: 28, height: 28,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #E8652B, #D4A843)",
    color: "#fff",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: "0.82rem",
    fontFamily: "'DM Sans', sans-serif",
  };

  const textStyle = {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.92rem",
    color: c.textMuted || "#8B7355",
    lineHeight: 1.5,
    paddingTop: 3,
  };

  const strongStyle = { color: c.text || "#F5E6D3" };

  return (
    <div
      onClick={dismiss}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
        animation: "fadeUp 0.3s ease both",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(160deg, #2A1A10, #1A0F08)",
          border: `1px solid ${c.gold}44`,
          borderRadius: 22,
          padding: "36px 28px 28px",
          width: "100%",
          maxWidth: 380,
          textAlign: "center",
          animation: "fadeUp 0.4s ease both 0.1s",
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 60px ${c.gold}15`,
        }}
      >
        {/* App icon */}
        <div style={{
          width: 68, height: 68, margin: "0 auto 18px",
          borderRadius: 16,
          background: "linear-gradient(135deg, #E8652B, #D4A843)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 8px 32px rgba(232,101,43,0.3)",
        }}>
          <span style={{
            fontFamily: "'Helvetica Neue','Arial Black',Arial,sans-serif",
            fontWeight: 900, fontSize: "1.3rem", color: "#fff",
            letterSpacing: "0.05em",
          }}>AXÉ</span>
        </div>

        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "1.7rem",
          letterSpacing: "0.06em",
          color: c.text || "#F5E6D3",
          margin: "0 0 6px",
        }}>Install AXÉ</h2>

        <p style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: "0.85rem",
          color: c.textMuted || "#8B7355",
          lineHeight: 1.5,
          margin: "0 0 24px",
        }}>
          Add it to your home screen — opens instantly, works offline, feels like a real app.
        </p>

        {showNativeInstall ? (
          <>
            <button
              onClick={handleInstall}
              style={{
                width: "100%",
                padding: "16px 24px",
                background: "linear-gradient(135deg, #E8652B, #D4A843)",
                border: "none",
                borderRadius: 12,
                color: "#fff",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(232,101,43,0.3)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={e => e.target.style.transform = "scale(1.03)"}
              onMouseLeave={e => e.target.style.transform = "scale(1)"}
            >
              Install Now
            </button>
          </>
        ) : (
          <div style={{
            textAlign: "left",
            marginBottom: 20,
            background: "rgba(255,255,255,0.03)",
            borderRadius: 14,
            padding: "20px 18px 8px",
          }}>
            {steps.map((step, i) => (
              <div key={i} style={stepStyle}>
                <div style={numStyle}>{i + 1}</div>
                <div style={{ ...textStyle, "& strong": strongStyle }}>
                  {/* Clone step content to apply strong styling */}
                  <span>{step}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!showNativeInstall && (
          <button
            onClick={dismiss}
            style={{
              width: "100%",
              padding: "14px 24px",
              background: "linear-gradient(135deg, #E8652B, #D4A843)",
              border: "none",
              borderRadius: 12,
              color: "#fff",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              boxShadow: "0 4px 20px rgba(232,101,43,0.3)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={e => e.target.style.transform = "scale(1.03)"}
            onMouseLeave={e => e.target.style.transform = "scale(1)"}
          >
            Got it
          </button>
        )}

        <button
          onClick={dismiss}
          style={{
            marginTop: 12,
            background: "none",
            border: "none",
            color: c.textMuted || "#8B7355",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "0.8rem",
            cursor: "pointer",
            padding: "8px",
            opacity: 0.6,
          }}
        >Maybe later</button>
      </div>
    </div>
  );
}
