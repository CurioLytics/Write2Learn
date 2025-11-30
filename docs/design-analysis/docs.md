

# 📘 **MỤC LỤC LUẬN VĂN – ỨNG DỤNG WEB HỖ TRỢ HỌC NGÔN NGỮ**

## **1. TÓM TẮT (ABSTRACT)**

Đề tài tập trung nghiên cứu và phát triển ứng dụng web "Write2Learn" nhằm giải quyết vấn đề "học thụ động" trong việc học ngoại ngữ, nơi người học thường gặp khó khăn trong việc chuyển hóa kiến thức đầu vào (nghe, đọc) thành kỹ năng đầu ra (nói, viết).

Write2Learn là một nền tảng học tiếng Anh tích hợp trí tuệ nhân tạo (AI), cung cấp môi trường tương tác để người dùng rèn luyện kỹ năng thông qua ba phương pháp chính:
1.  **Viết nhật ký (Journaling):** Hỗ trợ người dùng viết về các chủ đề hàng ngày hoặc theo mẫu (frameworks), với tính năng AI feedback giúp sửa lỗi ngữ pháp, từ vựng và gợi ý cách diễn đạt tự nhiên ngay lập tức.
2.  **Luyện vai (Roleplay):** Tạo ra các tình huống giao tiếp giả lập (như đặt hàng, phỏng vấn, du lịch) với đối tác AI, giúp người học luyện phản xạ và tăng sự tự tin.
3.  **Học từ vựng (Vocabulary):** Tích hợp Hệ thống Lặp lại Ngắt quãng (Spaced Repetition System - SRS) để quản lý và ôn tập từ vựng hiệu quả, đảm bảo kiến thức được lưu vào trí nhớ dài hạn.

Hệ thống được xây dựng trên nền tảng công nghệ hiện đại bao gồm Next.js (App Router), TypeScript, Supabase và tích hợp các mô hình ngôn ngữ lớn (LLMs). Kết quả đạt được là một công cụ hỗ trợ học tập toàn diện, giúp cá nhân hóa lộ trình học và khuyến khích thói quen sử dụng ngoại ngữ chủ động mỗi ngày.

## **2. GIỚI THIỆU ĐỀ TÀI**

### 2.1. Bối cảnh và lý do chọn đề tài

Bối cảnh và thực trạng học ngôn ngữ hiện nay
Trong bối cảnh toàn cầu hóa và cách mạng công nghệ 4.0, việc học ngoại ngữ đã trở thành yếu tố then chốt để mở rộng cơ hội nghề nghiệp, giao lưu văn hóa và phát triển cá nhân. Theo báo cáo của Tổ chức Giáo dục, Khoa học và Văn hóa Liên Hợp Quốc (UNESCO), hơn 1,5 tỷ người trên thế giới đang học tiếng Anh như ngôn ngữ thứ hai, phản ánh nhu cầu ngày càng tăng về kỹ năng ngôn ngữ để thích ứng với môi trường làm việc quốc tế. Tuy nhiên, thực trạng học ngôn ngữ hiện nay vẫn tồn tại nhiều hạn chế, chủ yếu tập trung vào cách tiếp cận thụ động (input) qua nghe, đọc hoặc học từ vựng qua flashcard, thay vì khuyến khích sử dụng chủ động (output) như viết và nói.
Những khó khăn phổ biến mà người học gặp phải bao gồm:
Thiếu duy trì tiếp xúc hàng ngày: Nhiều người chỉ tương tác ngắt quãng với ngôn ngữ, dẫn đến việc không hình thành thói quen lâu dài, khiến kiến thức nhanh chóng mai một.
Thiếu hoạt động output: Dù sở hữu vốn từ vựng và ngữ pháp cơ bản, người học thường "biết mà không dùng được" do ít thực hành viết hoặc nói trong ngữ cảnh thực tế.
Động lực dễ suy giảm: Các công cụ học tập hiện tại thường nhấn mạnh vào "luyện tập nhanh" qua trò chơi hoặc bài kiểm tra ngắn. Tuy nhiên, chúng chưa tạo được sự gắn kết giữa việc học và trải nghiệm cá nhân hằng ngày, nên khó hình thành động lực bền vững. Kết quả là người học bỏ dở sau một vài ngày
Ngôn ngữ thiếu tự nhiên: Việc học qua bài tập cố định hoặc từ vựng rời rạc khiến người học khó áp dụng vào đời sống hàng ngày, dẫn đến khoảng cách giữa lý thuyết và thực tiễn.
Khoảng trống này đặt ra nhu cầu cấp thiết về một công cụ học ngôn ngữ không chỉ cung cấp input mà còn thúc đẩy output tự nhiên, gắn kết với trải nghiệm cá nhân – chẳng hạn như viết nhật ký – để biến việc học thành thói quen bền vững và hiệu quả.


### 2.3. Mục tiêu nghiên cứu và phạm vi
Mục tiêu nghiên cứu và câu hỏi nghiên cứu
Mục tiêu chung: Nghiên cứu nhằm phân tích và thiết kế một mô hình hệ thống hỗ trợ học ngoại ngữ qua viết nhật ký, kết hợp cơ chế gợi ý từ vựng, phản hồi và cơ chế ôn tập từ vựng, phục vụ mục đích demo và đánh giá thiết kế.
Mục tiêu cụ thể:
Phân tích yêu cầu người dùng và nghiệp vụ: Thu thập và hệ thống hóa yêu cầu cho các mảng chính liên quan đến viết nhật ký, thực hành và quản lý từ vựng; xác định kịch bản người dùng, luồng chính và các ràng buộc (single-user demo, realtime phản hồi, xuất dữ liệu, thông báo).
Mô hình hóa dữ liệu và quy trình: Thiết kế mô hình dữ liệu cho các thành phần như mục nhật ký, thẻ từ vựng, phiên học, phản hồi và hồ sơ người dùng; mô hình hóa quy trình nghiệp vụ chính bằng sơ đồ luồng.
Thiết kế kiến trúc hệ thống ở mức bản vẽ: Đề xuất kiến trúc phù hợp demo (frontend, API, cơ sở dữ liệu, tích hợp công cụ hỗ trợ, công cụ tìm kiếm web, thông báo).
Thiết kế giao diện và trải nghiệm (UX/UI) cho nguyên mẫu: Thiết kế wireframes cho các màn chính liên quan đến viết nhật ký, lựa chọn mẫu, luyện tập theo ngữ cảnh, feedback, màn ôn tập từ vựng.
Soạn thảo mẫu prompt & kịch bản hỗ trợ: Xây bộ prompt templates để đánh giá bài viết trên các yếu tố (ngữ pháp, từ vựng, diễn đạt), đề xuất nội dung ôn tập.
Đề xuất tiêu chí đánh giá & kịch bản nghiệm thu thiết kế: Xác định bộ chỉ số để đo chất lượng giao diện và hiệu quả (usability metrics, correctness of phản hồi, coverage of ôn tập từ vựng); soạn kịch bản thử nghiệm người dùng demo.
Chuẩn bị tài liệu bàn giao thiết kế: Bản đặc tả chức năng mức kỹ thuật, mô hình dữ liệu, sơ đồ luồng, wireframes, thư viện prompt, và checklist privacy/security (lưu nhật ký cá nhân, bảo mật dữ liệu); hướng dẫn xuất dữ liệu và quy trình backup/restore dữ liệu demo.


