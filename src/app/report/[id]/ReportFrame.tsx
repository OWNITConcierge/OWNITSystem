"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  html: string;
  reportId: string;
};

export default function ReportFrame({ html, reportId }: Props) {
  const shellRef = useRef<HTMLDivElement | null>(null);

  const [scale, setScale] = useState(0.92);
  const [fitMode, setFitMode] = useState<"fit" | "manual">("fit");
  const [contentHeight, setContentHeight] = useState<number>(1200);

  // Keep height updated from iframe -> parent postMessage
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      const data = e.data;
      if (!data || typeof data !== "object") return;
      if (data.type !== "OI_REPORT_HEIGHT") return;
      if (data.id !== reportId) return;

      const h = Number(data.height);
      if (!Number.isFinite(h) || h <= 0) return;

      setContentHeight(h);
    }

    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [reportId]);

  // Fit-to-width calculation
  useEffect(() => {
    if (fitMode !== "fit") return;

    const el = shellRef.current;
    if (!el) return;

    const calc = () => {
      // The report uses A4 width in points: 595.5pt (from your builder)
      // We set the iframe "paper" width to 595.5pt so scale math is stable.
      const PAPER_W_PT = 595.5;

      // Available width inside the stage
      const rect = el.getBoundingClientRect();
      const pad = 44; // stage padding
      const avail = Math.max(320, rect.width - pad);

      // Scale so paper fits the stage width nicely
      const next = Math.max(0.55, Math.min(1.15, avail / PAPER_W_PT));
      setScale(Math.round(next * 100) / 100);
    };

    calc();

    const ro = new ResizeObserver(() => calc());
    ro.observe(el);

    return () => ro.disconnect();
  }, [fitMode]);

  const scaledHeight = useMemo(() => {
    // if the iframe reports ~scrollHeight, scale it so outer scroll is accurate
    return Math.ceil(contentHeight * scale);
  }, [contentHeight, scale]);

  return (
    <div className="stage" ref={shellRef}>
      <div className="toolbar">
        <div className="left">
          <span className="label">Preview</span>
          <span className="pill">Scale: {(scale * 100).toFixed(0)}%</span>
        </div>

        <div className="right">
          <button
            className="chip"
            onClick={() => {
              setFitMode("manual");
              setScale((s) => Math.max(0.55, Math.round((s - 0.1) * 100) / 100));
            }}
          >
            −
          </button>

          <button
            className="chip"
            onClick={() => {
              setFitMode("fit");
            }}
          >
            Fit width
          </button>

          <button
            className="chip"
            onClick={() => {
              setFitMode("manual");
              setScale((s) => Math.min(1.25, Math.round((s + 0.1) * 100) / 100));
            }}
          >
            +
          </button>

          <button
            className="chip"
            onClick={() => {
              const el = document.getElementById("reportFrame") as HTMLIFrameElement | null;
              el?.contentWindow?.focus();
              el?.contentWindow?.print();
            }}
          >
            Print
          </button>
        </div>
      </div>

      <div className="scrollArea">
        <div
          className="paperWrap"
          style={{
            height: scaledHeight,
          }}
        >
          <iframe
            id="reportFrame"
            title="Report"
            className="paper"
            srcDoc={html}
            style={{
              width: "595.5pt",
              height: contentHeight,
              transform: `scale(${scale})`,
            }}
          />
        </div>
      </div>

      <style jsx>{`
        .stage {
          height: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 6px 4px 0;
        }

        .left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .label {
          font-size: 13px;
          font-weight: 850;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.72);
        }

        .pill {
          font-size: 12px;
          font-weight: 750;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.86);
          backdrop-filter: blur(12px);
          white-space: nowrap;
        }

        .right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chip {
          appearance: none;
          cursor: pointer;
          text-decoration: none;
          padding: 9px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.9);
          font-weight: 750;
          font-size: 12px;
          transition: transform 140ms ease, background 140ms ease;
          backdrop-filter: blur(12px);
        }
        .chip:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.09);
        }

        .scrollArea {
          flex: 1;
          min-height: 0;
          border-radius: 22px;
          overflow: auto;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.22);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
          padding: 22px;
        }

        /* Pretty scrollbar like dashboard */
        .scrollArea::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        .scrollArea::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.06);
          border-radius: 999px;
        }
        .scrollArea::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          border: 2px solid rgba(0, 0, 0, 0.25);
        }
        .scrollArea::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.28);
        }
        .scrollArea {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.22) rgba(255, 255, 255, 0.06);
        }

        .paperWrap {
          display: grid;
          place-items: start center;
          width: 100%;
        }

        .paper {
          border: 0;
          border-radius: 18px;
          background: #fff;

          /* This makes it feel like a “paper card” */
          box-shadow:
            0 22px 70px rgba(0, 0, 0, 0.55),
            0 0 0 1px rgba(255, 255, 255, 0.08);

          transform-origin: top center;
        }
      `}</style>
    </div>
  );
}