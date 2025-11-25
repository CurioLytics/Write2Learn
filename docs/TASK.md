# Bảng Kiểm Thử Tính Năng (Feature Test Table)

| STT | Tính năng (Feature) | Luồng | Nhánh | Kết quả mong muốn (Expected Result) | Pass? | Ghi chú / Ưu tiên |
|-----|-------------------|-------|-------|------------------------------------|-------|------------------|
| 1   | Auth              | Bắt đầu hành trình của bạn |  | Chuyển trang | FALSE |  |
| 2   |                   | Login | Quên mật khẩu | Hiển thị chức năng quên mật khẩu | TRUE | Tập trung vào Terms & Privacy |
| 3   |                   | Login | Nhập đúng mật khẩu | Đăng nhập thành công | TRUE |  |
| 4   |                   | Login | Bằng Google | Đăng nhập thành công | TRUE |  |
| 5   |                   | Signup |  | Chuyển sang trang Auth chế độ Signup | FALSE | Dịch sang tiếng Việt |
| 6   | Nhật ký           | Viết mới | Nút Lưu | Lưu nhật ký thành công | TRUE | Bỏ hiệu ứng "breathing load" |
| 7   |                   | Viết mới | Phản hồi | Hiển thị phản hồi |  | Dịch sang tiếng Việt, thêm màu accent |
| 8   |                   | Viết mới | Chỉnh metadata | Metadata được cập nhật | FALSE |  |
| 9   |                   | Nhận phản hồi |  | Không lưu nhật ký, lưu sau trang phản hồi này | FALSE |  |
| 10  |                   | Viết mới | Sửa từ trang Feedback | Dữ liệu được cache | FALSE |  |
| 11  |                   | Viết mới | Voice mode | Hiển thị auto English, chữ tạm giống roleplay | TRUE |  |
| 12  |                   | Viết mới | Lưu và tạo flashcard | Flashcard được tạo thành công | TRUE |  |
| 13  |                   | Out khởi trang không nhấn lưu |  | Gửi thông báo, không tự động lưu | FALSE |  |
| 14  |                   | Viết mới | Hoàn thành flow | Chặn không cho click back | FALSE |  |
| 15  | Từ template       | Tạo mới |  | Link được tạo | TRUE | Link quá dài |
| 16  | Từ framework      | Tạo mới |  | Link được tạo | TRUE | Link quá dài, cần format lại câu hỏi |
| 17  | Filter nhật ký    | Từ calendar | Có rồi | Hiển thị list journal của ngày, theo thứ tự | FALSE |  |
| 18  |                   | Sửa |  | Thêm tag, insert bảng tags cùng profileID | FALSE |  |
| 19  |                   | Thêm nhật ký từ tag filter |  | Auto fill tag của journal | FALSE |  |
| 20  |                   | Đọc framework |  | Update description của framework và categories | FALSE |  |
| 21  | Đọc nhật ký       | Danh sách nhật ký |  | Order by journal_date và created_at | FALSE |  |
| 22  | Roleplay          | Xem nội dung |  | Hiển thị nội dung roleplay | TRUE | Bỏ chữ "Hủy" trong dialog chọn mode |
| 23  |                   | Tạo | Voice mode | Tạo roleplay bằng voice | FALSE | Bỏ thông báo "AI đang nói...", thêm audio cho user, bỏ thông báo "Bạn còn ở đây không?" |
| 24  |                   | Tạo | Text mode | Tạo roleplay bằng text | FALSE |  |
| 25  |                   | Tạo | Hủy giữa chừng | Thoát roleplay thành công | TRUE |  |
| 26  |                   | Tạo phản hồi | Thoát chưa lưu | Hỏi có lưu không? | FALSE | Không quay lại khi đã hiển thị phản hồi |
| 27  |                   | Tạo phản hồi | Nhấn "Quay lại hội thoại" | Sửa thành "Hủy", quay về trang roleplay | FALSE | Ghi rõ "Lưu session" |
| 28  | Lưu               | Lưu session |  | Lưu vào bảng sessions và feedback | FALSE | Lịch sử hiển thị nhưng database không lưu |