### 2.4. Đối tượng và phạm vi nghiên cứu

Đối tượng: 
Người học ngoại ngữ (trọng tâm là sinh viên, người đi làm trẻ, hoặc những người tự học ngoại ngữ) sử dụng phương pháp viết nhật ký hằng ngày bằng ngôn ngữ mục tiêu.
Quá trình rèn luyện kỹ năng ngoại ngữ (đặc biệt là kỹ năng viết và tư duy bằng ngoại ngữ) thông qua hoạt động viết nhật ký.
Phạm vi:
Nội dung: Tập trung viết nhật ký, thực hành tình huống và quản lý, ôn tập từ vựng.
Không gian: Phân tích Write2Learn với ba mảng Journal, Practice, Vocab Hub.
Thời gian: Thực hiện từ tháng 8 đến tháng 12 năm 2025, ở mức phân tích và thiết kế.
Phương pháp nghiên cứu


### 2.5. Phương pháp
Phương pháp nghiên cứu
Phương pháp nghiên cứu lý thuyết
Khảo cứu các kỹ thuật học từ vựng hiệu quả như lặp lại ngắt quãng (spaced repetition), chủ động gợi nhớ (active recall), học theo ngữ cảnh và phương pháp dựa trên câu chuyện (story-based learning) để làm nền tảng lý thuyết cho hệ thống quản lý từ.
Tìm hiểu lý thuyết hình thành thói quen (habit formation), động lực nội tại (intrinsic motivation) và các nguyên tắc thiết kế khuyến khích tương tác (gamification, nudge theory) nhằm xây dựng giải pháp duy trì thói quen học.
Nghiên cứu các phương pháp kích thích và hỗ trợ làm tăng trải nghiệm viết: gợi ý sáng tạo (writing prompts), phản tư cá nhân, kết hợp công nghệ phản hồi tự động (AI feedback).
Phương pháp thu thập thông tin
Tổng hợp tài liệu khoa học về các phương pháp học ngôn ngữ, đặc biệt qua việc viết nói chung và nhật ký nói riêng, xây dựng vốn từ, duy trì thói quen và kỹ thuật khơi gợi ý tưởng viết.
Phân tích các ứng dụng học ngoại ngữ hiện nay nhằm nhận diện điểm mạnh, hạn chế và khoảng trống trong việc hỗ trợ viết nhật ký, quản lý từ vựng và duy trì động lực học tập.
Thực hiện phỏng vấn thử nghiệm quy mô nhỏ với người học ngoại ngữ để tìm hiểu nhu cầu thực tế: duy trì thói quen viết, cách ôn tập từ, mong muốn nhận phản hồi và các yếu tố khuyến khích viết.
Phương pháp tiếp cận hệ thống
Áp dụng cách tiếp cận theo chức năng, chia hệ thống thành các phân hệ chính:
Journal Hub: hỗ trợ viết nhật ký và phản hồi thông minh.
Practice Hub: luyện viết theo tình huống và chủ đề.
Vocab Hub: quản lý và ôn tập từ vựng qua flashcard và dịch câu chuyện.
Progress Hub: Theo dõi tiến độ, phân tích lỗi, streak, đề xuất luyện tập cá nhân hóa
Phương pháp mô hình hóa
Dùng biểu đồ quan hệ thực thể (ERD) để mô tả dữ liệu cho các thành phần như nhật ký, từ vựng và hồ sơ người dùng.
Áp dụng sơ đồ luồng (flowchart) và sơ đồ trình tự (sequence diagram) để thể hiện quy trình: từ viết nhật ký, nhận phản hồi, trích xuất từ mới đến ôn tập.
Thiết kế wireframes và wireflows để hình dung giao diện và trải nghiệm người dùng, đảm bảo sự mạch lạc trong tương tác với hệ thống.
Kết quả dự kiến đạt được
Kết quả đạt được từ đề tài nghiên cứu là một bộ thiết kế hệ thống cho ứng dụng WriteToLearn. Cụ thể:
Về mặt chức năng: Xây dựng đặc tả chi tiết cho ba phân hệ (Journal, Practice, Vocab Hub) với luồng nghiệp vụ rõ ràng.
Về mặt kỹ thuật: Đề xuất kiến trúc hệ thống ở mức phân tích (client, server, cơ sở dữ liệu, tích hợp AI).
Về mặt trải nghiệm: Cung cấp bộ wireframes và kịch bản sử dụng minh họa cho người học.
Về mặt học thuật: Làm rõ cách viết nhật ký kết hợp AI và quản lý từ vựng có thể hỗ trợ duy trì thói quen học ngoại ngữ gắn với đời sống hằng ngày.


### 2.6. Thị trường
Phân tích thị trường
Nhóm công cụ
Ưu điểm
Điểm cần cải thiện
Ứng dụng học từ vựng (Duolingo, Memrise, Quizlet)
- Học từ vựng qua trò chơi, flashcard
- Có spaced repetition giúp nhớ lâu
- Tập trung từ đơn lẻ, ít ngữ cảnh thực tế
-Thiếu luyện viết/sáng tạo- Khó áp dụng trong tình huống đời sống
Ứng dụng giao tiếp & luyện nói (HelloTalk, Tandem, Italki)
- Luyện nói trực tiếp với người bản ngữ/cộng đồng
- Phát triển kỹ năng giao tiếp tự nhiên
- Khó duy trì thói quen hàng ngày
- Không có cơ chế lưu trữ và hệ thống hóa những điểm người học cần cải thiện, nên khó theo dõi tiến bộ hoặc ôn tập lại các kiến thức còn thiếu.
Công cụ hỗ trợ viết (Grammarly, Lang-8, Write & Improve)
- Sửa lỗi chính tả, ngữ pháp
- Hữu ích cho viết học thuật/công việc
- Ít khuyến khích viết hằng ngày
- Nghiêng về formal writing, ít hỗ trợ viết cá nhân

