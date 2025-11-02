import { handleReview } from "./fsrsHandler";

(async () => {
  try {
    const result = await handleReview("00000000-0000-0000-0000-000000000001", 3);
    console.log("✅ FSRS result:", result);
  } catch (error) {
    console.error("❌ Error during review:", error);
  }
})();