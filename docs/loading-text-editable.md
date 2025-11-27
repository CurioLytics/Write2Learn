# Loading Text - Editable (Vietnamese & English)

## Overview
This document contains all loading text used in the Write2Learn application in both Vietnamese and English. These texts can be edited and used for translation or UI updates.

---

## Vietnamese Loading Text

### 1. General Processing/Loading

| Vietnamese | Location | Context |
|-----------|----------|---------|
| `Đang xử lý...` | Auth form, Reset password, Journal feedback | Processing action in progress |
| `Đang tải...` | Profile page | General loading |
| `Chờ xíu...` | Vocabulary starred words | Please wait |
| `Chờ xíu nhé` | Vocabulary set detail page | Wait a moment (friendly) |
| `Đang chuẩn bị...` | Various | Preparing/Getting ready |

### 2. Authentication & Account

| Vietnamese | Location | Context |
|-----------|----------|---------|
| `Đang xử lý...` | Auth form (login/signup) | Processing authentication |
| `Đang kết nối...` | OAuth buttons (Google login) | Connecting to provider |
| `Đang gửi...` | Forgot password, Resend verification | Sending email |
| `Đang cập nhật...` | Reset password | Updating password |

### 3. Journal Operations

| Vietnamese | Location | Context |
|-----------|----------|---------||
| `Đang tìm từ đến hạn` | Home page (journal section) | Loading vocabulary cards |
| `Đang check độ rõ ràng` | Journal feedback page | Checking clarity |
| `Đang check từ vựng` | Journal feedback page | Checking vocabulary |
| `Đang check ngữ pháp` | Journal feedback page | Checking grammar |
| `Đang gợi ý ý tưởng` | Journal feedback page | Suggesting ideas |
| `Đang tạo bản đề xuất` | Journal feedback page | Creating enhanced version |
| `Đang tạo flashcards cho bạn` | Journal feedback save | Creating flashcards from highlights |

### 4. Vocabulary Operations

| Vietnamese | Location | Context |
|-----------|----------|---------|
| `Đang tải từ vựng...` | Vocabulary set detail | Loading vocabulary words |
| `Đang tìm thẻ...` | Vocabulary review page | Finding flashcards |
| `Đang lưu...` | Vocab create/edit, Profile save | Saving data |
| `Đang chuẩn bị flashcards...` | Flashcard generation page | Preparing flashcards |
| `Chờ xíu...` | Vocabulary page (starred words) | Loading starred words |

### 5. Roleplay Operations

| Vietnamese | Location | Context |
|-----------|----------|---------||
| `Đang tải hội thoại...` | Roleplay session, Summary page | Loading conversation |
| `Đang xử lý đoạn nổi bật...` | Roleplay summary | Processing highlights |
| `Đang tạo flashcards cho bạn` | Roleplay summary | Creating flashcards |

### 6. Exercise/Practice Operations

| Vietnamese | Location | Context |
|-----------|----------|---------||
| `Đang tạo bài cho {topic}` | Practice dialog | Generating exercises for topic |
| `Xem được bao nhiêu điểm nào...` | Practice dialog | Grading exercises |

### 7. Additional Context Text

| Vietnamese | Location | Context |
|-----------|----------|---------||
| `Đang check độ rõ ràng` | Roleplay summary, Journal feedback | Checking clarity |
| `Đang check từ vựng` | Roleplay summary, Journal feedback | Checking vocabulary |
| `Đang check ngữ pháp` | Roleplay summary, Journal feedback | Checking grammar |
| `Đang gợi ý ý tưởng` | Roleplay summary, Journal feedback | Suggesting ideas |
| `Đang tạo bản đề xuất` | Roleplay summary, Journal feedback | Creating enhanced version |

---

## English Loading Text (DEPRECATED - Now using Vietnamese)

### 1. General Loading (OLD - Now Vietnamese)

