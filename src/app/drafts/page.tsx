"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { StoredReport } from "../../lib/reportStore";
import { listReports, deleteReport, duplicateReport } from "../../lib/reportStore";

export default function DraftsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [drafts, setDrafts] = useState<StoredReport[]>([]);

  useEffect(() => setMounted(true), []);

  function refresh() {
    setDrafts(listReports("draft"));
  }

  useEffect(() => {
    if (!mounted) return;

    refresh();

    function onStorage(e: StorageEvent) {
      if (e.key === "oi:reports:v1") refresh();
    }

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [mounted]);

  const countLabel = useMemo(() => {
    const n = drafts.length;
    return n === 1 ? "1 draft" : `${n} drafts`;
  }, [drafts.length]);

  function handleOpenDraft(id: string) {
    localStorage.setItem("oi:selectedDraftId:v1", id);
    router.push("/coach-console");
  }

  return (
    <div className="page">
      <div className="bg" />
      <div className="vignette" />
      <div className="noise" />

      <div className="topbar">
        <div className="leftBrand">
          <img src="/logo.png" alt="OWN IT" className="logo" />
          <div className="crumb">NEW OI SYSTEM</div>
          <div className="title">Drafts</div>
          <div className="subtitle">
            Open, duplicate, or delete saved drafts.
          </div>
        </div>

        <div className="rightTop">
          <button
            className="secondary"
            onClick={() => router.push("/coach-console")}
          >
            Back to Coach Console
          </button>
        </div>
      </div>

      <div className="content">
        <div className="panel">
          <div className="panelHeader">
            <div>
              <div className="panelTitle">Drafts Library</div>
              <div className="muted">{countLabel}</div>
            </div>
          </div>

          {drafts.length === 0 ? (
            <div className="emptyState">
              No drafts saved yet.
            </div>
          ) : (
            <div className="draftList">
              {drafts.map((d) => (
                <div key={d.id} className="draftCard">
                  <div className="draftInfo">
                    <div className="draftTitle">
                      {d.title || "Untitled draft"}
                    </div>
                    <div className="draftMeta">
                      {d.clientName || "No client"} •{" "}
                      {new Date(d.updatedAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="draftActions">
                    <button
                      className="secondary"
                      onClick={() => handleOpenDraft(d.id)}
                    >
                      Open
                    </button>
                    <button
                      className="secondary"
                      onClick={() => {
                        duplicateReport(d.id);
                        refresh();
                      }}
                    >
                      Duplicate
                    </button>
                    <button
                      className="danger"
                      onClick={() => {
                        deleteReport(d.id);
                        refresh();
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          padding: 22px 22px 60px;
          color: white;
          font-family: var(--font-prompt, system-ui, -apple-system, sans-serif);

          display: grid;
          grid-template-rows: auto 1fr;
          gap: 18px;
        }

        .bg {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(
              to bottom,
              rgba(0, 0, 0, 0.35),
              rgba(0, 0, 0, 0.85)
            ),
            url("/login-bg.jpg");
          background-size: cover;
          background-position: center;
          z-index: 0;
        }

        .vignette,
        .noise {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
        }

        .topbar {
          position: relative;
          z-index: 2;
          max-width: 1240px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
        }

        .logo {
          height: 34px;
          margin-bottom: 8px;
        }

        .crumb {
          font-size: 12px;
          letter-spacing: 0.28em;
          color: rgba(255, 255, 255, 0.55);
        }

        .title {
          font-size: 48px;
          font-weight: 850;
        }

        .subtitle {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.72);
        }

        .content {
          position: relative;
          z-index: 2;
          max-width: 1240px;
          width: 100%;
          margin: 0 auto;
        }

        .panel {
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.12);
          padding: 24px;
        }

        .panelTitle {
          font-size: 18px;
          font-weight: 850;
        }

        .muted {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
        }

        .draftList {
          margin-top: 18px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .draftCard {
          padding: 16px;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .draftTitle {
          font-weight: 800;
        }

        .draftMeta {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .draftActions {
          display: flex;
          gap: 10px;
        }

        .secondary {
          padding: 8px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.08);
          color: white;
          cursor: pointer;
        }

        .danger {
          padding: 8px 14px;
          border-radius: 12px;
          border: 1px solid rgba(255, 120, 120, 0.4);
          background: rgba(120, 0, 0, 0.4);
          color: white;
          cursor: pointer;
        }

        .emptyState {
          margin-top: 20px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
        }
      `}</style>
    </div>
  );
}