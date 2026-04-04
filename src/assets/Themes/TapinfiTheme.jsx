// src/assets/Themes/TapinfiTheme.jsx
import React from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
  FaShareAlt,
  FaArrowLeft,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
  FaChevronRight,
} from "react-icons/fa";
import { MdInsertDriveFile } from "react-icons/md";
import SaveProfileButton from "../../components/SaveProfileButton";

function XIcon({ size = 20, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.751 3h3.067l-6.7 7.625L22 21h-6.172l-4.833-6.293L5.464 21H2.395l7.167-8.155L2 3h6.328l4.37 5.695L17.751 3zm-1.076 16.172h1.7L7.404 4.732H5.58l11.095 14.44z" fill={color} />
    </svg>
  );
}

function DiamondPattern() {
  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      viewBox="0 0 400 220"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>

        {/*DIAGONAL GRADIENT (TOP RIGHT → BOTTOM LEFT) */}
        <linearGradient id="bg-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3a8fb5" />
          <stop offset="40%" stopColor="#6fb7d6" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>

        {/* GLOW EFFECT */}
        <radialGradient id="diamond-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* 🔷 ENHANCED DIAMOND PATTERN */}
        <pattern
          id="tapinfi-diamonds"
          x="0"
          y="0"
          width="64"
          height="64"
          patternUnits="userSpaceOnUse"
        >
          <polygon
            points="32,4 60,32 32,60 4,32"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1.2"
          />
          <polygon
            points="32,10 54,32 32,54 10,32"
            fill="rgba(255,255,255,0.08)"
          />
        </pattern>

      </defs>

      {/* BACKGROUND GRADIENT */}
      <rect width="400" height="220" fill="url(#bg-gradient)" />

      {/*PATTERN OVERLAY */}
      <rect width="400" height="220" fill="url(#tapinfi-diamonds)" />

      {/*LARGE ABSTRACT DIAMONDS (DEPTH LAYER) */}
      <polygon
        points="310,20 390,100 310,180 230,100"
        fill="url(#diamond-glow)"
        opacity="0.35"
      />

      <polygon
        points="260,0 340,80 260,160 180,80"
        fill="none"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1.5"
      />

      <polygon
        points="80,40 140,100 80,160 20,100"
        fill="rgba(255,255,255,0.06)"
      />

      {/* SOFT LIGHT OVERLAY */}
      <rect
        width="400"
        height="220"
        fill="url(#bg-gradient)"
        opacity="0.15"
      />

    </svg>
  );
}
export default function TapinfiTheme({ profile }) {
  if (!profile) return null;

  const {
    full_name,
    username,
    role,
    company,
    about,
    profile_pic_url,
    company_logo_url,
    phone_number,
    user_email,
    website_url,
    location,
    map_url,
    instagram_url,
    linkedin_url,
    twitter_url,
    whatsapp_url,
    portfolio_url,
    pitch_deck_url,
  } = profile;

  const handleAddToContacts = () => {
    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${full_name || ""}\nORG:${company || ""}\nTITLE:${role || ""}\nTEL:${phone_number || ""}\nEMAIL:${user_email || ""}\nURL:${website_url || ""}\nEND:VCARD`.trim();
    const blob = new Blob([vcard], { type: "text/vcard" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${full_name || "contact"}.vcf`;
    a.click();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: `${full_name} • Tapinfi`, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); alert("Link copied"); }
    } catch (e) { console.error(e); }
  };

  const contactRows = [
    { href: phone_number ? `tel:${phone_number}` : null, Icon: FaPhoneAlt, value: phone_number },
    { href: user_email ? `mailto:${user_email}` : null, Icon: FaEnvelope, value: user_email },
    {
      href: website_url ? (website_url.startsWith("http") ? website_url : `https://${website_url}`) : null,
      Icon: FaGlobe,
      value: "Visit Website",
    },
    {
      href: map_url || null,
      Icon: FaMapMarkerAlt,
      value: "View Location"
    },
  ].filter((r) => r.value);

  const socialList = [
    { key: "facebook", url: profile.facebook_url || "", Icon: FaFacebookF, color: "#1877F2" },
    { key: "instagram", url: instagram_url, Icon: FaInstagram, color: "#E4405F" },
    { key: "linkedin", url: linkedin_url, Icon: FaLinkedinIn, color: "#0A66C2" },
    { key: "x", url: twitter_url, Icon: null, color: "#000" },
    { key: "whatsapp", url: whatsapp_url, Icon: FaWhatsapp, color: "#25D366" },
  ].filter((s) => s.url);

  const hasDocs = Boolean(pitch_deck_url || portfolio_url);
  const teal = "#3a8fb5";
  const navy = "#1a3a52";

  // ── Layout measurements ─────────────────────────────────────────────────────
  const COVER_HEIGHT = 220;   // blurred cover photo height
  const PIC_W        = 175;   // profile pic width
  const PIC_H        = 200;   // profile pic height
  // Profile pic is centered vertically at the cover/card boundary:
  // its top starts at (COVER_HEIGHT - PIC_H/2) => straddles the join
  const PIC_TOP      = COVER_HEIGHT - PIC_H / 2;   // ~120px from top
  // Card starts behind the bottom half of the pic
  const CARD_TOP     = COVER_HEIGHT - 16;  // card slides up just under cover, rounded corners peek up

  return (
    <div
      className="min-h-screen bg-white flex justify-center"
      style={{ fontFamily: "'Segoe UI', sans-serif" }}
    >
      {/* Outer wrapper — position:relative so absolute children anchor here */}
      <div className="w-full max-w-md" style={{ position: "relative", paddingBottom: 40 }}>

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 0 — Blurred cover photo  (zIndex: 1)
            Full-bleed, top of page, only COVER_HEIGHT tall
        ══════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: COVER_HEIGHT,
            overflow: "hidden",
            zIndex: 1,           // lowest — sits behind everything
          }}
        >
          <img
            src={profile_pic_url || "https://via.placeholder.com/500x300"}
            alt=""
            aria-hidden="true"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center top",
              filter: "blur(16px) brightness(0.78) saturate(1.2)",
              transform: "scale(1.10)", // hides blur fringe
              display: "block",
            }}
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 1 — Light-blue abstract card  (zIndex: 2)
            Starts at CARD_TOP with rounded top corners
            Contains name / role / company / logo
        ══════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            marginTop: CARD_TOP,
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
            background: "linear-gradient(165deg, #edf5fc 0%, #d8ecf8 30%, #c4e0f4 65%, #b4d4ee 100%)",
            overflow: "hidden",
            // paddingTop must leave room for the bottom half of the profile pic
            paddingTop: PIC_H / 2 + 20,
            paddingBottom: 28,
          }}
        >
          <DiamondPattern />

          {/* Name / role / company  +  company logo */}
          <div
            style={{
              position: "relative",
              zIndex: 5,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              padding: "0 20px",
            }}
          >
            {/* Left: text block — divider line on the RIGHT */}
            <div
              style={{
                flex: 1,
                marginTop: 15,   // pulls text up to visually align better with profile pic
                paddingRight: 5,
                borderRight: "3px solid rgba(0, 0, 0, 0.75)",
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#1a2e42",
                  letterSpacing: 0.5,
                  lineHeight: 1.2,
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                {full_name}
              </h2>
              {role && (
                <p style={{ fontSize: 13, color: "#4a6a82", marginTop: 5, marginBottom: 0, fontWeight: 500 }}>
                  {role}
                </p>
              )}
              {company && (
                <p style={{ fontSize: 13, color: "#4a6a82", marginTop: 2, marginBottom: 0, fontWeight: 500 }}>
                  {company}
                </p>
              )}
            </div>

            {/* Right: company logo or tapinfi fallback badge */}
            <div style={{ paddingLeft: 16, flexShrink: 0 }}>
              {company_logo_url ? (
                <div
                  style={{
                    width: 90,
                    height: 90,
                    marginTop: 15,
                    marginLeft: 50,
                    overflow: "hidden"
                  }}
                >
                  <img
                    src={company_logo_url}
                    alt={company || "Company logo"}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
              ) : (
                <div
                  style={{
                    width: 74,
                    height: 74,
                    marginTop: 15,
                    borderRadius: 14,
                    background: "#111111",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.30)",
                    border: "2px solid rgba(255,255,255,0.18)",
                  }}
                >
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: 0.3 }}>
                    tapinfi
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 2 — Profile picture  (zIndex: 20)
            Absolutely positioned on the OUTER wrapper so it is above
            BOTH the cover photo and the abstract card.
            Centered horizontally, top at PIC_TOP so it straddles the join.
        ══════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: "absolute",
            top: PIC_TOP,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 20,          // above cover (1) and card (2)
            width: PIC_W,
            height: PIC_H,
            borderRadius: 18,
            overflow: "hidden",
            boxShadow: "0 14px 40px rgba(0,0,0,0.32)",
            border: "3px solid rgba(255,255,255,0.70)",
          }}
        >
          <img
            src={profile_pic_url || "https://via.placeholder.com/300"}
            alt={full_name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            LAYER 3 — Top nav: back / share / save  (zIndex: 30)
        ══════════════════════════════════════════════════════════════════ */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px 0",
          }}
        >
          <button
            onClick={() => window.history.back()}
            aria-label="Back"
            className="w-9 h-9 flex items-center justify-center rounded-full shadow-sm hover:bg-white transition"
            style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(6px)" }}
          >
            <FaArrowLeft size={16} color={navy} />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              aria-label="Share"
              className="w-9 h-9 flex items-center justify-center rounded-full shadow-sm hover:bg-white transition"
              style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(6px)" }}
            >
              <FaShareAlt size={15} color={navy} />
            </button>
            <SaveProfileButton
              profileUsername={username}
              className="w-9 h-9 flex items-center justify-center rounded-full shadow-sm text-gray-800 hover:bg-white transition"
              style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(6px)" }}
            />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            CONTENT — contact rows, button, sections, footer
            marginTop accounts for the full header height so nothing overlaps
        ══════════════════════════════════════════════════════════════════ */}
        <div style={{ padding: "20px 16px 0" }}>

          {/* Contact rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {contactRows.map(({ href, Icon, value }, i) => (
              <a
                key={i}
                href={href || undefined}
                onClick={(e) => !href && e.preventDefault()}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  background: "#ffffff",
                  borderRadius: 16,
                  boxShadow:
                    "0 4px 6px rgba(27,58,90,0.06), 0 10px 28px rgba(27,58,90,0.10), 0 1px 3px rgba(27,58,90,0.04)",
                  overflow: "hidden",
                  textDecoration: "none",
                  border: "1px solid rgba(200,220,240,0.55)",
                  minHeight: 58,
                }}
              >
                <div
                  style={{ width: 56, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      border: `1.5px solid ${teal}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#eef6fb",
                    }}
                  >
                    <Icon size={16} color={teal} />
                  </div>
                </div>
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: teal,
                    fontWeight: 500,
                    padding: "0 6px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {value}
                </span>
                <div
                  style={{
                    width: 70,
                    alignSelf: "stretch",
                    background: "linear-gradient(90deg, #0f2233 0%, #1c4f6b 50%, #4f8fa3 100%)",
                    boxShadow: `
                      0 10px 25px rgba(15, 34, 51, 0.4),
                      0 4px 10px rgba(79, 143, 163, 0.3),
                      0 0 20px rgba(79, 143, 163, 0.25)`,
                    borderRadius: "0 16px 16px 0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FaChevronRight size={14} color="#fff" />
                </div>
              </a>
            ))}
          </div>

          {/* Save Contact button */}
          <button
            onClick={handleAddToContacts}
            style={{
              display: "block",
              width: "70%",
              marginTop: 24,
              marginLeft: "auto",
              marginRight: "auto",
              padding: "15px 0",
              borderRadius: 14,
              background: "linear-gradient(90deg, #0f2233 0%, #1c4f6b 50%, #4f8fa3 100%)",
              boxShadow: `
                0 10px 25px rgba(15, 34, 51, 0.4),
                0 4px 10px rgba(79, 143, 163, 0.3),
                0 0 20px rgba(79, 143, 163, 0.25)`,
              color: "#fff",
              fontSize: 15,
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              letterSpacing: 0.5
            }}
          >
            Save Contact
          </button>

          {/* About */}
          {about && (
            <div style={{ marginTop: 30 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111", marginBottom: 8 }}>About</h3>
              <p style={{ fontSize: 14, color: "#444", lineHeight: 1.75, textAlign: "justify" }}>
                {about}
              </p>
            </div>
          )}

          {/* Company Portfolio */}
          {hasDocs && (
            <div style={{ marginTop: 30 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111", marginBottom: 12 }}>
                Company's Portfolio
              </h3>
              <a
                href={pitch_deck_url || portfolio_url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #deeaf4",
                  boxShadow: "0 2px 10px rgba(27,58,90,0.07)",
                  textDecoration: "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: "#f0f4f8",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MdInsertDriveFile size={20} color="#7a9ab0" />
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 500, color: "#222" }}>
                    {pitch_deck_url ? "Pitch deck.pdf" : "Portfolio"}
                  </span>
                </div>
                <FaChevronRight size={13} color="#aaa" />
              </a>
            </div>
          )}

          {/* Social Links */}
          {socialList.length > 0 && (
            <div style={{ marginTop: 30 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111", marginBottom: 14 }}>
                Social Links
              </h3>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {socialList.map(({ key, url, Icon, color }, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    title={key}
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: "#fff",
                      border: "1px solid #ddeaf4",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textDecoration: "none",
                    }}
                  >
                    {key === "x" ? <XIcon size={20} color="#000" /> : <Icon size={20} color={color} />}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div style={{ marginTop: 32, textAlign: "center", fontSize: 13 }}>
            <span style={{ color: "#e05c2a", fontWeight: 500 }}>Powered by :</span>{" "}
            <a
              href="https://tapinfi.com"
              target="_blank"
              rel="noreferrer"
              style={{ fontWeight: 700, color: "#111", textDecoration: "none", marginLeft: 2 }}
            >
              Tapinfi Solutions Pvt Ltd
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}