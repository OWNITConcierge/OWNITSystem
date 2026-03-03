import { NextResponse } from "next/server";
import { buildHtml } from "../../../lib/html_builder";

type GenerateBody = any;

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateBody;

    const html = await buildHtml(body);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Generate failed" },
      { status: 500 }
    );
  }
}