| English (OLD) | Vietnamese (NEW) | Location | Context |
|---------------|------------------|----------|---------|
| `Loading...` | `Đang tải...` | Default message, Various components | Generic loading state |
| `Loading templates...` | `Đang tải...` | Template selection, Template collection | Loading journal templates |
| `Loading tags...` | `Đang tải tags...` | Journal actions menu | Loading tag list |
| `Loading activity data...` | `Đang tải dữ liệu hoạt động...` | Weekly activity chart | Loading analytics |
| `No activity data available` | `Không có dữ liệu hoạt động` | Weekly activity chart | No data state |
| `Loading error analysis...` | `Đang tải phân tích lỗi...` | Grammar error chart | Loading error data |
| `No grammar errors found!` | `Không có lỗi ngữ pháp!` | Grammar error chart | No errors state |
| `Keep up the great work!` | `Bạn làm rất tốt!` | Grammar error chart | Encouragement message |
| `Loading goals...` | `Đang tải mục tiêu...` | Daily goal card | Loading goal progress |

### 2. Authentication (Now in Vietnamese)

| Vietnamese | Location | Context |
|---------|----------|---------|
| `Đang gửi...` | Email verification step | Sending verification email |
| `Nhấn để gửi lại` | Resend button | Click to resend |
| `Đã gửi email xác thực thành công!` | Success message | Email sent successfully |
| `Gửi lại thất bại. Vui lòng thử lại.` | Error message | Resend failed |

### 3. BreathingLoader Specific (Now in Vietnamese)

| Vietnamese | Location | Context |
|---------|----------|---------|
| `hít vào` | BreathingLoader component | Animation text (inhale) |
| `thở ra` | BreathingLoader component | Animation text (exhale) |
| `trân trọng từng khoảnh khắc` | BreathingLoader component | Footer inspiration text |

### 4. Component Default Messages (Now in Vietnamese)

| Vietnamese | Location | Context |
|---------|----------|---------|
| `Đang tải...` | BreathingLoader default | Default breathing loader message |
| `Đang tải...` | LoadingState default | Default loading state message |
| `Có lỗi xảy ra` | ErrorState title | Error occurred |
| `Thử lại` | ErrorState button | Try again button |

---

## Loading States by Feature

### Authentication Flow
```
Sign In/Sign Up → "Đang xử lý..."
Google Login → "Đang kết nối..."
Forgot Password → "Đang gửi..."
Reset Password → "Đang cập nhật..."
Resend Email → "Đang gửi..." / "Nhấn để gửi lại"
Email Sent Success → "Đã gửi email xác thực thành công!"
Email Failed → "Gửi lại thất bại. Vui lòng thử lại."
```

### Journal Flow
```
Loading List → Spinner only (no text)
Loading Templates → "Đang tải..."
Loading Tags → "Đang tải tags..."
Checking Clarity → "Đang check độ rõ ràng"
Checking Vocabulary → "Đang check từ vựng"
Checking Grammar → "Đang check ngữ pháp"
Suggesting Ideas → "Đang gợi ý ý tưởng"
Creating Enhanced Version → "Đang tạo bản đề xuất"
Creating Flashcards → "Đang tạo flashcards cho bạn"
Saving → "Đang lưu..."
```

### Vocabulary Flow
```
Loading Sets → Spinner only (no text)
Loading Words → "Đang tải từ vựng..."
Loading Starred → "Chờ xíu..."
Finding Due Cards → "Đang tìm từ đến hạn"
Saving Set → "Đang lưu..."
Preparing Flashcards → "Đang chuẩn bị flashcards..."
```

### Roleplay Flow
```
Loading Session → "Đang tải hội thoại..."
Processing Summary → "Đang xử lý đoạn nổi bật..."
Checking Clarity → "Đang check độ rõ ràng"
Checking Vocabulary → "Đang check từ vựng"
Checking Grammar → "Đang check ngữ pháp"
Suggesting Ideas → "Đang gợi ý ý tưởng"
Creating Enhanced Version → "Đang tạo bản đề xuất"
Creating Flashcards → "Đang tạo flashcards cho bạn"
```

### Exercise/Practice Flow
```
Generating Exercises → "Đang tạo bài cho {topic}" (rotates between topics)
Grading Answers → "Xem được bao nhiêu điểm nào..."
```

