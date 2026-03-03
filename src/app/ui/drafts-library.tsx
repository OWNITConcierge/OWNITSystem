"use client";

import React, { useMemo, useState } from "react";
import type { StoredReport } from "../../lib/reportStore";

type Props = {
  items: StoredReport[];
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
};

export default function DraftsLibrary({ items, onLoad, onDelete, onDuplicate }: Props) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;

    return items.filter((r) => {
      const hay = [r.title, r.clientName, r.healthCoach, r.medicalAdvisor, r.template]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });
  }, [items, q]);

  return (
    <div className="wrap">
      <div className="head">
 <div className="title">Drafts Library</div>
<div className="sub">Search, open, duplicate, or delete saved drafts.</div>

        <input
          className="fieldInput"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search drafts… (client, template, coach)"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty muted">No drafts found.</div>
      ) : (
        <div className="draftGrid">
          {filtered.map((d) => {
            const client = d.clientName?.trim() || "Untitled Client";
            const template = d.template ? d.template.replaceAll("_", " ") : "Draft";
            const date = d.updatedAt ? new Date(d.updatedAt).toLocaleDateString() : "";

            return (
              <div key={d.id} className="draftTile">
                <div className="tileTop">
                  <div className="tileLogo" aria-label="Own It draft">
                    OI
                  </div>
                </div>

                <div className="tileBody">
                  <div className="tileClient" title={client}>
                    {client}
                  </div>
                  <div className="tileMeta">
                    {template}
                    {date ? ` • ${date}` : ""}
                  </div>
                </div>

                <div className="tileActions">
                  <button className="chip" type="button" onClick={() => onLoad(d.id)}>
                    Open
                  </button>
                  <button className="chip" type="button" onClick={() => onDuplicate(d.id)}>
                    Duplicate
                  </button>
                  <button className="chipDanger" type="button" onClick={() => onDelete(d.id)}>
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .wrap {
          width: 100%;
        }

        .head {
  padding-bottom: 10px;
}
  .title {
  font-size: 18px;
  font-weight: 850;
  letter-spacing: -0.01em;
  color: rgba(255, 255, 255, 0.92);
  margin: 0;
}

.sub {
  margin-top: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1.4;
}

        .fieldInput {
          width: 100%;
          height: 42px;
          margin-top: 10px;
          padding: 0 12px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.28);
          color: rgba(255, 255, 255, 0.92);
          outline: none;
          box-sizing: border-box;
        }

        .empty {
          padding: 12px 2px;
        }

        /* TILES GRID */
        .draftGrid {
          margin-top: 12px;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 14px;
          padding-right: 6px; /* helps scrollbar not overlap */
        }

        .draftTile {
          border-radius: 22px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          display: flex;
          flex-direction: column;
          min-height: 200px;
        }

        .tileTop {
          display: flex;
          justify-content: flex-start;
        }

        .tileLogo {
          width: 44px;
          height: 44px;
          border-radius: 14px;
          background: linear-gradient(180deg, #c9a25b, #b58e4a);
          color: white;
          font-weight: 900;
          display: grid;
          place-items: center;
          letter-spacing: 0.04em;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        }

        .tileBody {
          margin-top: 16px;
          flex: 1;
          min-height: 0;
        }

        .tileClient {
          font-size: 18px;
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: rgba(255, 255, 255, 0.92);
        }

        .tileMeta {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.65);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tileActions {
          display: flex;
          gap: 8px;
          margin-top: 14px;
          flex-wrap: wrap;
        }

        .chip {
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: rgba(255, 255, 255, 0.9);
          font-weight: 750;
          font-size: 12px;
          cursor: pointer;
        }

        .chipDanger {
          padding: 8px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 120, 120, 0.35);
          background: rgba(255, 120, 120, 0.1);
          color: rgba(255, 200, 200, 0.95);
          font-weight: 750;
          font-size: 12px;
          cursor: pointer;
        }

        /* If you want hover polish */
        .draftTile:hover {
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.075);
          transform: translateY(-1px);
          transition: transform 140ms ease, background 140ms ease, border-color 140ms ease;
        }
      `}</style>
    </div>
  );
}