Có thể thấy, các công cụ học ngoại ngữ hiện nay đã mang lại nhiều giá trị rõ rệt cho người học: một số tập trung mạnh vào việc ghi nhớ từ vựng, trong khi số khác mở rộng cơ hội giao tiếp thực tế. Tuy nhiên, chính sự thiên lệch này lại tạo ra khoảng trống: người học dễ thuộc nhiều từ nhưng khó vận dụng tự nhiên, hoặc có thể trò chuyện nhưng thiếu nền tảng ngôn ngữ sâu để duy trì tiến bộ lâu dài. Điều còn thiếu là một giải pháp dung hòa – nơi viết nhật ký, phản hồi thông minh, gợi ý từ vựng và duy trì thói quen được tích hợp thành một trải nghiệm liền mạch. Đây chính là định hướng mà Write2Learn theo đuổi: biến quá trình học trở thành một phần tự nhiên của đời sống và suy ngẫm hằng ngày của người học.

### Khoảng trống và Write to Learn
Giới thiệu ý tưởng “Write2Learn”
Sản phẩm được thiết kế như một không gian học ngoại ngữ cá nhân, nơi người học có thể vừa tự do thể hiện bản thân, vừa luyện tập theo định hướng, đồng thời xây dựng vốn từ vựng gắn với ngữ cảnh thực tế. Ý tưởng cốt lõi là giúp người học không chỉ ghi nhớ từ ngữ và cấu trúc, mà còn vận dụng chúng một cách tự nhiên trong giao tiếp và đời sống hằng ngày.
Ứng dụng xoay quanh 3 mảng chính:
Journal: Nhật ký học tập, nơi người dùng ghi lại suy nghĩ hoặc trải nghiệm hàng ngày bằng ngoại ngữ. Đây là cách để luyện viết, phản ánh tiến bộ, và cá nhân hóa quá trình học.
Practice: Thực hành qua hình thức:Scenario-based: luyện tập qua các tình huống mô phỏng đời thực (mua sắm, du lịch, trò chuyện bạn bè...).
Vocab Hub: Trung tâm từ vựng, nơi người học củng cố kiến thức qua flashcards, giúp từ ngữ gắn liền với ngữ cảnh mà nó được tạo ra
Progress Hub: Trung tâm theo dõi và tối ưu hóa tiến độ học tập, nơi người dùng xem toàn cảnh hành trình của mình qua các chỉ số trực quan (streak liên tục, tổng từ vựng đã nhớ, số bài nhật ký/roleplay đã hoàn thành, biểu đồ tiến bộ theo thời gian), phân tích lỗi thường gặp (ngữ pháp, từ vựng, cấu trúc câu), đồng thời nhận đề xuất luyện tập cá nhân hóa ngay lập tức (ôn lại lỗi cũ, từ vựng sắp quên, hoặc bài tập nhắm đúng điểm yếu) để duy trì động lực và cải thiện bền vững.


---

## **3. CƠ SỞ LÝ THUYẾT**

### 3.1. Lý thuyết giáo dục và học ngôn ngữ

2.2.1. Học tập cá nhân hóa (Personalized Learning)
Trong bối cảnh giáo dục hiện đại, cách tiếp cận “learner-centered” dần thay thế “teacher-centered”, nhấn mạnh vai trò chủ thể của người học. Lý thuyết học tập cá nhân hóa dựa trên nhận định rằng mỗi cá nhân đều có đặc điểm riêng về nền tảng kiến thức, mục tiêu học tập, sở thích và động lực. Do đó, việc áp dụng cùng một chương trình học cho mọi người có thể dẫn đến lãng phí thời gian, tạo ra cảm giác quá khó hoặc quá dễ, từ đó giảm hiệu quả.
 Học tập cá nhân hóa hướng đến việc điều chỉnh nội dung, mức độ và phương thức truyền đạt sao cho phù hợp với đặc điểm riêng của từng người học. Trong dự án Write2Learn, nguyên tắc này được hiện thực hóa thông qua việc hệ thống theo dõi tiến trình học, nhận diện lỗi ngữ pháp và từ vựng chưa thành thạo, từ đó đưa ra gợi ý về bài tập, thử thách hoặc hoạt động ôn luyện phù hợp với từng cá nhân.
2.2.2. Học qua trải nghiệm và phản hồi (Experiential Learning + Feedback Loop)
Theo Kolb (1984), học tập qua trải nghiệm được cấu trúc thành một chu trình gồm bốn giai đoạn: (1) trải nghiệm cụ thể, (2) phản ánh, (3) khái quát hóa và (4) ứng dụng thử. Lý thuyết này cho rằng tri thức được hình thành bền vững khi người học trực tiếp tham gia vào hoạt động, sau đó suy ngẫm và rút ra nguyên tắc để áp dụng trong những tình huống mới.
 Trong ngữ cảnh học ngôn ngữ, trải nghiệm có thể là việc viết nhật ký cá nhân hoặc tham gia đối thoại giả lập. Phản ánh diễn ra khi người học so sánh bài viết của mình với phản hồi từ hệ thống. Khái quát hóa được hình thành khi người học rút ra quy tắc sử dụng ngôn ngữ từ những sai sót đã được chỉ ra. Ứng dụng cuối cùng là việc thử viết lại hoặc tham gia thử thách viết mới.
 Một yếu tố bổ trợ quan trọng là feedback loop – vòng lặp phản hồi. Vòng lặp này tạo cơ chế “thử - sai - sửa - lặp lại”, cho phép người học điều chỉnh liên tục, củng cố kỹ năng và dần đạt em độ chính xác và tự nhiên trong sử dụng ngôn ngữ.
2.2.3. Ghi nhớ có khoảng cách (Spaced Repetition System – SRS)
Lý thuyết SRS dựa trên nghiên cứu về đường cong lãng quên của Ebbinghaus (1885), cho thấy rằng kiến thức mới sẽ bị quên đi nhanh chóng nếu không được ôn tập. Nguyên tắc của SRS là sắp xếp thời điểm ôn tập ngay trước khi thông tin có nguy cơ bị quên, nhờ đó em ưu hóa việc củng cố trí nhớ dài hạn.
 Trong Write2Learn, nguyên tắc này được triển khai thông qua hệ thống thẻ từ (flashcards) với bốn trạng thái: New → Learning → Review → Mastered. Hệ thống tự động xác định khoảng thời gian ôn tập phù hợp, ví dụ gợi ý ôn lại một từ sau ba ngày kể từ lần học trước nếu người học chưa thành thạo. Nhờ vậy, người học tiết kiệm thời gian bằng cách chỉ tập trung vào những đơn vị kiến thức sắp bị lãng quên, thay vì ôn lại toàn bộ.
