"use client";
import { Button } from "@/components/ui/button";

export function ReviewControls({ onRate }: { onRate: (r: string) => void }) {
  const options = ["again", "hard", "good", "easy"];
  return (
    <div className="mt-6 flex gap-2">
      {options.map((r) => (
        <Button
          key={r}
          variant="outline"
          onClick={() => onRate(r)}
          className="border hover:bg-black hover:text-white rounded-lg"
        >
          {r}
        </Button>
      ))}
    </div>
  );
}
