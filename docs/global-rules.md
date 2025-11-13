

# 🧱 Code Structure & Modularity
- Be simplistic, minimal style, never create something that is not given. Never add sample/ placeholder data unless explicitly requested.
- **Never create a file longer than 300 lines of code.** Refactor into modules or helpers when needed.  
- **Organize code by feature or responsibility**, separating components, stores, services, and utilities clearly.  
- **Follow Tailwind conventions for CSS**: use utility-first classes in components; avoid inline `<style>` blocks unless necessary.  
- **always read file** data_structure.md  for database schema and relationships before creating services or data access layers.
- Always has navigation (turn back) to previous page.
- **Directory guidance** (example for webapp):  
/app
/app/features/components 
/components
/stores # state management
/utils
/app/globals

## 🔌 API Organization & Separation of Concerns

### `/app/api/` - HTTP Layer (Next.js API Routes)
- **Purpose**: Handle HTTP requests/responses only
- **Responsibilities**: 
  - Authentication and authorization
  - Request/response validation
  - Error handling and status codes  
  - Calling business logic services
- **Pattern**: Always thin wrappers that delegate to services
- **Structure**: Follow Next.js App Router convention with `route.ts` files

```typescript
// ✅ Good API route - thin wrapper
export async function POST(request: Request) {
  try {
    const user = await authenticateUser();
    const data = await parseRequestBody(request);
    const result = await someService.doBusinessLogic(user.id, data);
    return createSuccessResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
```

### `/services/` - Business Logic Layer
- **Purpose**: Contains reusable business logic and data operations
- **Responsibilities**:
  - Database operations and queries
  - Data transformation and validation
  - Core business rules and workflows
  - External API integrations
- **Pattern**: Framework-agnostic service classes
- **Naming**: Use `-service.ts` suffix (e.g., `user-service.ts`, `journal-service.ts`)

```typescript
// ✅ Good service - pure business logic
class UserService {
  async updateProfile(userId: string, data: ProfileData) {
    // Business logic, validation, database operations
    return result;
  }
}
```

### `/utils/api-helpers.ts` - Shared HTTP Utilities
- Common functions for API routes: `authenticateUser()`, `handleApiError()`, `parseRequestBody()`
- Reusable response creators and error handlers
- Authentication and validation helpers

### Key Rules:
1. **API routes MUST NOT contain business logic** - delegate to services
2. **Services MUST NOT handle HTTP concerns** - stay framework-agnostic  
3. **No circular dependencies** - services can call other services, but not API routes
4. **Consistent error handling** - use standard helpers across all routes
5. **Services are testable in isolation** - no HTTP dependencies


# 🧠 AI Behavior Rules
- **Never assume missing context. Ask questions if uncertain.**  
- Research the database structure before creating services or data access layers. (thru supabase)
- **Never hallucinate libraries, components, or functions** – only use verified packages for Nextjs + Supabase + Tailwind.  
- **Confirm file paths and module names exist** before referencing them.  
- **Follow project styling conventions** in all generated code (Tailwind classes, component patterns, consistent naming).  
- **When generating files**, respect modular boundaries: separate components, pages, services, styles, appropriately.
- **Short and concise code, no mock up data unless specified.**