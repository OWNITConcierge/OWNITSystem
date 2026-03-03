import fs from "fs/promises";
import path from "path";
import { notFound } from "next/navigation";
import ReportViewerClient from "./ReportViewerClient";

export default async function ReportViewerPage({
  params,
}: {
  params: { id: string };
}) {
  const filePath = path.join(
    process.cwd(),
    "public",
    "reports",
    `report_${params.id}.html`
  );

  let reportHtml = "";
  try {
    reportHtml = await fs.readFile(filePath, "utf8");
  } catch {
    notFound();
  }

  return <ReportViewerClient id={params.id} reportHtml={reportHtml} />;
}