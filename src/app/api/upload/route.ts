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

    const uploaded: Array<{
      originalName: string;
      pathname: string;
      url: string;
      contentType: string;
      size: number;
    }> = [];

    for (const f of files) {
      if (!(f instanceof File)) continue;

      const ext = path.extname(f.name);
      const base = path.basename(f.name, ext);
      const id = crypto.randomBytes(8).toString("hex");

      // This is the "key" inside Blob storage (like a filepath)
      const pathname = `uploads/${safeName(base)}__${id}${ext || ""}`;

      // Upload to Vercel Blob
      const blob = await put(pathname, f, {
        access: "public", // makes it accessible via a URL
        contentType: f.type || "application/octet-stream",
        // token is read from process.env.BLOB_READ_WRITE_TOKEN automatically
      });

      uploaded.push({
        originalName: f.name,
        pathname: blob.pathname,
        url: blob.url,
        contentType: f.type || "application/octet-stream",
        size: f.size,
      });
    }

    return NextResponse.json({ ok: true, files: uploaded });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Upload failed." },
      { status: 500 }
    );
  }
}