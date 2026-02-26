import { Period } from "@/types/period.type";
import { RequestAwardGroup } from "@/types/request.type";
import { User } from "@/types/user.type";
import { promises as fs } from "fs";
import path from "path";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

type CommitteePDFResult = {
  filename: string;
  absolutePath: string;
  publicPath: string;
};

export async function genCommitteePDF(
  issue_account: User,
  period: Period,
  award_groups_req: RequestAwardGroup[],
): Promise<CommitteePDFResult> {
  const outputDir = path.join(process.cwd(), "public", "temp", "committee_pdf");
  await fs.mkdir(outputDir, { recursive: true });

  const lines: string[] = [];
  lines.push(`รายการอนุมติรางวัลในช่วงปีการศึกษา ${period.academic_year}/${period.semester}`);
  lines.push("");

  let sectionIndex = 1;
  for (const group of award_groups_req) {
    const approved = group.requests.filter(
      (request) => request.status === "PENDING_PRESIDENT",
    );
    if (approved.length === 0) continue;

    const awardName =
      approved[0]?.Award?.award_name ||
      approved[0]?.award_name ||
      group.award_id;
    lines.push(`กลุ่มที่ ${sectionIndex} รางวัล ${awardName}`);

    approved.forEach((request, index) => {
      const requesterName =
        request.Owner?.fname && request.Owner?.lname
          ? `${request.Owner.fname} ${request.Owner.lname}`
          : [request.owner_fname, request.owner_lname].filter(Boolean).join(" ") || "-";
      const requestId = request.RequestID || request.request_id || "-";
      lines.push(`   ${index + 1}) ${requesterName} | Request: ${requestId}`);
    });
    lines.push("");
    sectionIndex += 1;
  }

  if (sectionIndex === 1) {
    lines.push("No request approved by COMMITTEE.");
    lines.push("");
  }

  const signatureLabel = "ลงชื่อ";
  const signatureName = `${issue_account.prefix || ""} ${issue_account.first_name} ${issue_account.last_name}`.trim();
  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const issueDate = new Date();
  const signatureDate = `วันที่ ${issueDate.getDate()} เดือน ${thaiMonths[issueDate.getMonth()]} ปี พ.ศ. ${issueDate.getFullYear() + 543}`;

  const now = new Date();
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate(),
  ).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(
    now.getMinutes(),
  ).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
  const filename = `committee-approve-${period.period_id}.pdf`;
  const absolutePath = path.join(outputDir, filename);
  const publicPath = `/temp/committee_pdf/${filename}`;

  const fontDir = path.join(process.cwd(), "public", "fonts");
  const configuredFont = process.env.PDF_FONT_FILE;
  let fontPath: string;

  if (configuredFont) {
    fontPath = path.isAbsolute(configuredFont)
      ? configuredFont
      : path.join(process.cwd(), configuredFont);
  } else {
    const fontFiles = await fs.readdir(fontDir);
    const picked = fontFiles.find((file) => /\.(ttf|otf)$/i.test(file));
    if (!picked) {
      throw new Error("No .ttf or .otf font found in public/fonts");
    }
    fontPath = path.join(fontDir, picked);
  }

  const fontBytes = await fs.readFile(fontPath);

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(fontBytes);
  const page = pdfDoc.addPage([595.28, 841.89]); // A4

  const fontSize = 16;
  let y = 800;
  for (const line of lines) {
    page.drawText(line, {
      x: 40,
      y,
      size: fontSize,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 18;
    if (y < 40) break;
  }

  const rightMargin = 40;
  const labelWidth = font.widthOfTextAtSize(signatureLabel, fontSize);
  const nameWidth = font.widthOfTextAtSize(signatureName, fontSize);
  const signatureY = Math.max(y - 18, 80);
  const dateWidth = font.widthOfTextAtSize(signatureDate, fontSize);

  page.drawText(signatureLabel, {
    x: page.getWidth() - rightMargin - labelWidth,
    y: signatureY,
    size: fontSize,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(signatureName, {
    x: page.getWidth() - rightMargin - nameWidth,
    y: signatureY - 18,
    size: fontSize,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  page.drawText(signatureDate, {
    x: page.getWidth() - rightMargin - dateWidth,
    y: signatureY - 36,
    size: fontSize,
    font,
    color: rgb(0.1, 0.1, 0.1),
  });

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(absolutePath, Buffer.from(pdfBytes));

  return { filename, absolutePath, publicPath };
}
