import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";
import path from "path";

export const runtime = "nodejs";

function safeName(name: string) {
  const base = name.replace(/[^a-zA-Z0-9._-]+/g, "_");
  return base.length ? base : "file";
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Use POST with multipart/form-data (files[])." });
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files");

    if (!files?.length) {
      return NextResponse.json({ ok: false, error: "No files provided." }, { status: 400 });
    }

    const uploaded: any[] = [];

    for (const f of files) {
      if (!(f instanceof File)) continue;

      const bytes = await f.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(f.name);
      const base = path.basename(f.name, ext);
      const id = crypto.randomBytes(8).toString("hex");
      const filename = `${safeName(base)}__${id}${ext || ""}`;

      // ✅ Store in Blob (public is simplest to start)
      const blob = await put(`uploads/${filename}`, buffer, {
        access: "public",
        contentType: f.type || "application/octet-stream",
      });

      uploaded.push({
        originalName: f.name,
        filename,
        type: f.type || "application/octet-stream",
        size: f.size,
        url: blob.url, // ✅ blob URL
      });
    }

    return NextResponse.json({ ok: true, files: uploaded });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err?.message || "Upload failed." }, { status: 500 });
  }
}