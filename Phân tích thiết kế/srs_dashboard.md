# User Story – Dashboard

## Vai trò – Hành động – Mục đích

| Vai trò    | Hành động | Mục đích |
|-------------|------------|----------|
| Người dùng | Xem bảng điều khiển tổng hợp tiến độ học tập của mình | Để người học nhận biết được mức độ cải thiện, lỗi thường gặp và được gợi ý luyện tập phù hợp nhằm nâng cao kỹ năng ngôn ngữ |

---

## Tiêu chí Chấp nhận (Acceptance Criteria)

### AC1 – Hiển thị chỉ số học tập tổng quan

**Given** người dùng đã đăng nhập và có dữ liệu học tập trong hệ thống (nhật ký, từ vựng).  
**When** người dùng mở trang Dashboard.  
**Then** hệ thống hiển thị bảng tổng quan học tập, bao gồm: số bài viết đã hoàn thành, số từ vựng đã học, số ngày streak.  
Các chỉ số được cập nhật theo thời gian thực và hiển thị bằng biểu đồ hoặc tổng kết trực quan.

---

### AC2 – Phân tích lỗi từ các bài viết theo nhóm kỹ năng (Ngữ pháp, từ vựng)

**Given** hệ thống đã lưu dữ liệu phản hồi từ các bài viết và đánh giá lỗi ngôn ngữ.  
**When** người dùng truy cập phần “Phân tích bài viết” trên Dashboard.  
**Then** hệ thống tổng hợp và phân loại lỗi từ các bài viết thành ba nhóm kỹ năng: Ngữ pháp, Từ vựng.  
Mỗi nhóm hiển thị chi tiết lỗi và số lần mắc lỗi.

---

### AC3 – Đề xuất bài tập luyện tập (Chatbot tương tác)

**Given** người học có lỗi lặp lại ở một hoặc nhiều nhóm kỹ năng trong các bài viết trước.  
**When** người dùng chọn nút “Luyện tập thêm” trong Dashboard.  
**Then** hệ thống khởi tạo chatbot tương tác để đưa ra các bài tập phù hợp (viết lại câu, chọn đáp án, ôn từ liên quan).  
Người dùng tương tác trực tiếp với chatbot, nhận phản hồi và gợi ý cải thiện ngay trong giao diện chatbot.

---

## Cấu trúc Dữ liệu

### Bảng: `feedback_logs`
Lưu trữ nhật ký về các phản hồi (feedback) mà người dùng nhận được, liên quan đến ngữ pháp hoặc từ vựng.

| Tên cột | Kiểu dữ liệu | NULL? | Mô tả | Loại |
|----------|---------------|--------|--------|------|
| id | uuid | NO | Định danh duy nhất của log phản hồi | Primary key |
| profile_id | uuid | NO | Liên kết tới người dùng trong profiles | Foreign key → profiles.id |
| type | text | YES | Loại phản hồi (ví dụ: 'grammar', 'vocab', 'style') | Thông tin |
| grammar_topic_id | uuid | YES | Liên kết tới chủ đề ngữ pháp liên quan | Foreign key → grammar_topics.id |
| vocab_topic_id | uuid | YES | Liên kết tới chủ đề từ vựng liên quan | Foreign key → vocab_topics.id |
| details | jsonb | YES | Chi tiết nội dung phản hồi (ví dụ: lỗi, gợi ý sửa) | Thông tin |
| detected_at | timestamp with time zone | YES | Thời điểm phản hồi được tạo ra (Mặc định: now()) | Thông tin |

---

### Bảng: `chatbot_sessions`
Lưu trữ các phiên hội thoại của người dùng với chatbot (ví dụ: tính năng Luyện tập theo ngữ cảnh/Roleplay).

| Tên cột | Kiểu dữ liệu | NULL? | Mô tả | Loại |
|----------|---------------|--------|--------|------|
| id | uuid | NO | Định danh duy nhất của phiên hội thoại | Primary key |
| profile_id | uuid | NO | Liên kết tới người dùng trong profiles | Foreign key → profiles.id |
| interaction_logs | jsonb | YES | Nhật ký chi tiết cuộc hội thoại (lưu trữ user/AI messages) | Thông tin |
| created_at | timestamp with time zone | YES | Thời điểm phiên bắt đầu (Mặc định: now()) | Thông tin |
| completed_at | timestamp with time zone | YES | Thời điểm phiên kết thúc | Thông tin |

---

### Bảng: `grammar_topics`
Lưu trữ danh sách các chủ đề ngữ pháp (knowledge base) mà hệ thống có thể phân tích và phản hồi.

| Tên cột | Kiểu dữ liệu | NULL? | Mô tả | Loại |
|----------|---------------|--------|--------|------|
| id | uuid | NO | Định danh duy nhất của chủ đề ngữ pháp | Primary key |
| topic_name | text | NO | Tên chủ đề ngữ pháp (ví dụ: "Verb Tenses") | Thông tin |
| parent_topic_id | uuid | YES | Liên kết cha-con (ví dụ: "Past Simple" là con của "Verb Tenses") | Foreign key → grammar_topics.id |
| level | text | YES | Cấp độ của chủ đề (ví dụ: "A1", "B2") | Thông tin |
| description | text | YES | Mô tả chi tiết về chủ đề ngữ pháp | Thông tin |

---

### Bảng: `vocab_topics`
Lưu trữ danh sách các chủ đề từ vựng mà hệ thống hỗ trợ.

| Tên cột | Kiểu dữ liệu | NULL? | Mô tả | Loại |
|----------|---------------|--------|--------|------|
| id | uuid | NO | Định danh duy nhất của chủ đề từ vựng | Primary key |
| topic_name | text | NO | Tên chủ đề (ví dụ: "Education", "Global warming") | Thông tin |
| level | text | YES | Cấp độ của chủ đề (ví dụ: "A1", "B2") | Thông tin |
| description | text | YES | Mô tả chi tiết về chủ đề | Thông tin |

---

### Bảng: `learning_progress`
Bảng tổng hợp (aggregate table) theo dõi tiến độ học tập chung của người dùng, dùng cho Dashboard.

| Tên cột | Kiểu dữ liệu | NULL? | Mô tả | Loại |
|----------|---------------|--------|--------|------|
| profile_id | uuid | NO | Liên kết tới người dùng (Quan hệ 1-1) | Primary key, Foreign key → profiles.id |
| total_words_learned | integer | YES | Tổng số từ đã học (Mặc định: 0) | Thông tin |
| total_journals_completed | integer | YES | Tổng số bài nhật ký đã viết (Mặc định: 0) | Thông tin |
| streak_days | integer | YES | Số ngày học liên tiếp (Mặc định: 0) | Thông tin |
| last_update | timestamp with time zone | YES | Thời điểm cập nhật gần nhất (Mặc định: now()) | Thông tin |

---
