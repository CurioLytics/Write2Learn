import { NextRequest, NextResponse } from "next/server";
import { handleReview } from "@/lib/fsrs/handler";

export async function POST(req: Request) {
  try {
    const { flashcard_id, rating } = await req.json();

    if (!flashcard_id || !rating)
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const result = await handleReview(flashcard_id, rating);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("❌ Review API error:", err);
    return NextResponse.json({ error: "Failed to process review" }, { status: 500 });
  }
}
