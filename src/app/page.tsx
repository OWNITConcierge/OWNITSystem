'use client'

import React from "react"
import { signIn } from "next-auth/react"

export default function Landing() {
  return (
    <div className="oi">
      {/* Background */}
      <div className="bg" />
      <div className="vignette" />
      <div className="glow glow1" />
      <div className="glow glow2" />
      <div className="noise" />

      {/* Top brand bar */}
<header className="top">
  <div className="brandImage">
    <img
      src="/logo.png"
      alt="Own It"
      className="logo"
    />
  </div>
</header>

      {/* Main */}
      <main className="wrap">
         <div className="centerGrid">
        <section className="left">
          <div className="kicker">WELCOME BACK</div>

          <h1 className="headline">
            Power your coaching.
            <br />
            Deliver clarity at scale.
          </h1>

          <p className="subhead">
            Sign in to the NEW OI System to generate personalized client reports, 
            analyze insights, and deliver world-class health coaching — all from one secure platform.
          </p>

          <div className="trustRow">
            <div className="trustPill">Coach-first tools</div>
            <div className="trustPill">Secure client data</div>
            <div className="trustPill">Built for precision</div>
          </div>
        </section>

        <section className="right">
          <div className="card">
            <div className="cardTop">
              <div className="cardTitle">Coach Sign In</div>
              <div className="cardDesc">Access the OI System for Health Coaches</div>
            </div>

            <button
              className="googleBtn"
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              <img
  src="/google.png"
  alt=""
  className="googleIcon"
/>
Continue with Google
            </button>

            <div className="divider">
              <span />
              <p>Secure sign-in</p>
              <span />
            </div>

            <p className="fineprint">
              Use this secure portal to generate personalized health reports,
manage client insights, and deliver high-impact coaching experiences.
            </p>
          </div>

          <div className="footerNote">
            <span className="dot" />
            <span>Protected by Google OAuth • Session secured by NextAuth</span>
          </div>
        </section>
        </div>
      </main>

      {/* Styles */}
      <style jsx>{`
        .oi {
          --gold1: #c9a25b;
          --gold2: #b58e4a;
          --ink: #070707;
          --glass: rgba(255, 255, 255, 0.08);
          --stroke: rgba(255, 255, 255, 0.12);
          --muted: rgba(255, 255, 255, 0.68);
          --muted2: rgba(255, 255, 255, 0.52);

          min-height: 100vh;
          position: relative;
          color: white;
          overflow: hidden;
          background: radial-gradient(1200px 700px at 30% 0%, rgba(201,162,91,0.18), transparent 55%),
                      radial-gradient(900px 600px at 80% 30%, rgba(120,120,255,0.10), transparent 60%),
                      #000;
        }
        
        .headline {
  font-weight: 800;
  letter-spacing: -0.02em;
}

.subhead {
  font-weight: 400;
}

.cardTitle {
  font-weight: 700;
}

.googleBtn {

text-shadow: 0 1px 2px rgba(0,0,0,0.25);
color: white; 
  font-weight: 600;
}

        .bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.75)),
            url("/hero.jpeg");
          background-size: cover;
          background-position: center;
          filter: saturate(0.95) contrast(1.05);
          transform: scale(1.02);
        }
        
     .centerGrid {
  width: 100%;
  max-width: 1160px;        /* the whole “unit” width */
  display: grid;
  transform: translateY(-44px);

  /* left column takes remaining space; right is fixed */
  grid-template-columns: minmax(520px, 1fr) 440px;

  gap: 56px;
  align-items: center;
}

        /* If you don't add an image yet, this makes it still look premium */
        :global(body) {
          margin: 0;
        }

        {
  font-family: var(--font-prompt), system-ui, -apple-system, sans-serif;
}

        .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 40%, transparent 0%, rgba(0,0,0,0.72) 70%, rgba(0,0,0,0.92) 100%);
          pointer-events: none;
        }

        .glow {
          position: absolute;
          border-radius: 999px;
          filter: blur(60px);
          opacity: 0.35;
          pointer-events: none;
        }

        .glow1 {
          width: 560px;
          height: 560px;
          left: -140px;
          top: -200px;
          background: radial-gradient(circle at 30% 30%, rgba(201,162,91,0.95), rgba(201,162,91,0.2), transparent 65%);
        }

        .glow2 {
          width: 520px;
          height: 520px;
          right: -180px;
          bottom: -220px;
          background: radial-gradient(circle at 40% 40%, rgba(120,120,255,0.55), rgba(120,120,255,0.12), transparent 65%);
        }

        .noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.14'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
          opacity: 0.35;
          pointer-events: none;
        }

        .top {
  position: absolute;        /* 👈 key change */
  top: 0;
  left: 0;
  z-index: 3;

  padding: 28px 32px;        /* 👈 nice premium padding */
  display: flex;
  align-items: center;
}

        .brand {
          display: inline-flex;
          align-items: baseline;
          gap: 10px;
          letter-spacing: 0.34em;
          font-weight: 800;
          user-select: none;
        }

        .brandMark {
          color: var(--gold1);
          font-size: 22px;
        }

        .brandText {
          font-size: 22px;
        }

.wrap {
  position: relative;
  z-index: 2;

  min-height: calc(100vh - 90px);
  display: flex;
  align-items: center;      /* vertical center */
  justify-content: center;  /* horizontal center */

  padding: 48px 22px 80px;
}

     .left {
  padding: 10px 6px;
}
        .kicker {
          font-size: 12px;
          letter-spacing: 0.28em;
          color: rgba(255,255,255,0.55);
          margin-bottom: 14px;
        }

        .headline {
  margin: 0;
  font-size: 58px;
  line-height: 1.04;
  font-weight: 800;
  letter-spacing: -0.02em;
  max-width: 640px;          /* 👈 wider to allow 2 clean lines */
  text-shadow: 0 18px 60px rgba(0,0,0,0.55);
}

.subhead {
  margin-top: 18px;
  max-width: 520px;
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255,255,255,0.68);
}
        .trustRow {
          margin-top: 22px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .trustPill {
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          border-radius: 999px;
          padding: 9px 12px;
          font-size: 12px;
          color: rgba(255,255,255,0.72);
          backdrop-filter: blur(10px);
        }
.right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  justify-self: start;     /* anchors card toward center */
}

        .card {
  width: 100%;
  max-width: 440px;         /* matches grid right column */
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.06));
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 28px 120px rgba(0,0,0,0.65);
  backdrop-filter: blur(18px);
  padding: 22px;
}

        .cardTop {
          padding: 10px 10px 6px;
          text-align: center;
        }

        .cardTitle {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .cardDesc {
          font-size: 13px;
          color: var(--muted2);
          margin-bottom: 12px;
        }

        .googleBtn {
  width: 100%;
  height: 48px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.14);

  background: linear-gradient(180deg, var(--gold1), var(--gold2));

  color: #ffffff !important;   /* 🔥 force white text */
  font-weight: 600;
  font-size: 14px;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  cursor: pointer;
  box-shadow: 0 10px 30px rgba(201,162,91,0.22);
  transition: transform 160ms ease, filter 160ms ease;

  text-shadow: 0 1px 2px rgba(0,0,0,0.35);
}

        .googleBtn:hover {
          transform: translateY(-1px);
          filter: brightness(1.03);
        }

        .googleBtn:active {
          transform: translateY(0px);
        }

        .googleIcon {
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 4px;
  padding: 2px;
}

        .divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 14px 6px 8px;
        }

        .divider span {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.10);
        }

        .divider p {
          margin: 0;
          font-size: 12px;
          color: rgba(255,255,255,0.55);
        }

        .fineprint {
          margin: 10px 6px 6px;
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255,255,255,0.55);
          text-align: center;
        }

        .footerNote {
          font-size: 12px;
          color: rgba(255,255,255,0.55);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(201,162,91,0.9);
          box-shadow: 0 0 0 4px rgba(201,162,91,0.14);
        }

        @media (max-width: 920px) {
          .wrap {
            grid-template-columns: 1fr;
            padding-top: 10px;
          }
          .headline {
            font-size: 44px;
          }
          .right {
            align-items: stretch;
          }
        }
        
        .brandImage {
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  height: 34px;          /* tweak this */
  width: auto;
  filter: drop-shadow(0 6px 18px rgba(0,0,0,0.55));
  opacity: 0.95;
}

@media (max-width: 980px) {
  .centerGrid {
    grid-template-columns: 1fr;
    max-width: 560px;
    gap: 24px;
  }

  .headline {
    font-size: 44px;
    max-width: none;
  }

  .card {
    max-width: none;
  }
}
      `}</style>
    </div>
  )
}