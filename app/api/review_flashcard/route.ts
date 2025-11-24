import { NextRequest, NextResponse } from "next/server";
import { handleReview } from "@/lib/fsrs/handler";
import { authenticateUser } from "@/utils/api-helpers";

export async function POST(req: Request) {
  try {
    const user = await authenticateUser();
    const { vocabulary_id, flashcard_id, rating } = await req.json();

    // Support both new vocabulary_id and legacy flashcard_id
    const id = vocabulary_id || flashcard_id;
    
    if (!id || !rating)
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const result = await handleReview(id, rating);

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("❌ Review API error:", err);
    return NextResponse.json({ error: "Failed to process review" }, { status: 500 });
  }
}
