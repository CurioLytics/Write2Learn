import { fsrs as createFSRS, generatorParameters, Rating } from "ts-fsrs";

export class FSRS {
  private fsrs: ReturnType<typeof createFSRS>;

  constructor() {
    const params = generatorParameters({ enable_fuzz: true, enable_short_term: true });
    this.fsrs = createFSRS(params);
  }

  computeNextReview(card: any, rating: "Again" | "Hard" | "Good" | "Easy") {
    const ratingMap = {
      Again: Rating.Again,
      Hard: Rating.Hard,
      Good: Rating.Good,
      Easy: Rating.Easy,
    } as const;

    const now = new Date();
    const engineAny = this.fsrs as any;

    let scheduledRecord: { card: any; log: any } | null = null;

    if (typeof engineAny.next === "function") {
      // preferred: engine.next(card, now, rating)
      scheduledRecord = engineAny.next(card, now, ratingMap[rating]);
    } else {
      // fallback: engine.repeat(card, now)[rating]
      const previewUnknown = engineAny.repeat(card, now) as unknown;
      scheduledRecord = (previewUnknown as any)[ratingMap[rating]];
    }

    if (!scheduledRecord) throw new Error("FSRS engine returned no schedule");

    return {
      card: scheduledRecord.card,
      log: scheduledRecord.log,
      nextReview: scheduledRecord.card?.due ?? null,
    };
  }
}
