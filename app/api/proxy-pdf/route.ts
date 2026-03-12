import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        // You can add headers here if necessary
      },
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch PDF: ${response.statusText}`, {
        status: response.status,
      });
    }

    const arrayBuffer = await response.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
        // Prevent browsers from trying to sniff content type
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("PDF Proxy Error:", err);
    return new NextResponse("Error fetching PDF", { status: 500 });
  }
}
