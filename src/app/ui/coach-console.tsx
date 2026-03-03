"use client";

import React, { useEffect, useMemo, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getReport, upsertReport } from "../../lib/reportStore";

type User = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type Props = { user: User };

const HEALTH_COACHES = [
  "Amanda Stathos",
  "Anthony Hales",
  "Blair Solberger",
  "Brittany Deane",
  "Chris Reyes",
  "Christie Roethlingshoefer",
  "Dayna McCutchin",
  "Emily Mitchell",
  "Emily Rusch",
  "Eve Persak",
  "Kendall Kersey",
  "Seyma Turan",
  "Shauna Hull",
  "Stefanie Billette",
];

const MEDICAL_ADVISORS = ["Dr. Mythri Sharma", "Dr. Sophie Lorn", "Eve Persak"];

type DraftPayload = {
  clientName: string;
  healthCoach: string;
  medicalAdvisor: string;
  template: string;
  instructions: string;
  jsonInput: string;
  updatedAt: string;
};

export default function CoachConsole({ user }: Props) {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const [clientName, setClientName] = useState("");
  const [healthCoach, setHealthCoach] = useState<string>("");
  const [medicalAdvisor, setMedicalAdvisor] = useState<string>("");
  const [template, setTemplate] = useState("personalized_report");
  const [instructions, setInstructions] = useState("");
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState<string | null>(null);

  // manual-save draft identity for this console session
  const [draftId] = useState(() => crypto.randomUUID());
  const [createdAt] = useState(() => new Date().toISOString());

  useEffect(() => setMounted(true), []);

  // If user came from /drafts, load the selected draft into the console
  useEffect(() => {
    if (!mounted) return;

    const id = localStorage.getItem("oi:selectedDraftId:v1");
    if (!id) return;

    localStorage.removeItem("oi:selectedDraftId:v1");
    const d = getReport(id);
    if (!d) return;

    setClientName(d.clientName ?? "");
    setHealthCoach(d.healthCoach ?? "");
    setMedicalAdvisor(d.medicalAdvisor ?? "");
    setTemplate(d.template ?? "personalized_report");
    setInstructions(d.instructions ?? "");
    setJsonInput(d.jsonInput ?? "");
    setJsonError(null);
  }, [mounted]);

  const initials = useMemo(() => {
    const base = (user?.name || user?.email || "U").trim();
    const parts = base.split(/\s+/).filter(Boolean);
    const i1 = parts[0]?.[0] ?? "U";
    const i2 = parts[1]?.[0] ?? "";
    return (i1 + i2).toUpperCase();
  }, [user?.name, user?.email]);

  const payloadPreview = useMemo(() => {
    return {
      client: { name: clientName || "(Client Name)" },
      team: {
        healthCoach: healthCoach || "(Health Coach)",
        medicalAdvisor: medicalAdvisor || "(Medical Advisor)",
        requestedBy: user?.email || "(signed-in user)",
      },
      notebookLM: { template, instructions: instructions || "" },
      metadata: { system: "NEW OI System" },
    };
  }, [clientName, healthCoach, medicalAdvisor, template, instructions, user?.email]);

  const previewPayload = useMemo(() => {
    if (!jsonInput.trim()) return payloadPreview;

    try {
      const base = JSON.parse(jsonInput);
      if (typeof base !== "object" || base === null) return payloadPreview;

      return {
        ...base,
        client: { ...(base as any)?.client, name: clientName || "(Client Name)" },
        team: {
          ...((base as any)?.team ?? {}),
          healthCoach: healthCoach || "(Health Coach)",
          medicalAdvisor: medicalAdvisor || "(Medical Advisor)",
          requestedBy: user?.email || "(signed-in user)",
        },
        notebookLM: {
          ...((base as any)?.notebookLM ?? {}),
          template,
          instructions: instructions || "",
        },
        metadata: { ...((base as any)?.metadata ?? {}), system: "NEW OI System" },
      };
    } catch {
      return payloadPreview;
    }
  }, [jsonInput, payloadPreview, clientName, healthCoach, medicalAdvisor, user?.email, template, instructions]);

  const previewText = useMemo(() => JSON.stringify(previewPayload, null, 2), [previewPayload]);

  function validateJsonOrSetError(): any | null {
    if (!jsonInput.trim()) {
      setJsonError("Paste the JSON from NotebookLM first.");
      return null;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      if (typeof parsed !== "object" || parsed === null) {
        setJsonError("JSON must be an object.");
        return null;
      }
      setJsonError(null);
      return parsed;
    } catch {
      setJsonError("Invalid JSON. Make sure you copied the full JSON from NotebookLM.");
      return null;
    }
  }

  function handleSaveDraft() {
    try {
      // optional: allow saving even without NotebookLM JSON
      const payload: DraftPayload = {
        clientName,
        healthCoach,
        medicalAdvisor,
        template,
        instructions,
        jsonInput,
        updatedAt: new Date().toISOString(),
      };

      upsertReport({
        id: draftId,
        type: "draft",
        title: clientName ? `${clientName} – ${template.replaceAll("_", " ")}` : "Untitled draft",
        clientName,
        healthCoach,
        medicalAdvisor,
        template,
        instructions,
        jsonInput,
        payload: previewPayload,
        reportUrl: undefined,
        createdAt,
        updatedAt: payload.updatedAt,
      });

      alert("Saved ✅");
    } catch (e) {
      console.error(e);
      alert("Save failed (see console).");
    }
  }

  async function handleGenerate() {
    try {
      const base = validateJsonOrSetError();
      if (!base) return;

      const payload = {
        ...base,
        client: { ...(base?.client ?? {}), name: clientName || "(Client Name)" },
        team: {
          ...(base?.team ?? {}),
          healthCoach: healthCoach || "(Health Coach)",
          medicalAdvisor: medicalAdvisor || "(Medical Advisor)",
          requestedBy: user?.email || "(signed-in user)",
        },
        notebookLM: { ...(base?.notebookLM ?? {}), template, instructions: instructions || "" },
        metadata: { ...(base?.metadata ?? {}), system: "NEW OI System", createdAt: new Date().toISOString() },
      };

      const genRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const genData = await genRes.json();
      if (!genRes.ok || !genData?.ok) {
        alert(genData?.error || "Generate failed");
        return;
      }

      window.open(genData.reportUrl, "_blank");
    } catch (e) {
      console.error(e);
      alert("Generate failed (see console).");
    }
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
          <div className="title">Coach Console</div>
          <div className="subtitle">Generate personalized client reports with NotebookLM + your HTML Builder.</div>
        </div>

        <div className="rightTop">
          <div
            className="userChip"
            role="button"
            tabIndex={0}
            onClick={() => router.push("/drafts")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") router.push("/drafts");
            }}
            title="Open Drafts"
          >
            {user?.image ? (
              <img className="avatar" src={user.image} alt={user?.name || "User"} />
            ) : (
              <div className="avatarFallback">{initials}</div>
            )}

            <div className="userMeta">
              <div className="userName">Welcome, {user?.name || "Coach"}</div>
              <div className="userEmail">{user?.email || ""}</div>
              <div className="chipHint">Click to open Drafts</div>
            </div>

            <button
              className="signOutBtn"
              onClick={(e) => {
                e.stopPropagation();
                signOut({ callbackUrl: "/" });
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="grid">
        {/* LEFT */}
        <section className="panel leftPanel">
          <div className="panelTitle">Workflow</div>
          <div className="muted">Follow the steps in order. No uploads needed — just copy/paste.</div>

          <div className="step">
            <div className="stepLeft">
              <div className="stepNum">STEP 1</div>
              <div className="stepTitle">Fill out client & team info</div>
              <div className="stepHint">These fields will be merged into the NotebookLM JSON.</div>
            </div>
          </div>

          <div className="fields2">
            <div className="field">
              <label>Client Name</label>
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="e.g., Jordan Smith" />
            </div>

            <div className="field">
              <label>Health Coach</label>
              <select value={healthCoach} onChange={(e) => setHealthCoach(e.target.value)}>
                <option value="">Select coach…</option>
                {HEALTH_COACHES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Medical Advisor</label>
              <select value={medicalAdvisor} onChange={(e) => setMedicalAdvisor(e.target.value)}>
                <option value="">Select advisor…</option>
                {MEDICAL_ADVISORS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Report Template</label>
              <select value={template} onChange={(e) => setTemplate(e.target.value)}>
                <option value="personalized_report">Personalized Client Report</option>
                <option value="followup_report">Follow-up Report</option>
                <option value="lab_summary">Lab Summary</option>
              </select>
            </div>
          </div>

          <div className="step">
            <div className="stepLeft">
              <div className="stepNum">STEP 2</div>
              <div className="stepTitle">Write instructions for NotebookLM</div>
              <div className="stepHint">Optional, but helps keep outputs consistent.</div>
            </div>
          </div>

          <textarea
            className="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Tone, constraints, sections to include, safety notes, what to emphasize…"
          />

          <div className="tip">Tip: include required sections (Summary, Key Findings, Action Plan, Red Flags, Next Steps).</div>

          <div className="step">
            <div className="stepLeft">
              <div className="stepNum">STEP 3</div>
              <div className="stepTitle">Copy instructions into NotebookLM</div>
              <div className="stepHint">Paste them into NotebookLM manually, then generate JSON there.</div>
            </div>
          </div>

          <div className="rowActions">
            <button className="secondary grow" type="button" onClick={() => navigator.clipboard.writeText(instructions)}>
              Copy instructions
            </button>
            <button className="secondary grow" type="button" onClick={() => setInstructions("")}>
              Clear instructions
            </button>
          </div>

          <div className="step">
            <div className="stepLeft">
              <div className="stepNum">STEP 4</div>
              <div className="stepTitle">Paste JSON output from NotebookLM</div>
              <div className="stepHint">This becomes the base payload for the report.</div>
            </div>
          </div>

          <textarea
            className="jsonPaste"
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setJsonError(null);
            }}
            placeholder="Paste the JSON output from NotebookLM here..."
          />

          {jsonError && <div className="errorText">{jsonError}</div>}

          <button
            type="button"
            className="secondary full"
            onClick={() => {
              const parsed = validateJsonOrSetError();
              if (!parsed) return;
              alert("JSON looks valid ✅");
              console.log("NotebookLM JSON parsed:", parsed);
            }}
          >
            Validate JSON
          </button>

          <div className="rowActions">
            <button type="button" className="secondary grow" onClick={() => navigator.clipboard.writeText(previewText)}>
              Copy JSON
            </button>

            <button
              type="button"
              className="secondary grow"
              onClick={() => {
                setJsonInput("");
                setJsonError(null);
              }}
            >
              Clear JSON
            </button>
          </div>
        </section>

        {/* RIGHT */}
        <section className="panel rightPanel">
          <div className="panelTitle">STEP 5</div>
          <div className="stepTitle">Review payload and generate report</div>
          <div className="muted">Confirm the merged payload looks correct.</div>

          <div className="muted" style={{ marginTop: 10 }}>
            This is the JSON we’ll send to your HTML Builder.
          </div>

          {mounted ? <pre className="code">{previewText}</pre> : <div className="codeSkeleton">Loading…</div>}

          <div className="rowActions">
            <button className="secondary grow" type="button" onClick={handleSaveDraft}>
              Save draft
            </button>
            <button className="primary grow" onClick={handleGenerate}>
              Generate report
            </button>
          </div>
        </section>
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

        /* Background layers */
        .bg {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.85)),
            url("/login-bg.jpg");
          background-size: cover;
          background-position: center;
          filter: saturate(0.95) contrast(1.05);
          transform: scale(1.02);
          z-index: 0;
        }
        .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 50% 35%,
            transparent 0%,
            rgba(0, 0, 0, 0.72) 70%,
            rgba(0, 0, 0, 0.92) 100%
          );
          z-index: 1;
          pointer-events: none;
        }
        .noise {
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.14'/%3E%3C/svg%3E");
          mix-blend-mode: overlay;
          opacity: 0.35;
          pointer-events: none;
          z-index: 1;
        }

        /* Topbar */
        .topbar {
          position: relative;
          z-index: 2;
          max-width: 1240px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .leftBrand {
          max-width: 760px;
        }
        .logo {
          height: 34px;
          width: auto;
          opacity: 0.95;
          filter: drop-shadow(0 6px 18px rgba(0, 0, 0, 0.55));
          margin-bottom: 8px;
        }
        .crumb {
          font-size: 12px;
          letter-spacing: 0.28em;
          color: rgba(255, 255, 255, 0.55);
          margin-bottom: 10px;
        }
        .title {
          font-size: 62px;
          font-weight: 850;
          letter-spacing: -0.02em;
          line-height: 1.02;
          text-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);
        }
        .subtitle {
          margin-top: 10px;
          font-size: 16px;
          font-weight: 500;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.72);
          max-width: 620px;
        }

        .rightTop {
          display: flex;
          justify-content: flex-end;
          min-width: 360px;
        }

        .userChip {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.07);
          border: 1px solid rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(14px);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);
          max-width: 560px;
          cursor: pointer;
          user-select: none;
        }
        .userChip:focus {
          outline: 2px solid rgba(201, 162, 91, 0.35);
          outline-offset: 3px;
        }
        .chipHint {
          margin-top: 2px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.55);
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          object-fit: cover;
          border: 1px solid rgba(255, 255, 255, 0.14);
        }
        .avatarFallback {
          width: 40px;
          height: 40px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.14);
          font-weight: 800;
        }
        .userMeta {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          flex: 1;
        }
        .userName {
          font-weight: 800;
          font-size: 14px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .userEmail {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.65);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .signOutBtn {
          margin-left: 8px;
          padding: 9px 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.16);
          background: rgba(0, 0, 0, 0.25);
          color: rgba(255, 255, 255, 0.92);
          font-weight: 700;
          cursor: pointer;
          transition: transform 140ms ease, background 140ms ease, border-color 140ms ease;
          flex: 0 0 auto;
        }
        .signOutBtn:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.22);
        }

        /* Main grid */
        .grid {
          position: relative;
          z-index: 2;
          max-width: 1240px;
          width: 100%;
          margin: 0 auto;

          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;

          align-items: stretch; /* equal heights */
        }

        .panel {
          border-radius: 28px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 28px 120px rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(18px);
          padding: 18px;

          height: 100%;
          min-width: 0;
        }

        .leftPanel {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .rightPanel {
          display: flex;
          flex-direction: column;
          min-width: 0;
          overflow: hidden;
        }

        .panelTitle {
          font-size: 18px;
          font-weight: 850;
          margin-bottom: 8px;
        }

        .muted {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.62);
          margin-bottom: 12px;
        }

        .step {
          margin-top: 16px;
          margin-bottom: 10px;
          padding: 10px 12px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }
        .stepLeft {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
        }
        .stepNum {
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.14em;
          color: rgba(255, 255, 255, 0.65);
        }
        .stepTitle {
          font-size: 14px;
          font-weight: 850;
          color: rgba(255, 255, 255, 0.92);
        }
        .stepHint {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.62);
          line-height: 1.4;
        }

        .fields2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 12px;
          margin-bottom: 14px;
        }

        .field {
          min-width: 0;
        }
        .field label {
          display: block;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.75);
          margin-bottom: 6px;
          font-weight: 700;
        }
        .field input,
        .field select {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.28);
          color: rgba(255, 255, 255, 0.92);
          outline: none;
          box-sizing: border-box;
        }

        .instructions {
          width: 100%;
          min-height: 200px;
          resize: vertical;
          overflow: auto;
          padding: 14px;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.28);
          color: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.12);
          outline: none;
          font-family: inherit;
          font-size: 13px;
          line-height: 1.55;
          box-sizing: border-box;
        }

        .tip {
          margin-top: 8px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.55);
        }

        .jsonPaste {
          width: 100%;
          min-height: 220px;
          max-height: 260px;
          overflow: auto;
          padding: 14px;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.28);
          color: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(255, 255, 255, 0.12);
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New",
            monospace;
          font-size: 12px;
          line-height: 1.55;
          box-sizing: border-box;
        }

        .errorText {
          margin-top: 8px;
          font-size: 12px;
          color: rgba(255, 120, 120, 0.95);
        }

        .rowActions {
          display: flex;
          gap: 12px;
          margin-top: 12px;
        }

        .secondary {
          height: 52px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;

          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.88);
          font-weight: 750;
          cursor: pointer;
          transition: transform 140ms ease, background 140ms ease;
        }
        .secondary:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.09);
        }
        .secondary.full {
          width: 100%;
          min-height: 52px;
          height: 52px;
          margin-top: 10px;
        }
        .grow {
          flex: 1;
        }

        .primary {
          border: 0;
          cursor: pointer;
          font-weight: 850;
          border-radius: 16px;
          background: linear-gradient(180deg, #c9a25b, #b58e4a);
          color: white;
          box-shadow: 0 14px 44px rgba(201, 162, 91, 0.22);
          transition: transform 140ms ease, filter 140ms ease;
        }
        .primary:hover {
          transform: translateY(-1px);
          filter: brightness(1.03);
        }
        .primary.grow {
          height: 52px;
        }

        .code {
          margin-top: 10px;
          padding: 14px;
          border-radius: 18px;
          background: rgba(0, 0, 0, 0.32);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);

          white-space: pre;
          word-break: normal;
          overflow-wrap: normal;
          font-size: 12px;
          line-height: 1.55;

          flex: 1 1 auto;
          min-height: 320px;
          overflow: auto;
        }

        .codeSkeleton {
          margin-top: 10px;
          padding: 14px;
          border-radius: 18px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.22);
          color: rgba(255, 255, 255, 0.55);
          display: grid;
          place-items: center;
          min-height: 320px;
          flex: 1 1 auto;
        }

        @media (max-width: 980px) {
          .topbar {
            flex-direction: column;
            align-items: flex-start;
          }
          .rightTop {
            width: 100%;
            justify-content: flex-start;
            min-width: 0;
          }
          .grid {
            grid-template-columns: 1fr;
          }
          .fields2 {
            grid-template-columns: 1fr;
          }
          .title {
            font-size: 44px;
          }
        }
      `}</style>
    </div>
  );
}