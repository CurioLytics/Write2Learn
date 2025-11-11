sequenceDiagram
    autonumber
    actor NgườiDùng as Người dùng
    participant ỨngDụng as Ứng dụng (Next.js)
    participant FSRS as API / FSRS Engine
    participant Supabase

    %% --- Bước 1: Xem danh sách bộ từ vựng ---
    NgườiDùng ->> ỨngDụng: Mở trang /vocab
    ỨngDụng ->> Supabase: RPC get_flashcard_set_stats(user_uuid)
    Supabase -->> ỨngDụng: Trả về [{ set_id, title, total_flashcards, flashcards_due }]
    ỨngDụng -->> NgườiDùng: Hiển thị danh sách bộ từ vựng

    %% --- Bước 2: Chọn 1 bộ để ôn ---
    NgườiDùng ->> ỨngDụng: Click vào 1 bộ flashcard
    ỨngDụng ->> Supabase: RPC get_flashcards_for_review(user_uuid, set_uuid)
    Supabase -->> ỨngDụng: Trả về [{ card_id, front, back, next_review, ease_factor, interval }]
    ỨngDụng -->> NgườiDùng: Hiển thị thẻ đầu tiên

    %% --- Bước 3: Ôn tập (FSRS xử lý) ---
    loop Mỗi flashcard
        NgườiDùng ->> ỨngDụng: Lật thẻ và chọn mức độ nhớ (again / good / easy / ...)
        ỨngDụng ->> FSRS: POST /api/review(flashcard_id, rating)
        
        FSRS ->> Supabase: Lấy dữ liệu ôn tập hiện tại (stability, difficulty, last_review, ease_factor)
        Supabase -->> FSRS: Trả dữ liệu hiện tại

        FSRS ->> FSRS: Tính toán next_review, interval, ease_factor, stability
        FSRS ->> Supabase: RPC update_flashcard_review(card_id, next_review, interval, stability, ease_factor)
        Supabase -->> FSRS: Xác nhận cập nhật

        FSRS -->> ỨngDụng: Trả về thông tin cập nhật
        ỨngDụng -->> NgườiDùng: Hiển thị thẻ kế tiếp
    end

    %% --- Bước 4: Kết thúc phiên ---
    NgườiDùng ->> ỨngDụng: Hoàn thành ôn tập
    ỨngDụng ->> Supabase: RPC get_flashcard_set_stats(user_uuid)
    Supabase -->> ỨngDụng: Trả về thống kê mới
    ỨngDụng -->> NgườiDùng: Hiển thị tiến độ cập nhật
