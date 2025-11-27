# Loading States Inventory - Write2Learn App

This document catalogs all loading states, loading indicators, and loading text used throughout the Write2Learn application.

## Table of Contents
1. [Loading Components](#loading-components)
2. [Authentication Loading States](#authentication-loading-states)
3. [Journal Loading States](#journal-loading-states)
4. [Vocabulary Loading States](#vocabulary-loading-states)
5. [Roleplay Loading States](#roleplay-loading-states)
6. [Dashboard/Analytics Loading States](#dashboardanalytics-loading-states)
7. [Profile/Account Loading States](#profileaccount-loading-states)
8. [Feedback Loading States](#feedback-loading-states)
9. [Onboarding Loading States](#onboarding-loading-states)

---

## Loading Components

### BreathingLoader Component
**File:** `components/ui/breathing-loader.tsx`

**Description:** A calming breathing animation loader with expandable/contractable bubble

**Props:**
- `message` (string): Custom message (default: "Loading...")
- `className` (string): Additional CSS classes
- `bubbleColor` (string): Bubble color override (default: "bg-primary/20")
- `textColor` (string): Text color override (default: "text-primary")

**Visual Elements:**
- Animated breathing bubble (24px-96px)
- Text alternates: "breath in" / "breath out"
- Footer text: "appreciate each moment"

**Usage Examples:**
- Journal feedback loading
- Flashcard generation
- General page transitions

---

### LoadingState Component
**Files:** 
- `components/ui/common/state-components.tsx`
- `components/journal/state-components.tsx`

**Description:** Dual spinning circles loader

**Props:**
- `message` (string): Custom message (default: "Loading templates...")

**Visual Elements:**
- Two spinning circles (16w/16h) with border-2
- Primary color circle + faded reverse spinning circle
- Animation: 1s and 1.5s reverse

---

### Spinner Variations

#### 1. Loader2 Icon (lucide-react)
**Visual:** Icon with `animate-spin` class
**Sizes:** w-4 h-4, w-6 h-6
**Common usage:** Button loading states

#### 2. Custom CSS Spinner
**Visual:** `<div className="animate-spin rounded-full h-{size} w-{size} border-b-2 border-{color}"></div>`
**Sizes:** h-5 w-5, h-6 w-6, h-8 w-8, h-12 w-12, h-16 w-16, h-32 w-32
**Colors:** border-blue-500, border-primary, border-gray-400, border-blue-600

#### 3. Skeleton Loading
**Visual:** `bg-gray-200 animate-pulse`
**Usage:** Placeholder cards (h-40 w-64)

---

## Authentication Loading States

### Auth Form (Sign In/Sign Up)
**File:** `components/auth/auth-form.tsx`

**State:** `loading` (boolean)

**Loading Text:**
- Vietnamese: `"Đang xử lý..."`
- Default: `"Đăng nhập"` or `"Đăng ký"`

**Visual:** Button disabled state

---

### OAuth Buttons (Google Login)
**File:** `components/auth/oauth-buttons.tsx`

**State:** `isLoading` (boolean)

**Loading Text:**
- Vietnamese: `"Đang kết nối..."`
- Default: `"Tiếp tục với Google"`

**Visual:** Custom spinner (w-5 h-5 border-2 border-gray-300 border-t-blue-500)

---

### Email Verification Step
**File:** `components/auth/verification-step.tsx`

**State:** `isLoading` (boolean)

**Loading Text:**
- Loading: `"Sending..."`
- Default: `"Click here to resend"`

**Visual:** Button disabled state

---

### Forgot Password
**File:** `app/auth/forgot-password/page.tsx`

**State:** `loading` (boolean)

**Loading Text:**
- Loading: `"Đang gửi..."`
- Default: `"Gửi link đặt lại mật khẩu"`

---

### Reset Password
**File:** `app/auth/reset-password/page.tsx`

**State:** `loading` (boolean)

**Loading Text:**
- Loading: `"Đang cập nhật..."`
- Default: `"Đổi mật khẩu"`

---

### User Profile Display
**File:** `components/layout/user-profile-display.tsx`

**State:** `loading` (boolean) from useAuth hook

**Loading Text:**
- Loading: `"Loading..."`
- Default: User display name

---

## Journal Loading States

### Journal List Page
**File:** `app/journal/page.tsx`

**State:** `isLoading` (boolean)

**Loading Text:** None (just spinner)

**Visual:** Custom spinner (h-8 w-8 border-b-2 border-blue-500)

---

### Journal Stats Display
**File:** `components/journal/journal-stats.tsx` & `components/features/journal/stats/journal-stats.tsx`

**State:** `isLoading` (boolean prop)

**Loading Text:** None

**Visual:** Skeleton cards

---

### Template Cards
**File:** `components/journal/template-cards.tsx`

**State:** `isLoading` (boolean)

**Loading Text:** None

**Visual:** LoadingState component with default message

---

### Template Selection
**Files:** 
- `components/journal/template-selection.tsx`
- `components/features/journal/templates/template-selection.tsx`

**State:** `isLoading` (boolean)

**Loading Text:** `"Loading templates..."`

**Visual:** LoadingState component

---

### Template Collection
**Files:** 
- `components/journal/template-collection.tsx`
- `components/features/journal/templates/template-collection.tsx`

**State:** `isLoading` (boolean)

**Loading Text:** `"Loading templates..."`

**Visual:** LoadingState component

---

### Journal Actions Menu (Tags)
**File:** `components/journal/journal-actions-menu.tsx`

**State:** `isLoadingTags` (boolean)

**Loading Text:** `"Loading tags..."`

**Visual:** Text only

---

### Explore Frameworks
**File:** `components/journal/explore-frameworks.tsx`

**State:** `loading` (boolean)

**Loading Text:** None

**Visual:** Custom spinner (h-8 w-8 border-b-2 border-blue-500)

---

### Journal Feedback Page
**File:** `app/journal/feedback/page.tsx`

**State:** Various loading states

**Loading Text:**
- With highlights: `"Đang tạo flashcard từ phần đánh dấu..."`
- Processing: `"Đang xử lý..."`
- Default: `"Đang chuẩn bị phản hồi..."`

**Visual:** BreathingLoader component

---

### Journal Editor Layout (Save Button)
**File:** `components/journal/journal-editor-layout.tsx`

**State:** `isSaving` (boolean prop)

**Loading Text:** None (icon only)

**Visual:** Loader2 icon (h-4 w-4 animate-spin)

---

### Journal Templates Page
**File:** `app/journal/templates/page.tsx`

**Loading Text:** None

**Visual:** Custom spinner (h-12 w-12 border-b-2 border-primary)

---

## Vocabulary Loading States

### Vocabulary Hub Page
**File:** `app/vocab/page.tsx`

**States:**
- `isLoadingFlashcards` (boolean)
- `isLoadingStarredWords` (boolean)

**Loading Text:** None

**Visual:** 
- FlashcardSetList component receives `isLoading` prop
- Custom loading indicator for starred words

---

### Flashcard Set List
**File:** `app/vocab/components/vocab_list/flashcard-set-list.tsx`

**State:** `isLoading` (boolean prop)

**Loading Text:** None

**Visual:** Skeleton cards (key: `skeleton-${index}`)

---

### Vocabulary Set Detail Page
**File:** `app/vocab/[setId]/page.tsx`

**States:**
- `authLoading` (boolean)
- `isLoading` (boolean)
- `isSaving` (boolean)

**Loading Text:**
- Auth loading: `"Chờ xíu nhé"`
- Data loading: `"Đang tải từ vựng..."`
- Saving: `"Đang lưu..."`
- Default save: `"Lưu thay đổi"`

**Visual:** Text-based loading indicators

---

### Vocabulary Review Page
**File:** `app/vocab/[setId]/review/page.tsx`

**State:** `isLoading` (boolean)

**Loading Text:** `"Đang tìm thẻ..."`

**Visual:** Centered text loading state

---

### Vocabulary Create Page
**File:** `app/vocab/create/page.tsx`

**State:** `isLoading` (boolean)

**Loading Text:**
- Loading: `"Đang lưu..."`
- Default: `"Lưu bộ từ vựng"`

---

## Roleplay Loading States

### Roleplay Scenarios (Home Page)
**File:** `app/home/page.tsx`

**State:** `loading` (boolean)

**Loading Text:** None

**Visual:** Skeleton cards (h-40 w-64 bg-gray-200 animate-pulse)

---

### Session History
**File:** `components/roleplay/session-history.tsx`

**State:** `loading` (boolean)

**Loading Text:** None

**Visual:** Custom spinner (h-8 w-8 border-b-2 border-[var(--primary)])

---

### Chat Interface
**File:** `components/roleplay/chat-interface.tsx`

**State:** `isLoading` (boolean)

**Loading Text:** None (visual indicator only)

**Visual:** Button disabled states

---

### Scenario Filter
**File:** `components/roleplay/scenario-filter.tsx`

**State:** `loading` (boolean) from useRoleplayTopics hook

**Loading Text:** None

**Visual:** Skeleton items (key: `loading-${i}`)

---

### Roleplay Summary Page
**File:** `app/roleplay/summary/[sessionId]/page.tsx`

**States:**
- `loading` (boolean)
- `processing` (boolean)
- `retrying` (boolean)

**Loading Text:**
- Processing: `"Đang xử lý các đoạn nổi bật..."`
- Loading: `"Đang tải phiên hội thoại..."`
- Retrying: `"Đang kiểm tra {loadingSteps[loadingStep]}"`

**Visual:** Custom spinner (h-12 w-12 border-b-2 border-[var(--primary)])

---

## Dashboard/Analytics Loading States

### Home Page Dashboard
**File:** `app/home/page.tsx`

**States:**
- `isLoading` (boolean)
- `isSubmitting` (boolean)

**Loading Text:** None

**Visual:** 
- Skeleton cards for scenarios
- BreathingLoader for initial page load

---

### Report/Analytics Page
**File:** `app/report/page.tsx`

**States:**
- `isLoading` (boolean) from useAnalytics hook
- `isLoadingCalendar` (boolean)

**Loading Text:** None

**Visual:** 
- Loading skeletons for charts
- Custom spinner for calendar (h-6 w-6 border-b-2 border-blue-600)

---

### Weekly Activity Chart
**File:** `components/dashboard/weekly-activity-chart.tsx`

**State:** `isLoading` (boolean prop)

**Loading Text:** `"Loading activity data..."`

**Visual:** Text-based loading state

---

### Grammar Error Chart
**File:** `components/dashboard/grammar-error-chart.tsx`

**State:** `isLoading` (boolean prop)

**Loading Text:** `"Loading error analysis..."`

**Visual:** Text-based loading in Card component (h-80)

---

### Daily Goal Card
**File:** `components/dashboard/daily-goal-card.tsx`

**State:** `isLoading` (boolean prop)

**Loading Text:** `"Loading goals..."`

**Visual:** Text-based loading state

---

### Error Analysis Card
**File:** `app/report/components/ErrorAnalysisCard.tsx`

**State:** Implicit loading state

**Loading Text:** None

**Visual:** Custom spinner (h-5 w-5 border-b-2 border-gray-400)

---

### Practice Dialog (Exercises)
**File:** `app/report/components/PracticeDialog.tsx`

**States:**
- `isLoading` (boolean)
- `isGrading` (boolean)

**Loading Text:**
- Loading exercises: `"Đang cook bài tập cho bạn"`
- Grading: `"Đang chấm..."`

**Visual:** Loader2 icon (w-6 h-6 animate-spin, w-4 h-4 for button)

---

## Profile/Account Loading States

### Profile Page
**File:** `app/profile/page.tsx`

**States:**
- `loading` (boolean) from useAuth hook
- `isLoading` (boolean) for save operation

**Loading Text:**
- Saving: `"Đang lưu..."`
- Default: `"Lưu thay đổi"`

**Visual:** Custom spinner (h-32 w-32 border-b-2 border-primary)

---

### Account Page
**File:** `app/account/page.tsx`

**State:** Implicit loading state

**Loading Text:** None

**Visual:** Custom spinner (h-32 w-32 border-b-2 border-primary)

---

## Feedback Loading States

### Floating Feedback Button
**File:** `components/layout/floating-feedback-button.tsx`

**State:** `isSubmitting` (boolean)

**Loading Text:** None (spinner only)

**Visual:** Custom spinner (w-4 h-4 border-2 border-white border-t-transparent)

---

## Onboarding Loading States

### Onboarding Page
**File:** `app/onboarding/page.tsx`

**State:** `isSubmitting` (boolean)

**Loading Text:**
- Submitting: `"Đang lưu..."`
- Last step: `"Hoàn tất"`
- Default: `"Tiếp tục"`

**Visual:** Custom spinner (h-16 w-16 border-b-4 border-blue-600)

---

## Flashcard Loading States

### Flashcard Generation Page
**File:** `app/flashcards/generate/page.tsx`

**States:**
- `isLoading` (boolean)
- `isSaving` (boolean)

**Loading Text:**
- Loading: `"Đang chuẩn bị flashcards..."`
- Saving: `"Đang lưu..."`
- Default save: `"Lưu vào bộ từ vựng"` or `"Chọn bộ từ vựng"`

**Visual:** BreathingLoader component

---

### Flashcard Page (General)
**File:** `app/flashcards/page.tsx`

**Loading Text:** None

**Visual:** BreathingLoader component

---

## Hooks with Loading States

### useAuth Hook
**File:** `hooks/auth/use-auth.ts`

**Return:** `loading` (boolean)

---

### useAnalytics Hook
**File:** `hooks/dashboard/useAnalytics.ts`

**Return:** `isLoading` (boolean)

---

### useDashboardData Hook
**File:** `hooks/dashboard/use-dashboard-data.ts`

**Return:** 
- `loading` (DashboardLoadingState object with multiple loading flags)
- `isLoading` (boolean - combined loading state)

---

### useCachedFetch Hook
**File:** `hooks/common/use-cached-fetch.ts`

**Return:** `loading` (boolean)

---

### useRoleplayTopics Hook
**File:** `hooks/roleplay/use-roleplay-topics.ts`

**Return:** `loading` (boolean)

---

### useRoleplayScenarios Hook
**File:** `hooks/roleplay/use-roleplay-scenarios.ts`

**Return:** `loading` (boolean)

---

## Stores with Loading States

### User Profile Store
**File:** `stores/user-profile-store.ts`

**State:** `isLoading` (boolean)

---

### User Provider Context
**File:** `components/providers/user-provider.tsx`

**Context Value:** `isLoadingProfile` (boolean)

---

## Summary Statistics

### Total Loading State Variables
- **Boolean loading states:** ~50+
- **Unique loading messages (Vietnamese):** 20+
- **Unique loading messages (English):** 15+
- **Loading component types:** 4 (BreathingLoader, LoadingState, Loader2, Custom Spinner)

### Most Common Loading Patterns

1. **Button Loading State:**
   ```tsx
   {isLoading ? 'Đang xử lý...' : 'Action Text'}
   ```

2. **Page Loading State:**
   ```tsx
   if (isLoading) {
     return <div>Loading message...</div>
   }
   ```

3. **Spinner Pattern:**
   ```tsx
   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
   ```

4. **Breathing Loader:**
   ```tsx
   <BreathingLoader message="Custom message..." />
   ```

### Vietnamese Loading Messages

1. `"Đang xử lý..."` - Processing
2. `"Đang kết nối..."` - Connecting
3. `"Đang lưu..."` - Saving
4. `"Đang gửi..."` - Sending
5. `"Đang cập nhật..."` - Updating
6. `"Đang tải từ vựng..."` - Loading vocabulary
7. `"Đang tìm thẻ..."` - Finding cards
8. `"Đang cook bài tập cho bạn"` - Cooking exercises for you
9. `"Đang chấm..."` - Grading
10. `"Đang tạo flashcard từ phần đánh dấu..."` - Creating flashcards from highlights
11. `"Đang chuẩn bị phản hồi..."` - Preparing feedback
12. `"Đang chuẩn bị flashcards..."` - Preparing flashcards
13. `"Đang xử lý các đoạn nổi bật..."` - Processing highlights
14. `"Đang tải phiên hội thoại..."` - Loading conversation session
15. `"Đang kiểm tra..."` - Checking
16. `"Chờ xíu nhé"` - Wait a moment

### English Loading Messages

1. `"Loading..."` (default)
2. `"Loading templates..."`
3. `"Loading tags..."`
4. `"Loading activity data..."`
5. `"Loading error analysis..."`
6. `"Loading goals..."`
7. `"Sending..."`
8. `"breath in"` / `"breath out"` (BreathingLoader)
9. `"appreciate each moment"` (BreathingLoader)

---

## Loading Component Props Reference

### BreathingLoader
```typescript
interface BreathingLoaderProps {
  message?: string;        // Default: 'Loading...'
  className?: string;
  bubbleColor?: string;    // Default: 'bg-primary/20'
  textColor?: string;      // Default: 'text-primary'
}
```

### LoadingState
```typescript
interface LoadingStateProps {
  message?: string;        // Default: 'Loading templates...'
}
```

---

## File Locations Summary

### Components
- `components/ui/breathing-loader.tsx`
- `components/ui/common/state-components.tsx`
- `components/journal/state-components.tsx`
- `components/auth/auth-form.tsx`
- `components/auth/oauth-buttons.tsx`
- `components/auth/verification-step.tsx`
- `components/auth/logo-image.tsx`
- `components/dashboard/weekly-activity-chart.tsx`
- `components/dashboard/grammar-error-chart.tsx`
- `components/dashboard/daily-goal-card.tsx`
- `components/journal/*` (multiple files)
- `components/roleplay/*` (multiple files)
- `components/layout/floating-feedback-button.tsx`
- `components/layout/user-profile-display.tsx`

### Pages
- `app/auth/*` (forgot-password, reset-password)
- `app/home/page.tsx`
- `app/journal/page.tsx`
- `app/journal/feedback/page.tsx`
- `app/vocab/page.tsx`
- `app/vocab/[setId]/page.tsx`
- `app/vocab/[setId]/review/page.tsx`
- `app/vocab/create/page.tsx`
- `app/roleplay/summary/[sessionId]/page.tsx`
- `app/report/page.tsx`
- `app/report/components/PracticeDialog.tsx`
- `app/profile/page.tsx`
- `app/account/page.tsx`
- `app/onboarding/page.tsx`
- `app/flashcards/generate/page.tsx`

### Hooks
- `hooks/auth/use-auth.ts`
- `hooks/dashboard/useAnalytics.ts`
- `hooks/dashboard/use-dashboard-data.ts`
- `hooks/common/use-cached-fetch.ts`
- `hooks/roleplay/use-roleplay-topics.ts`
- `hooks/roleplay/use-roleplay-scenarios.ts`

### Stores
- `stores/user-profile-store.ts`

---

*Last Updated: November 27, 2025*
