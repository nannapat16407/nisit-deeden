import { genCommitteePDF } from "@/lib/pdf_utils";
import { Period } from "@/types/period.type";
import { RequestAwardGroup } from "@/types/request.type";
import { User } from "@/types/user.type";
import { NextRequest, NextResponse } from "next/server";

type CommitteePDFBody = {
  issue_account: User;
  period: Period;
  award_groups_req: RequestAwardGroup[];
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CommitteePDFBody;

    if (!body.issue_account || !body.period || !Array.isArray(body.award_groups_req)) {
      return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
    }

    const pdfBytes = await genCommitteePDF(
      body.issue_account,
      body.period,
      body.award_groups_req,
    );

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
      },
    });
  } catch (error) {
    console.error("committee-pdf route error:", error);
    return NextResponse.json(
      { message: "Failed to generate committee PDF" },
      { status: 500 },
    );
  }
}