2.2.4. Lý thuyết nhập ngôn ngữ thứ hai (Second Language Acquisition – SLA)
Các lý thuyết SLA cung cấp nền tảng quan trọng cho việc thiết kế phương pháp học ngôn ngữ. Krashen (1982) với Input Hypothesis cho rằng người học cần tiếp xúc với đầu vào ngôn ngữ ở mức i+1, tức là vừa vượt trên năng lực hiện tại một chút, để duy trì thử thách nhưng vẫn đảm bảo khả năng tiếp thu. Swain (1985) với Output Hypothesis nhấn mạnh vai trò của việc sản xuất ngôn ngữ (viết, nói) như một “tấm gương soi” để người học phát hiện ra những khoảng trống kiến thức. Long (1996) với Interaction Hypothesis chỉ ra rằng thông qua tương tác, người học nhận phản hồi, điều chỉnh và củng cố tri thức. Bên cạnh đó, Affective Filter Hypothesis nhấn mạnh tác động của yếu tố tâm lý: lo lắng, sợ sai hay áp lực điểm số có thể làm suy giảm khả năng tiếp thu.
 Dựa trên các lý thuyết này, Write2Learn tạo ra một môi trường viết tự do, nơi học viên không bị áp lực phán xét. AI đưa ra phản hồi nhẹ nhàng, tập trung vào khích lệ và gợi mở, thay vì chỉ trích hay chấm điểm khắt khe, qua đó góp phần giảm rào cản cảm xúc và tăng hiệu quả tiếp thu.

### 3.2. Lý thuyết hệ thống thông tin (MIS)

2.1.1. Khái niệm phần mềm
Phần mềm (software) là tập hợp các chương trình, dữ liệu và các chỉ dẫn được thiết kế để điều khiển hoạt động của máy tính hoặc thiết bị điện tử nhằm thực hiện các nhiệm vụ cụ thể. Nó đối lập với phần cứng (hardware), phần mềm là phần vô hình bao gồm ứng dụng, hệ điều hành, thư viện tiện ích, tài liệu mô tả, và các quy trình liên quan.
Phần mềm được phân loại chủ yếu thành hai nhóm:
Phần mềm hệ thống (system software): Cung cấp nền tảng điều hành (OS), trình điều khiển thiết bị (drivers) và các dịch vụ nền tảng để phần mềm ứng dụng có thể chạy.
Phần mềm ứng dụng (application software): Được xây dựng nhằm mục đích thực hiện các chức năng cụ thể phục vụ người dùng cuối như xử lý văn bản, quản lý dữ liệu, giao tiếp trực tuyến, giáo dục, v.v.
Phần mềm còn gồm tài liệu, thông số kỹ thuật, hướng dẫn vận hành và bảo trì. Việc phát triển phần mềm đòi hỏi lập trình, thiết kế, kiểm thử, đóng gói và triển khai, bảo trì. 
2.1.2. Phần mềm dưới dạng dịch vụ (Software as a Service — SaaS)
Định nghĩa: Phần mềm dưới dạng dịch vụ (SaaS) là một mô hình phân phối phần mềm trong đó ứng dụng được lưu trữ và vận hành bởi nhà cung cấp bên thứ ba trên hạ tầng đám mây, và người dùng truy cập ứng dụng qua internet, thường bằng trình duyệt hoặc app nhẹ, mà không cần cài đặt phần mềm trên máy cục bộ. 
Đặc điểm kỹ thuật & mô hình kinh doanh:
Mô hình thuê bao (subscription-based): người dùng trả phí theo chu kỳ (tháng, năm) để sử dụng dịch vụ.
Đa khách thuê (multi-tenant): một phiên bản phần mềm có thể phục vụ nhiều khách hàng, chia sẻ tài nguyên trong khi vẫn cách ly dữ liệu và cấu hình nếu cần.
Quản lý bên nhà cung cấp: nhà cung cấp chịu trách nhiệm về cơ sở hạ tầng, bảo mật, cập nhật phần mềm, sao lưu, bảo trì. Người dùng chỉ sử dụng và cấu hình phần mềm trong phạm vi được phép.
Khả năng mở rộng và truy cập linh hoạt: cho phép người dùng truy cập từ nhiều thiết bị, địa điểm khác nhau; nhà cung cấp có thể mở rộng tài nguyên khi nhu cầu tăng.
Ưu điểm & hạn chế:
Ưu điểm: giảm chi phí đầu tư ban đầu về hạ tầng; người dùng luôn có phiên bản cập nhật mới; dễ dàng truy cập từ xa; khả năng mở rộng tốt.
Hạn chế: phụ thuộc vào kết nối internet; bảo mật, quyền riêng tư dữ liệu có thể là mối quan ngại; khả năng kiểm soát phần mềm và tuỳ chỉnh hạn chế nếu khách thuê không có quyền sâu.


### 3.3. Mô hình phát triển phần mềm

Phương pháp Design Thinking
Định nghĩa: Design Thinking là một phương pháp luận tiếp cận sáng tạo — kết hợp phân tích và trực giác — nhằm giải quyết các vấn đề phức tạp bằng cách đặt người dùng ở trung tâm. Nó xuất phát từ ngành thiết kế nhưng nay được áp dụng rộng rãi trong phát triển sản phẩm, dịch vụ và phần mềm. 
Các bước cơ bản:
Empathize (Thấu cảm): hiểu người dùng, nhu cầu, hành vi và khó khăn thông qua quan sát, phỏng vấn, khảo sát.
Define (Xác định vấn đề): tổng hợp thông tin thu thập được để xác định các vấn đề cốt lõi (“pain points”) cần giải quyết.
Ideate (Hình thành ý tưởng): tạo ra nhiều giải pháp khả thi, khuyến khích sáng tạo, tư duy phân nhánh
Prototype (Nguyên mẫu hóa): tạo bản thử nghiệm (wireframe, mockup, MVP) để hiện thực hóa các ý tưởng và kiểm tra tính khả thi. 
Test (Kiểm thử và lặp lại): kiểm thử nguyên mẫu với người dùng thực, thu thập phản hồi và điều chỉnh thiết kế; quá trình này có thể lặp lại nhiều lần.
Tính chất đặc trưng và vai trò:
Tiếp cận hướng người dùng (human-centered).
Tính sáng tạo (creativity), trực quan (visualization), khả năng thử nghiệm và chấp nhận sai sót để học hỏi (iteration)
Giải quyết các vấn đề phức tạp (wicked problems) nơi yêu cầu sự đổi mới, thay vì những vấn đề có giải pháp xác định từ đầu. 



