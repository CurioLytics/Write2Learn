import {
  createEmptyCard,
  formatDate,
  fsrs,
  generatorParameters,
  Rating,
} from "ts-fsrs";

// 1️⃣ Khởi tạo tham số thuật toán
const params = generatorParameters({
  enable_fuzz: true,
  enable_short_term: false,
});

// 2️⃣ Tạo đối tượng FSRS
const f = fsrs(params);

// 3️⃣ Tạo một thẻ flashcard mới
const card = createEmptyCard(new Date("2022-02-01T10:00:00Z"));
const now = new Date("2022-02-02T10:00:00Z");

// 4️⃣ Gọi hàm repeat => trả về kết quả lên lịch cho từng rating (Again, Hard, Good, Easy)
const scheduling_cards = f.repeat(card, now);

// 5️⃣ In kết quả ra console
for (const item of scheduling_cards) {
  const grade = item.log.rating;
  const { log, card } = item;

  console.group(`⭐ Rating: ${Rating[grade]}`);
  console.table({
    Card: {
      ...card,
      due: formatDate(card.due),
      last_review: card.last_review ? formatDate(card.last_review) : "-",
    },
  });
  console.table({
    Log: {
      ...log,
      review: formatDate(log.review),
    },
  });
  console.groupEnd();
  console.log("───────────────────────────────────────────────");
}
