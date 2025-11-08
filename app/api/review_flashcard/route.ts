import { NextResponse } from "next/server";
import { handleReview } from "@/lib/handleReview";

export async function POST(req: Request) {
  try {
    const { flashcard_id, rating } = await req.json();

    if (!flashcard_id || !rating)
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });

    const result = await handleReview(flashcard_id, rating);
    return NextResponse.json(result, { status: 200 });

  } catch (err: any) {
    console.error("❌ Review API error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process review" },
      { status: err.status || 500 }
    );
  }
}