### Analytics/Dashboard Flow
```
Loading Activity → "Đang tải dữ liệu hoạt động..."
No Activity Data → "Không có dữ liệu hoạt động"
Loading Errors → "Đang tải phân tích lỗi..."
No Grammar Errors → "Không có lỗi ngữ pháp!" / "Bạn làm rất tốt!"
Loading Goals → "Đang tải mục tiêu..."
Loading Calendar → Spinner only (no text)
```

---

## Friendly/Playful Variations

These are special loading texts that add personality to the app:

| Vietnamese | English Equivalent | Usage Context |
|-----------|-------------------|---------------|
| `Chờ xíu...` | "Wait a sec..." | Quick, casual wait |
| `Chờ xíu nhé` | "Wait a moment (friendly)" | Longer wait, friendly tone |
| `Đang tạo flashcards cho bạn` | "Creating flashcards for you" | Flashcard generation (friendly) |
| `Xem được bao nhiêu điểm nào...` | "Let's see how many points..." | Exercise grading (playful) |
| `Đang tạo bài cho {topic}` | "Creating exercises for {topic}" | Exercise generation with topic rotation |

---

## Loading Text Translation Pairs

For easy reference when translating:

| Vietnamese | English |
|-----------|---------|
| Đang xử lý... | Processing... |
| Đang tải... | Loading... |
| Đang lưu... | Saving... |
| Đang gửi... | Sending... |
| Đang cập nhật... | Updating... |
| Đang kết nối... | Connecting... |
| Đang tải từ vựng... | Loading vocabulary... |
| Đang tìm thẻ... | Finding cards... |
| Đang tải hội thoại... | Loading conversation... |
| Đang xử lý đoạn nổi bật... | Processing highlights... |
| Đang kiểm tra... | Checking... |
| Đang chấm... | Grading... |
| Đang chuẩn bị phản hồi... | Preparing feedback... |
| Đang chuẩn bị flashcards... | Preparing flashcards... |
| Đang tạo flashcards cho bạn | Creating flashcards for you |
| Đang tìm từ đến hạn | Finding due cards |
| Đang check độ rõ ràng | Checking clarity |
| Đang check từ vựng | Checking vocabulary |
| Đang check ngữ pháp | Checking grammar |
| Đang gợi ý ý tưởng | Suggesting ideas |
| Đang tạo bản đề xuất | Creating enhanced version |
| Đang tạo bài cho {topic} | Creating exercises for {topic} |
| Xem được bao nhiêu điểm nào... | Let's see how many points... |
| Chờ xíu... | Wait a sec... |
| Chờ xíu nhé | Wait a moment... |
| hít vào | breath in |
| thở ra | breath out |
| trân trọng từng khoảnh khắc | appreciate each moment |
| Đang tải tags... | Loading tags... |
| Đang tải dữ liệu hoạt động... | Loading activity data... |
| Không có dữ liệu hoạt động | No activity data available |
| Đang tải phân tích lỗi... | Loading error analysis... |
| Không có lỗi ngữ pháp! | No grammar errors found! |
| Bạn làm rất tốt! | Keep up the great work! |
| Đang tải mục tiêu... | Loading goals... |
| Có lỗi xảy ra | Something went wrong |
| Thử lại | Try Again |
| Nhấn để gửi lại | Click here to resend |
| Đã gửi email xác thực thành công! | Verification email sent successfully! |
| Gửi lại thất bại. Vui lòng thử lại. | Failed to resend email. Please try again. |

---

## Spinner-Only (No Text) Locations

These locations use visual spinners without accompanying text:

1. **Journal List Page** - Main journal list loading
2. **Vocabulary Hub** - Flashcard sets loading
3. **Roleplay Scenarios** - Scenario cards loading (skeleton)
4. **Home Page Dashboard** - Initial page load (BreathingLoader)
5. **Report/Analytics Calendar** - Calendar data loading
6. **Error Analysis Card** - Chart data loading
7. **Session History** - Roleplay history loading
8. **Chat Interface** - Message sending (button disabled only)

---

## Button Loading States

Buttons with loading states typically show:

**Pattern:**
```tsx
{isLoading ? 'Loading Text' : 'Default Text'}
```

