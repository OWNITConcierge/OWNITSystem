import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { buildHtml } from "../../../lib/html_builder";

type GenerateBody = any;


export async function POST(req: Request) {
  try {
    const body = (await req.json()) as GenerateBody;

    const id = crypto.randomUUID();
    const filename = `report_${id}.html`;

    const reportsDir = path.join(process.cwd(), "public", "reports");
    await fs.mkdir(reportsDir, { recursive: true });

    const reportHtml = await buildHtml(body);

    await fs.writeFile(path.join(reportsDir, filename), reportHtml, "utf8");

    return NextResponse.json({
      ok: true,
      reportUrl: `/report/${id}`
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Generate failed" },
      { status: 500 }
    );
  }
}