"use client";

type Props = {
  id: string;
  reportHtml: string;
};

export default function ReportViewerClient({ id, reportHtml }: Props) {
  function downloadPdf() {
    const iframe = document.getElementById("reportFrame") as HTMLIFrameElement | null;
    if (!iframe?.contentWindow) return;

    iframe.contentWindow.focus();
    iframe.contentWindow.print(); // user chooses “Save as PDF”
  }

  return (
    <div className="page">
      <div className="bg" />
      <div className="vignette" />
      <div className="noise" />

<header className="topbar">
  <div className="topLeft">
    <img src="/logo.png" alt="OWN IT" className="logo" />
  </div>

  <div className="topCenter">
    <div className="crumb">NEW OI SYSTEM</div>
    <div className="title">Report Viewer</div>
  </div>

  <div className="topRight">
    <button className="chip" onClick={downloadPdf}>Download PDF</button>
    <a className="chip ghost" href="/dashboard">Back to dashboard</a>
  </div>
</header>

      <main className="shell">
<section className="panel">
  <div className="frameWrap">
    <iframe
      id="reportFrame"
      title="Report"
      className="frame"
      srcDoc={reportHtml}
    />
  </div>
</section>
      </main>

      <style jsx>{`
        .page {
  height: 100vh;
  overflow: hidden;
  position: relative;
  padding: 22px;
  display: grid;
  grid-template-rows: auto 1fr; /* header + viewer */
  gap: 18px;
  color: rgba(255,255,255,0.92);
  font-family: var(--font-prompt, system-ui, -apple-system, sans-serif);
}

        .bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,.9)),
            url("/login-bg.jpg");
          background-size: cover;
          z-index: 0;
        }

        .vignette,
        .noise {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
        }

        .brand {
          display: flex;
          gap: 14px;
          align-items: center;
        }

        .logo {
  height: 34px;
  width: auto;
  opacity: 0.95;
  filter: drop-shadow(0 6px 18px rgba(0,0,0,0.55));
}

        .title {
          font-size: 24px;
          font-weight: 800;
        }

        .sub {
          font-size: 12px;
          opacity: 0.7;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

     .chip {
  appearance: none;
  cursor: pointer;
  text-decoration: none;
  user-select: none;

  padding: 10px 14px;
  border-radius: 999px;

  border: 1px solid rgba(255,255,255,0.18);
  background: rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.92);

  font-weight: 800;
  font-size: 13px;

  transition: transform 140ms ease, background 140ms ease, border-color 140ms ease;
}
.chip:hover {
  transform: translateY(-1px);
  background: rgba(255,255,255,0.10);
  border-color: rgba(255,255,255,0.22);
}
.chip:visited { color: rgba(255,255,255,0.92); } /* ✅ kills purple */
.chip.ghost {
  background: rgba(0,0,0,0.22);
}

/* viewer area */
.shell {
  position: relative;
  z-index: 2;
  max-width: 1240px;
  margin: 0 auto;
  width: 100%;
  min-height: 0;      /* ✅ critical for flex/overflow math */
}

.panel {
  height: 100%;
  min-height: 0;
  border-radius: 28px;

  background: rgba(0,0,0,0.22);
  border: 1px solid rgba(255,255,255,0.10);
  box-shadow: 0 28px 120px rgba(0,0,0,0.55);
  backdrop-filter: blur(16px);

  padding: 18px;
  display: flex;
  flex-direction: column;
}

.crumb {
  font-size: 12px;
  letter-spacing: 0.28em;
  color: rgba(255,255,255,0.62);
}

.frameWrap {
  flex: 1;
  min-height: 0;

  display: flex;
  justify-content: center;
  align-items: flex-start;

  overflow: auto;               /* ✅ scroll here */
  padding: 18px;
  border-radius: 22px;

  background: rgba(0,0,0,0.18);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.04);
}

.frame {
  width: min(1100px, 100%);     /* ✅ make it feel like paper */
  height: 100%;                 /* ✅ prevents “tiny strip” issue */
  border: 0;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 40px 120px rgba(0,0,0,0.45), 0 0 0 1px rgba(0,0,0,0.08);
}

.topbar {
  position: relative;
  z-index: 2;
  max-width: 1240px;
  margin: 0 auto;
  width: 100%;

  display: grid;
  grid-template-columns: 1fr auto 1fr; /* left / center / right */
  align-items: center;
  gap: 16px;
}

.topCenter {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 3px;
}


.topLeft {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}


.topCenter {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 3px;
}


.title {
  font-size: 26px;
  font-weight: 850;
  letter-spacing: -0.01em;
  line-height: 1.1;
  text-shadow: 0 18px 60px rgba(0,0,0,0.55);
}

.topRight {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}

      `}</style>
    </div>
  );
}