### 4.4. Công nghệ, môi trường và công cụ sử dụng
Trong khuôn khổ dự án Write2Learn, một số công cụ và công nghệ nền tảng được lựa chọn nhằm hỗ trợ các giai đoạn thiết kế, phát triển và vận hành hệ thống.
draw.io (diagrams.net) là công cụ trực quan hóa, cho phép xây dựng nhiều loại sơ đồ khác nhau như flowcharts, UML, ER diagrams, BPMN, sơ đồ tổ chức và sơ đồ mạng. Công cụ này được phát triển dựa trên công nghệ HTML5 và JavaScript, hỗ trợ lưu trữ cục bộ hoặc trên nền tảng đám mây, đồng thời có khả năng xuất dữ liệu sang nhiều định dạng như PNG, SVG hoặc PDF. Trong phạm vi dự án, draw.io đóng vai trò quan trọng trong việc mô hình hóa kiến trúc hệ thống, cơ sở dữ liệu và các luồng công việc. Cụ thể, nó được sử dụng để thiết kế sơ đồ thực thể - quan hệ (ERD) cho các bảng dữ liệu chính, xây dựng sơ đồ luồng người dùng (từ đăng ký đến viết, nhận phản hồi và ôn tập), đồng thời hỗ trợ quá trình design thinking bằng cách giúp nhóm phát triển và các bên liên quan hình dung rõ trải nghiệm người học.
Figma là công cụ thiết kế giao diện người dùng (UI) và trải nghiệm người dùng (UX), đồng thời hỗ trợ prototyping theo thời gian thực. Với các nguyên tắc thiết kế như usability, accessibility, consistency, hierarchy, contrast và alignment, Figma cho phép cộng tác nhóm, chia sẻ bản thiết kế và thực hiện kiểm thử khả dụng (usability testing). Trong dự án, Figma được sử dụng để phát triển giao diện cho các thành phần chính như màn hình viết, màn hình phản hồi và bảng điều khiển ôn tập. Đồng thời, công cụ này còn được dùng để xây dựng nguyên mẫu (prototype), tiến hành thử nghiệm luồng giao diện người dùng, thu thập phản hồi từ học viên và điều chỉnh thiết kế trước khi chuyển sang giai đoạn lập trình. Ngoài ra, Figma còn hỗ trợ thiết kế đa nền tảng (web và mobile), đảm bảo tính đáp ứng (responsive design) và khả năng truy cập theo các chuẩn quốc tế.
Supabase là hệ quản trị cơ sở dữ liệu mã nguồn mở, được thiết kế để cung cấp khả năng thay thế cho Firebase. Supabase sử dụng cơ sở dữ liệu quan hệ PostgreSQL, đồng thời cung cấp API tự động và khả năng tích hợp trực tiếp với các công cụ phân tích dữ liệu và quản lý người dùng. Supabase cho phép lưu trữ dữ liệu có cấu trúc và bán cấu trúc, đồng thời hỗ trợ các chức năng như xác thực người dùng, phân quyền truy cập và giao dịch an toàn. Về bảo mật, hệ thống này cung cấp nhiều cơ chế xác thực và phân quyền, giúp bảo vệ dữ liệu người dùng và đảm bảo quyền riêng tư. Trong dự án, Supabase được sử dụng để lưu trữ dữ liệu người học, bao gồm tài khoản, lịch sử viết, lỗi, từ vựng và tiến trình học tập. Đồng thời, hệ thống xác thực và phân quyền được triển khai nhằm đảm bảo tính riêng tư, cho phép phân tách vai trò giữa người học và quản trị viên, đồng thời giới hạn quyền truy cập đối với dữ liệu nhạy cảm.
OpenAI API và các mô hình ngôn ngữ lớn (LLMs) như GPT được tích hợp để cung cấp khả năng sinh ngôn ngữ tự nhiên, sửa lỗi ngữ pháp, gợi ý nội dung, dịch thuật và tóm tắt. Các mô hình này dựa trên các nguyên lý như instruction tuning, prompt engineering và reinforcement learning from human feedback (RLHF), cho phép điều chỉnh phản hồi phù hợp với mục tiêu học tập. Trong bối cảnh dự án, LLMs đóng vai trò quan trọng trong việc sinh phản hồi tức thì cho bài viết của học viên, đề xuất cải thiện câu văn, cung cấp từ vựng thay thế, đồng thời tạo ra các chủ đề hoặc thử thách viết mới. Ngoài ra, mô hình còn được tùy chỉnh để cá nhân hóa phản hồi dựa trên lịch sử lỗi và tiến độ học tập, nhờ đó nâng cao hiệu quả của quá trình rèn luyện.
n8n là một nền tảng no-code/low-code cho phép xây dựng và tự động hóa các workflows thông qua cơ chế webhooks, APIs, triggers và nodes. Với khả năng tích hợp linh hoạt cùng nhiều dịch vụ khác nhau, n8n được sử dụng để kết nối OpenAI API với các hệ thống lưu trữ, thông báo và cơ sở dữ liệu. Trong dự án, công cụ này cho phép tự động hóa quá trình xử lý bài viết: khi học viên hoàn thành một bài viết, dữ liệu sẽ được gửi đến OpenAI API để sinh phản hồi, lưu trữ trong MongoDB và thông báo đến người học. Ngoài ra, n8n còn được khai thác để triển khai cơ chế ôn tập theo phương pháp spaced repetition, thực hiện A/B testing đối với các dạng phản hồi khác nhau nhằm đánh giá hiệu quả, và ghi nhật ký vận hành nhằm phục vụ phân tích và em ưu hệ thống trong tương lai.

---

## **5. PHÂN TÍCH  THIẾT KẾ HỆ THỐNG**

### 5.1. Phân tích vấn đề học ngôn ngữ

Quá trình học ngoại ngữ hiện nay thường gặp phải "bẫy học thụ động" (Passive Learning Trap), nơi người học tiêu thụ lượng lớn nội dung (Input) nhưng thiếu cơ hội và công cụ để sản xuất ngôn ngữ (Output). Cụ thể:

1.  **Vấn đề về trí nhớ (Forgetting Curve):** Người học thường quên từ vựng mới chỉ sau vài ngày nếu không có cơ chế ôn tập khoa học. Các ứng dụng flashcard truyền thống thường tách rời từ vựng khỏi ngữ cảnh ban đầu, khiến việc ghi nhớ trở nên máy móc và khó áp dụng.
2.  **Rào cản tâm lý (Writer's Block & Fear of Mistakes):** Khi cố gắng viết hoặc nói, người học thường sợ sai ngữ pháp hoặc bí ý tưởng. Việc thiếu phản hồi tức thì khiến họ không biết mình sai ở đâu để sửa, dẫn đến tâm lý ngại thực hành.
3.  **Thiếu môi trường thực hành (Lack of Environment):** Không phải ai cũng có điều kiện giao tiếp thường xuyên với người bản xứ. Các giải pháp tìm bạn học (language exchange) thường không ổn định và khó duy trì lâu dài.

### 5.2. Nhóm người dùng mục tiêu (personas)

Dựa trên các vấn đề trên, Write2Learn xác định 3 nhóm người dùng mục tiêu chính:

1.  **Người học thụ động (The Passive Learner):**
    *   **Đặc điểm:** Đã học tiếng Anh nhiều năm, đọc hiểu tốt nhưng không thể giao tiếp hoặc viết trôi chảy.
    *   **Nhu cầu:** Cần một môi trường an toàn để bắt đầu "output" mà không sợ bị phán xét, cần gợi ý để bắt đầu viết.
2.  **Người đi làm bận rộn (The Busy Professional):**
    *   **Đặc điểm:** Có ít thời gian, cần học tiếng Anh để phục vụ công việc (viết email, phỏng vấn).
    *   **Nhu cầu:** Cần các bài tập ngắn gọn, thực tế (Roleplay phỏng vấn, viết nhật ký công việc) và cơ chế ôn tập tối ưu thời gian (SRS).
3.  **Người ôn thi chứng chỉ (The Exam Prepper - IELTS/TOEFL):**
    *   **Đặc điểm:** Cần nâng cao vốn từ vựng và độ chính xác ngữ pháp trong thời gian ngắn.
    *   **Nhu cầu:** Cần phản hồi chi tiết về lỗi sai, gợi ý từ vựng nâng cao (paraphrasing) và theo dõi tiến độ chặt chẽ.

### 5.3. Mô hình nghiệp vụ AS-IS → TO-BE

**Mô hình hiện tại (AS-IS):**
*   **Quy trình rời rạc:** Người học viết bài trên giấy/Note -> Dùng Google Translate/Grammarly để sửa -> Tự tạo flashcard trên Anki/Quizlet để học từ.
*   **Hạn chế:** Tốn thời gian chuyển đổi giữa các công cụ, từ vựng mất ngữ cảnh, không có phản hồi về tính tự nhiên (naturalness) của câu văn.

**Mô hình đề xuất (TO-BE) với Write2Learn:**
*   **Quy trình khép kín (Integrated Loop):**
    1.  **Input/Production:** Người dùng viết Nhật ký (với Frameworks) hoặc tham gia Roleplay.
    2.  **AI Feedback:** Hệ thống phân tích và cung cấp phản hồi tức thì (Sửa lỗi, Gợi ý từ vựng, Viết lại hay hơn).
    3.  **Knowledge Capture:** Người dùng highlight từ mới/cấu trúc hay ngay trong bài sửa -> Hệ thống tự động tạo Flashcard (Mặt trước: Từ, Mặt sau: Nghĩa + Ví dụ ngữ cảnh).
    4.  **Retention:** Hệ thống SRS (FSRS algorithm) tự động nhắc nhở ôn tập đúng thời điểm "sắp quên".
*   **Giá trị:** Tiết kiệm thời gian, học từ vựng gắn liền với ngữ cảnh cá nhân, tạo động lực qua feedback tức thì.

### 5.4. Yêu cầu hệ thống

**Yêu cầu chức năng (Functional Requirements):**
1.  **Quản lý tài khoản:** Đăng ký, đăng nhập (Email/Password, OAuth), quản lý hồ sơ cá nhân.
2.  **Viết nhật ký (Journaling):**
    *   Soạn thảo văn bản với Rich Text Editor (Markdown).
    *   Sử dụng mẫu (Frameworks) có sẵn hoặc tự tạo.
    *   Nhận phản hồi AI về ngữ pháp, từ vựng và gợi ý viết lại.
3.  **Luyện vai (Roleplay):**
    *   Chat với AI theo kịch bản (Scenario) định sẵn.
    *   Hỗ trợ nhập liệu bằng giọng nói (Voice-to-Text) và phản hồi âm thanh (Text-to-Speech).
    *   Nhận đánh giá tổng quan sau khi kết thúc phiên.
4.  **Học từ vựng (Vocabulary):**
    *   Tự động tạo Flashcard từ highlight trong bài viết/roleplay.
    *   Ôn tập theo thuật toán Lặp lại ngắt quãng (FSRS).
    *   Quản lý bộ từ vựng (Vocabulary Sets).
5.  **Báo cáo (Reporting):**
    *   Theo dõi chuỗi ngày học (Streak).
    *   Thống kê hoạt động tuần, tổng số từ đã học.
    *   Phân tích lỗi ngữ pháp thường gặp.

**Yêu cầu phi chức năng (Non-functional Requirements):**
1.  **Hiệu năng:** Tải trang dưới 2s (Next.js SSR/ISR), phản hồi AI dưới 5-10s.
2.  **Khả năng mở rộng:** Hệ thống cơ sở dữ liệu (Supabase) có thể xử lý lượng lớn dữ liệu người dùng và bài viết.
3.  **Trải nghiệm người dùng (UX):** Giao diện Responsive (Mobile-first), hỗ trợ Dark Mode, tương tác mượt mà.
4.  **Bảo mật:** Dữ liệu người dùng được bảo vệ qua Row Level Security (RLS) của Supabase.

### 5.6. Use Cases & Sơ đồ use-case

**Các tác nhân (Actors):**
*   **Người học (Learner):** Người sử dụng hệ thống để học tập.
*   **Hệ thống AI (AI System):** Tác nhân phụ hỗ trợ sinh phản hồi và nội dung.

**Chi tiết Use Cases:**

**1. Nhóm chức năng Viết Nhật ký (Journaling):**
*   **UC1.1 - Quản lý Framework (Mẫu):** Người dùng có thể xem danh sách mẫu, tạo mẫu mới, chỉnh sửa hoặc ghim (pin) các mẫu yêu thích để truy cập nhanh.
*   **UC1.2 - Viết bài mới:** Người dùng soạn thảo văn bản hỗ trợ Markdown, hệ thống tự động lưu nháp (Auto-save).
*   **UC1.3 - Yêu cầu Feedback:** Gửi nội dung bài viết cho AI để nhận phân tích về ngữ pháp, từ vựng và gợi ý viết lại.
*   **UC1.4 - Tạo Flashcard từ bài viết:** Highlight các từ/cụm từ trong bài viết hoặc phần feedback để tạo nhanh thẻ từ vựng.

**2. Nhóm chức năng Luyện vai (Roleplay):**
*   **UC2.1 - Khám phá kịch bản:** Lọc kịch bản theo chủ đề (Topic) hoặc độ khó (Level).
*   **UC2.2 - Tham gia phiên chat:** Tương tác với AI qua tin nhắn văn bản hoặc giọng nói (Voice Mode).
*   **UC2.3 - Xem tổng kết phiên:** Xem lại lịch sử chat, nghe lại audio và xem đánh giá chi tiết từ AI.

**3. Nhóm chức năng Từ vựng (Vocabulary):**
*   **UC3.1 - Ôn tập (Review):** Thực hiện phiên ôn tập với thuật toán FSRS (đánh giá mức độ nhớ: Again, Hard, Good, Easy).
*   **UC3.2 - Quản lý bộ từ (Sets):** Tạo bộ từ mới, xem danh sách từ trong bộ.

**Sơ đồ Use Case chi tiết:**

```mermaid
usecaseDiagram
    actor "Learner" as U
    actor "AI Service" as AI

    package "Journaling System" {
        usecase "Chọn/Tạo Framework" as UC_Frame
        usecase "Viết bài (Markdown)" as UC_Write
        usecase "Nhận AI Feedback" as UC_Feed
        usecase "Tạo Flashcard từ Highlight" as UC_High
    }

    package "Roleplay System" {
        usecase "Lọc & Chọn Kịch bản" as UC_Scen
        usecase "Chat (Voice/Text)" as UC_Chat
        usecase "Xem Tổng kết & Feedback" as UC_Sum
    }

    package "Vocabulary System" {
        usecase "Ôn tập (FSRS)" as UC_Rev
        usecase "Quản lý Bộ từ" as UC_Set
    }

    U --> UC_Frame
    U --> UC_Write
    U --> UC_Scen
    U --> UC_Rev
    U --> UC_Set

    UC_Write ..> UC_Feed : include
    UC_Feed ..> UC_High : extend
    UC_Scen ..> UC_Chat : include
    UC_Chat ..> UC_Sum : include

    UC_Feed <.. AI : analyze
    UC_Chat <.. AI : respond
    UC_Sum <.. AI : evaluate
```

### 5.7. Kiến trúc hệ thống (System Architecture)

Hệ thống Write2Learn được xây dựng theo kiến trúc hiện đại, tận dụng sức mạnh của Serverless và AI.

**Các thành phần chính:**
1.  **Frontend (Client):** Xây dựng bằng Next.js 15 (App Router), React 19, Tailwind CSS. Chịu trách nhiệm hiển thị giao diện và xử lý tương tác người dùng.
2.  **Backend (Server Actions/API):** Sử dụng Next.js API Routes và Server Actions để xử lý logic nghiệp vụ, gọi AI service và tương tác với Database.
3.  **Database (Supabase):** PostgreSQL lưu trữ dữ liệu quan hệ (Users, Journals, Flashcards). Sử dụng pgvector (nếu cần) cho các tính năng tìm kiếm ngữ nghĩa.
4.  **AI Services:** Tích hợp OpenAI (hoặc các LLM khác) qua Webhook để xử lý ngôn ngữ tự nhiên (NLP).

**Sơ đồ Kiến trúc:**

```mermaid
graph TD
    Client[Client (Browser/Mobile)]
    
    subgraph "Next.js App Server"
        UI[UI Components]
        ServerActions[Server Actions]
        API[API Routes]
    end
    
    subgraph "External Services"
        Supabase[(Supabase DB & Auth)]
        OpenAI[AI Service (LLM)]
    end

    Client <--> UI
    UI <--> ServerActions
    UI <--> API
    
    ServerActions <--> Supabase
    API <--> Supabase
    
    ServerActions -- Webhook/API --> OpenAI
    OpenAI -- Response --> ServerActions
```

### 5.8. Sơ đồ cơ sở dữ liệu tổng thể (ERD)

```mermaid
erDiagram
    profiles ||--o{ journals : "writes"
    profiles ||--o{ sessions : "participates"
    profiles ||--o{ vocabulary_set : "owns"
    profiles ||--o{ frameworks : "creates/pins"
    
    journals ||--o{ feedbacks : "receives"
    journals ||--o{ journal_tag : "has"
    
    roleplays ||--o{ sessions : "instantiates"
    sessions ||--o{ feedbacks : "receives"
    
    feedbacks ||--o{ feedback_grammar_items : "contains"
    
    vocabulary_set ||--o{ vocabulary : "contains"
    vocabulary ||--|| vocabulary_status : "tracks"
    vocabulary ||--o{ fsrs_review_logs : "logs"
    
   
### 5.9. Danh sách bảng dữ liệu (toàn bộ)

#### 1. profiles (Hồ sơ người dùng)
| Tên thuộc tính | Loại dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | uuid | Khóa chính (Primary Key) |
| `name` | text | Tên hiển thị |
| `english_level` | text | Trình độ tiếng Anh (Beginner, Intermediate, Advanced) |
| `onboarding_completed` | boolean | Trạng thái hoàn thành onboarding |
| `updated_at` | timestamp | Thời gian cập nhật cuối cùng |
| `daily_review_goal` | integer | Mục tiêu review từ vựng hàng ngày |
| `daily_roleplay_goal` | smallint | Mục tiêu roleplay hàng ngày |
| `daily_journal_goal` | smallint | Mục tiêu viết nhật ký hàng ngày |
| `daily_vocab_goal` | smallint | Mục tiêu học từ mới hàng ngày |

#### 2. journals (Nhật ký)
| Tên thuộc tính | Loại dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | uuid | Khóa chính |
| `user_id` | uuid | Khóa ngoại (FK) tham chiếu profiles |
| `content` | text | Nội dung nhật ký (Markdown) |
| `journal_date` | date | Ngày viết nhật ký |
| `title` | text | Tiêu đề bài viết |
| `enhanced_version` | text | Phiên bản đã được AI cải thiện |
| `summary` | text | Tóm tắt nội dung |
| `is_draft` | boolean | Trạng thái nháp |
| `created_at` | timestamp | Thời gian tạo |

#### 3. frameworks (Mẫu nhật ký)
| Tên thuộc tính | Loại dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `name` | text | Tên mẫu |
| `content` | text | Nội dung/Câu hỏi gợi ý |
| `category` | text | Danh mục |
| `description` | text | Mô tả ngắn |
| `source` | text | Nguồn gốc |
| `cover_image` | text | Ảnh bìa |
| `is_default` | boolean | Mẫu mặc định của hệ thống |
| `profile_id` | uuid | Người tạo (nếu là mẫu cá nhân) |
| `is_pinned` | boolean | Trạng thái ghim |

#### 4. roleplays (Kịch bản Roleplay)
| Tên thuộc tính | Loại dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | uuid | Khóa chính |
| `name` | text | Tên kịch bản |
| `context` | text | Ngữ cảnh tình huống |
| `starter_message` | text | Tin nhắn mở đầu của AI |
| `task` | text | Nhiệm vụ của người học |
| `level` | text | Độ khó |
| `topic` | text | Chủ đề |
| `ai_role` | text | Vai trò của AI |
| `partner_prompt` | text | Prompt hướng dẫn cho AI |
| `image` | text | Ảnh minh họa |

#### 5. sessions (Phiên Roleplay)
| Tên thuộc tính | Loại dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `session_id` | uuid | Khóa chính |
| `profile_id` | uuid | Khóa ngoại tham chiếu profiles |
| `roleplay_id` | uuid | Khóa ngoại tham chiếu roleplays |
| `conversation_json` | jsonb | Lịch sử hội thoại |
| `feedback` | text | Phản hồi tổng quan của AI |
| `highlights` | ARRAY | Danh sách từ vựng được highlight |
| `pinned` | boolean | Trạng thái ghim phiên |
| `created_at` | timestamp | Thời gian tạo |

#### 6. vocabulary_set (Bộ từ vựng)
| Tên thuộc tính | Loại dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | uuid | Khóa chính |
| `profile_id` | uuid | Khóa ngoại tham chiếu profiles |
| `title` | text | Tên bộ từ |
| `description` | text | Mô tả |
| `is_default` | boolean | Bộ mặc định |
| `is_starred` | boolean | Đánh dấu yêu thích |
| `created_at` | timestamp | Thời gian tạo |

#### 7. vocabulary (Từ vựng)
| Tên thuộc tính | Loại dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | uuid | Khóa chính |
| `set_id` | uuid | Khóa ngoại tham chiếu vocabulary_set |
| `word` | text | Từ/Cụm từ |
| `meaning` | text | Nghĩa/Định nghĩa |
| `example` | text | Câu ví dụ |
| `source_id` | uuid | Nguồn gốc (Journal/Roleplay ID) |
| `is_starred` | boolean | Đánh dấu yêu thích |
| `created_at` | timestamp | Thời gian tạo |

#### 8. vocabulary_status (Trạng thái học FSRS)
| Tên thuộc tính | Loại dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | uuid | Khóa chính |
| `vocabulary_id` | uuid | Khóa ngoại tham chiếu vocabulary |
| `state` | text | Trạng thái (New, Learning, Review, Relearning) |
| `stability` | double | Độ ổn định (FSRS) |
| `difficulty` | double | Độ khó (FSRS) |
| `elapsed_days` | integer | Số ngày từ lần ôn cuối |
| `scheduled_days` | integer | Số ngày hẹn ôn tiếp theo |
| `next_review_at` | timestamp | Thời gian ôn tập tiếp theo |
| `last_review_at` | timestamp | Thời gian ôn tập gần nhất |

#### 9. fsrs_review_logs (Lịch sử ôn tập)
| Tên thuộc tính | Loại dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | uuid | Khóa chính |
| `card_id` | uuid | Khóa ngoại tham chiếu vocabulary |
| `rating` | text | Đánh giá (Again, Hard, Good, Easy) |
| `state` | text | Trạng thái thẻ khi ôn |
| `review_date` | timestamp | Thời gian ôn |
| `stability_before` | double | Độ ổn định trước khi ôn |
| `difficulty_before` | double | Độ khó trước khi ôn |

#### 10. feedbacks (Phản hồi AI)
| Tên thuộc tính | Loại dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | uuid | Khóa chính |
| `profile_id` | uuid | Khóa ngoại tham chiếu profiles |
| `source_type` | text | Loại nguồn (journal/roleplay) |
| `source_id` | uuid | ID nguồn |
| `vocabulary_feedback` | text | Phản hồi về từ vựng |
| `clarity_feedback` | text | Phản hồi về sự rõ ràng |
| `ideas_feedback` | text | Phản hồi về ý tưởng |
| `enhanced_version` | text | Phiên bản cải thiện |
| `summary` | text | Tóm tắt |
| `fixed_typo` | text | Sửa lỗi chính tả |

#### 11. feedback_grammar_items (Chi tiết lỗi ngữ pháp)
| Tên thuộc tính | Loại dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | uuid | Khóa chính |
| `feedback_id` | uuid | Khóa ngoại tham chiếu feedbacks |
| `grammar_topic_id` | text | Mã chủ đề ngữ pháp |
| `description` | text | Mô tả lỗi |
| `tags` | ARRAY | Thẻ phân loại |

#### 12. learning_events (Sự kiện học tập)
| Tên thuộc tính | Loại dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `id` | uuid | Khóa chính |
| `profile_id` | uuid | Khóa ngoại tham chiếu profiles |
| `event_type` | text | Loại sự kiện (journal, roleplay, review) |
| `reference_id` | uuid | ID tham chiếu |
| `metadata` | jsonb | Dữ liệu bổ sung |
| `created_at` | timestamp | Thời gian diễn ra |

#### 13. learning_progress (Tiến độ học tập)
| Tên thuộc tính | Loại dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `profile_id` | uuid | Khóa chính (FK profiles) |
| `total_words_learned` | integer | Tổng số từ đã học |
| `total_journals_completed` | integer | Tổng số nhật ký đã viết |
| `streak_days` | integer | Chuỗi ngày học liên tiếp |
| `last_update` | timestamp | Thời gian cập nhật cuối |


* Giải thích quan hệ giữa các bảng
* Triết lý thiết kế dữ liệu (normalized / optimized for learning)

---

## **7. ĐẶC TẢ CHI TIẾT TÍNH NĂNG(FEATURE-LEVEL DESIGN)**

> Phần này **không lặp lại bảng dữ liệu** — chỉ tham chiếu bảng ở Chương 6.

### 7.1. Nhóm tính năng: Viết nhật ký (nhật ký, frameworks)
* Mục tiêu
* Userstories and aceptance criteria
* Flowchart and sequence diagram
* Giao diện
* Các bảng dữ liệu sử dụng (tham chiếu)

### 7.2.  Nhóm tính năng: Luyện phản xạ qua tình huống (roleplay)

### 7.3.  Nhóm tính năng Từ vựng

### 7.4. Tính năng 4: Báo cáo (report)



---

## **8. TRIỂN KHAI HỆ THỐNG (IMPLEMENTATION)**


### 8.2. Công nghệ và cấu trúc code


---

## **9. ĐÁNH GIÁ (EVALUATION)**


### 9.3. Kiểm thử khả dụng (Usability Testing)

### 9.4. Kết quả khảo sát người dùng



### 9.6. Hạn chế hệ thống

---


---

## **11. KẾT LUẬN & KIẾN NGHỊ**

### 11.1. Kết luận chung

### 11.2. Những điểm đạt được

### 11.3. Hướng phát triển tương lai

---

## **12. TÀI LIỆU THAM KHẢO**

## **13. PHỤ LỤC**

* Toàn bộ UI
* ERD full-size
* Bảng khảo sát
* Checklist test
* Mô tả chi tiết API (nếu cần)
* Backlog / Sprint plan
