# Flow

1. Người dùng chọn **ôn tập từ lỗi sai**.  
2. AI tạo bài tập dựa trên các lỗi  trước đó.  
3. Người dùng nhập đáp án vào các ô text.  
4. Người dùng nhấn **Xong**.  
5. AI phân tích phản hồi, đưa điểm số và feedback cho từng câu.  
6. Nếu muốn làm thêm:
   - Nhấn **Làm thêm** → Gọi lại webhook 
   - Nhấn **Đóng** để thoát.


Weebhook để gen bài tập: GET_GEN_EXERCISE_WEBHOOK_URL
-> input data: các looxoi sai trong khung thời gian đã chọn (hiện ở UI)
-> output: list câu hỏi
Weebhook để chấm bài tập: GET_EXERCISE_CHECK_WEBHOOK_URL
-> input data: câu hỏi + đáp án người dùng nhập cho từng câu    
-> output: điểm số và feedback cho từng câu