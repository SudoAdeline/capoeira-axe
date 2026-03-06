import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const TAGLINES = [
  "One roda, every nation",
  "From Salvador to Seoul",
  "From Bahia to Berlin",
  "160+ countries, one game",
  "Where rhythm meets resistance",
];

const FLOATING_WORDS = [
  "ginga", "axe", "malicia", "mandinga", "jogo", "roda",
  "berimbau", "pandeiro", "fundamento", "liberdade",
];

export default function LoginScreen({ onShowPrivacy }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tagline] = useState(() => TAGLINES[Math.floor(Math.random() * TAGLINES.length)]);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setEntered(true));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "register") {
        if (!agreedToPrivacy) { setError("Please agree to the privacy policy"); setLoading(false); return; }
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#1A0F08",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "'DM Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes loginPulse {
          0%, 100% { opacity: 0.08; transform: scale(1); }
          50% { opacity: 0.15; transform: scale(1.05); }
        }
        @keyframes loginDrift {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(30px); opacity: 0; }
        }
        @keyframes loginFadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes loginGlow {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(212,168,67,0.3)); }
          50% { filter: drop-shadow(0 0 40px rgba(232,101,43,0.4)); }
        }
        @keyframes loginWordFloat {
          0% { transform: translateY(20px) rotate(-2deg); opacity: 0; }
          20% { opacity: 0.06; }
          80% { opacity: 0.06; }
          100% { transform: translateY(-30px) rotate(2deg); opacity: 0; }
        }
      `}</style>

      {/* Warm radial glow background */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 40%, rgba(212,168,67,0.12) 0%, rgba(232,101,43,0.06) 30%, transparent 70%)",
        animation: "loginPulse 8s ease-in-out infinite",
      }} />

      {/* Second glow layer */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(circle at 30% 70%, rgba(232,101,43,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(212,168,67,0.06) 0%, transparent 50%)",
      }} />

      {/* Floating dust particles */}
      {[...Array(20)].map((_, i) => (
        <div key={`p${i}`} style={{
          position: "absolute",
          width: 2 + (i % 3),
          height: 2 + (i % 3),
          borderRadius: "50%",
          background: i % 3 === 0 ? "#D4A843" : i % 3 === 1 ? "#E8652B" : "#C77A29",
          left: `${5 + (i * 4.7) % 90}%`,
          bottom: `-${10 + (i * 7) % 20}%`,
          animation: `loginDrift ${12 + i * 1.5}s ease-in-out infinite ${i * 0.8}s`,
          opacity: 0,
        }} />
      ))}

      {/* Floating Portuguese words */}
      {FLOATING_WORDS.map((word, i) => (
        <div key={word} style={{
          position: "absolute",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: `${0.8 + (i % 3) * 0.4}rem`,
          letterSpacing: "0.15em",
          color: "#D4A843",
          left: `${8 + (i * 9.3) % 80}%`,
          top: `${15 + (i * 11.7) % 65}%`,
          animation: `loginWordFloat ${15 + i * 2}s ease-in-out infinite ${i * 1.3}s`,
          opacity: 0,
          pointerEvents: "none",
          userSelect: "none",
        }}>{word}</div>
      ))}

      {/* Horizon line */}
      <div style={{
        position: "absolute",
        bottom: "18%", left: 0, right: 0,
        height: 1,
        background: "linear-gradient(90deg, transparent 0%, rgba(212,168,67,0.15) 30%, rgba(212,168,67,0.25) 50%, rgba(212,168,67,0.15) 70%, transparent 100%)",
      }} />

      {/* Main content */}
      <div style={{
        width: "100%",
        maxWidth: 400,
        textAlign: "center",
        position: "relative",
        zIndex: 1,
        opacity: entered ? 1 : 0,
        transform: entered ? "translateY(0)" : "translateY(40px)",
        transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        {/* Logo */}
        <div style={{
          fontSize: "clamp(4.5rem, 16vw, 7rem)",
          fontWeight: 800,
          fontFamily: "'Bebas Neue', sans-serif",
          letterSpacing: "0.12em",
          lineHeight: 1.1,
          paddingTop: 8,
          background: "linear-gradient(135deg, #D4A843 0%, #E8652B 50%, #D4A843 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          marginBottom: 8,
          animation: "loginGlow 4s ease-in-out infinite",
        }}>AXÉ</div>

        {/* Subtitle */}
        <div style={{
          fontSize: "0.75rem",
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "rgba(212,168,67,0.5)",
          marginBottom: 8,
          fontWeight: 300,
        }}>Capoeira Progression Guide</div>

        {/* Tagline */}
        <div style={{
          fontSize: "0.9rem",
          fontStyle: "italic",
          color: "rgba(212,168,67,0.35)",
          marginBottom: 48,
          fontWeight: 300,
          animation: "loginFadeUp 1.5s ease both 0.6s",
          opacity: 0,
        }}>{tagline}</div>

        {/* Card */}
        <form onSubmit={handleSubmit} style={{
          background: "rgba(253,246,236,0.04)",
          backdropFilter: "blur(20px)",
          borderRadius: 20,
          padding: "36px 28px",
          border: "1px solid rgba(212,168,67,0.12)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,168,67,0.08)",
          animation: "loginFadeUp 1s ease both 0.3s",
          opacity: 0,
        }}>
          <h2 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "1.5rem",
            letterSpacing: "0.08em",
            color: "#FDF6EC",
            margin: "0 0 6px",
          }}>
            {mode === "login" ? "Welcome Back" : "Enter the Roda"}
          </h2>
          <p style={{
            fontSize: "0.8rem",
            color: "rgba(212,168,67,0.45)",
            margin: "0 0 28px",
            fontWeight: 300,
          }}>
            {mode === "login" ? "Your training awaits" : "Join capoeiristas worldwide"}
          </p>

          {mode === "register" && (
            <input
              type="text"
              placeholder="Apelido"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "14px 18px",
                borderRadius: 12,
                border: "1px solid rgba(212,168,67,0.15)",
                background: "rgba(253,246,236,0.06)",
                fontSize: "0.95rem",
                fontFamily: "'DM Sans', sans-serif",
                color: "#FDF6EC",
                outline: "none",
                marginBottom: 12,
                boxSizing: "border-box",
                transition: "border-color 0.3s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(212,168,67,0.4)"}
              onBlur={e => e.target.style.borderColor = "rgba(212,168,67,0.15)"}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: 12,
              border: "1px solid rgba(212,168,67,0.15)",
              background: "rgba(253,246,236,0.06)",
              fontSize: "0.95rem",
              fontFamily: "'DM Sans', sans-serif",
              color: "#FDF6EC",
              outline: "none",
              marginBottom: 12,
              boxSizing: "border-box",
              transition: "border-color 0.3s",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(212,168,67,0.4)"}
            onBlur={e => e.target.style.borderColor = "rgba(212,168,67,0.15)"}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            style={{
              width: "100%",
              padding: "14px 18px",
              borderRadius: 12,
              border: "1px solid rgba(212,168,67,0.15)",
              background: "rgba(253,246,236,0.06)",
              fontSize: "0.95rem",
              fontFamily: "'DM Sans', sans-serif",
              color: "#FDF6EC",
              outline: "none",
              marginBottom: 22,
              boxSizing: "border-box",
              transition: "border-color 0.3s",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(212,168,67,0.4)"}
            onBlur={e => e.target.style.borderColor = "rgba(212,168,67,0.15)"}
          />

          {mode === "register" && (
            <label style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              marginBottom: 18,
              cursor: "pointer",
              textAlign: "left",
            }}>
              <input
                type="checkbox"
                checked={agreedToPrivacy}
                onChange={e => setAgreedToPrivacy(e.target.checked)}
                style={{
                  marginTop: 3,
                  accentColor: "#D4A843",
                  width: 16,
                  height: 16,
                  flexShrink: 0,
                }}
              />
              <span style={{
                fontSize: "0.8rem",
                color: "rgba(212,168,67,0.45)",
                lineHeight: 1.5,
              }}>
                I agree to the{" "}
                <span
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); onShowPrivacy?.(); }}
                  style={{ color: "#D4A843", textDecoration: "underline", cursor: "pointer" }}
                >privacy policy</span>
              </span>
            </label>
          )}

          {error && (
            <div style={{
              color: "#E8652B",
              fontSize: "0.85rem",
              marginBottom: 16,
              padding: "10px 14px",
              background: "rgba(232,101,43,0.1)",
              borderRadius: 10,
              border: "1px solid rgba(232,101,43,0.2)",
            }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px 24px",
              borderRadius: 14,
              border: "none",
              background: "linear-gradient(135deg, #D4A843, #E8652B)",
              color: "#fff",
              fontSize: "1rem",
              fontWeight: 600,
              fontFamily: "'DM Sans', sans-serif",
              cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
              letterSpacing: "0.06em",
              transition: "all 0.3s",
              boxShadow: "0 4px 20px rgba(212,168,67,0.3)",
            }}
            onMouseEnter={e => { if (!loading) { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 8px 30px rgba(212,168,67,0.4)"; }}}
            onMouseLeave={e => { e.target.style.transform = "none"; e.target.style.boxShadow = "0 4px 20px rgba(212,168,67,0.3)"; }}
          >
            {loading
              ? "..."
              : mode === "login" ? "Sign In" : "Join the Roda"
            }
          </button>

          <div style={{
            marginTop: 22,
            fontSize: "0.85rem",
            color: "rgba(212,168,67,0.4)",
          }}>
            {mode === "login" ? (
              <>New to AXÉ?{" "}
                <span
                  onClick={() => { setMode("register"); setError(""); }}
                  style={{ color: "#D4A843", cursor: "pointer", fontWeight: 600, transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.target.style.opacity = "0.7"}
                  onMouseLeave={e => e.target.style.opacity = "1"}
                >Enter the roda</span>
              </>
            ) : (
              <>Already training?{" "}
                <span
                  onClick={() => { setMode("login"); setError(""); }}
                  style={{ color: "#D4A843", cursor: "pointer", fontWeight: 600, transition: "opacity 0.2s" }}
                  onMouseEnter={e => e.target.style.opacity = "0.7"}
                  onMouseLeave={e => e.target.style.opacity = "1"}
                >Welcome back</span>
              </>
            )}
          </div>
        </form>

        {/* Bottom flourish */}
        <div style={{
          marginTop: 40,
          fontSize: "0.7rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(212,168,67,0.15)",
          fontWeight: 300,
          animation: "loginFadeUp 1.5s ease both 1s",
          opacity: 0,
        }}>
          Built by a capoeirista, for capoeiristas
        </div>
      </div>
    </div>
  );
}
