import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const runtime = "nodejs"; // IMPORTANT: fs only works on Node runtime

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function safeName(name: string) {
  // keep it simple + safe
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "_");
  return base.length ? base : "file";
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files?.length) {
      return NextResponse.json({ ok: false, error: "No files provided." }, { status: 400 });
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });

    const uploaded = [];

    for (const f of files) {
      if (!(f instanceof File)) continue;

      const bytes = await f.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(f.name);
      const base = path.basename(f.name, ext);
      const id = crypto.randomBytes(8).toString("hex");

      const filename = `${safeName(base)}__${id}${ext || ""}`;
      const filepath = path.join(UPLOAD_DIR, filename);

      await fs.writeFile(filepath, buffer);

      uploaded.push({
        originalName: f.name,
        filename,
        type: f.type || "application/octet-stream",
        size: f.size,
        url: `/uploads/${filename}`,
      });
    }

    return NextResponse.json({ ok: true, files: uploaded });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Upload failed." },
      { status: 500 }
    );
  }
}