**Examples:**
- Login: `{loading ? 'Đang xử lý...' : 'Đăng nhập'}`
- Save: `{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}`
- Send: `{isLoading ? 'Đang gửi...' : 'Gửi'}`
- Connect: `{isLoading ? 'Đang kết nối...' : 'Tiếp tục với Google'}`

---

## Special Loading Components

### BreathingLoader
**Files:** `components/ui/breathing-loader.tsx`

**Default Props:**
- `message`: "Đang tải..." (previously "Loading...")
- `bubbleColor`: "bg-primary/20"
- `textColor`: "text-primary"

**Built-in Text:**
- Animation states: "hít vào" / "thở ra" (previously "breath in" / "breath out")
- Footer: "trân trọng từng khoảnh khắc" (previously "appreciate each moment")

### LoadingState
**Files:** `components/ui/common/state-components.tsx` & `components/journal/state-components.tsx`

**Default Props:**
- `message`: "Đang tải..." (previously "Loading templates...")

### ErrorState
**Files:** `components/ui/common/state-components.tsx` & `components/journal/state-components.tsx`

**Text:**
- Title: "Có lỗi xảy ra" (previously "Something went wrong")
- Button: "Thử lại" (previously "Try Again")

---

## Notes for Translators

1. **Ellipsis (...) is consistent** across all loading messages in both languages
2. **Vietnamese uses "Đang"** (present continuous) for most active processes
3. **Friendly variations** like "Chờ xíu nhé" add personality - maintain tone when translating
4. **Playful metaphor** in "Đang cook bài tập" is intentional - consider cultural adaptation
5. **Some spinners have no text** - visual indication only
6. **BreathingLoader** has built-in English meditation text that may need localization

---

## Usage Statistics

- **Total unique Vietnamese loading messages:** 35+
- **Total unique English loading messages (deprecated):** 0 (All converted to Vietnamese)
- **Locations using text + spinner:** ~35
- **Locations using spinner only:** ~15
- **Components with customizable loading text:** 2 (BreathingLoader, LoadingState)

---

## Recent Changes (November 27, 2025)

### ✅ Completed Conversion to Vietnamese

All loading text has been converted from English to Vietnamese:

1. **BreathingLoader Component**
   - Message: "Loading..." → "Đang tải..."
   - Animation: "breath in/out" → "hít vào/thở ra"
   - Footer: "appreciate each moment" → "trân trọng từng khoảnh khắc"

2. **LoadingState & ErrorState Components**
   - Default message: "Loading templates..." → "Đang tải..."
   - Error title: "Something went wrong" → "Có lỗi xảy ra"
   - Error button: "Try Again" → "Thử lại"

3. **Verification Step**
   - Button: "Sending..." → "Đang gửi..."
   - Button default: "Click here to resend" → "Nhấn để gửi lại"
   - Success: "Verification email sent successfully!" → "Đã gửi email xác thực thành công!"
   - Error: "Failed to resend email..." → "Gửi lại thất bại. Vui lòng thử lại."

4. **Dashboard Components**
   - Activity loading: "Loading activity data..." → "Đang tải dữ liệu hoạt động..."
   - Activity empty: "No activity data available" → "Không có dữ liệu hoạt động"
   - Error loading: "Loading error analysis..." → "Đang tải phân tích lỗi..."
   - No errors: "No grammar errors found!" → "Không có lỗi ngữ pháp!"
   - Encouragement: "Keep up the great work!" → "Bạn làm rất tốt!"
   - Goals loading: "Loading goals..." → "Đang tải mục tiêu..."

5. **Journal Components**
   - Tags loading: "Loading tags..." → "Đang tải tags..."

### Files Modified

- `components/ui/breathing-loader.tsx`
- `components/ui/common/state-components.tsx`
- `components/auth/verification-step.tsx`
- `components/journal/state-components.tsx`
- `components/journal/journal-actions-menu.tsx`
- `components/dashboard/weekly-activity-chart.tsx`
- `components/dashboard/grammar-error-chart.tsx`
- `components/dashboard/daily-goal-card.tsx`

---

*Last Updated: November 27, 2025*
*Source: Write2Learn v1.0 Codebase*
*Status: All loading text converted to Vietnamese ✅*
