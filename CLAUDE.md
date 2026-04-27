# OKR-KPI System FE — Code Style Guide

## 1) Tech Stack & Scope
- **React + Vite** (JS/JSX, no TypeScript).
- **React Router DOM**, **TanStack React Query**, **Zustand**.
- **Tailwind CSS** for UI.
- **Axios** for HTTP client (`src/utils/axios.js`).

**Goal:** Write **consistent, readable, and maintainable** code, prioritizing the existing style used in the current project.

---

## 2) General Rules
- Favor **clarity** over "brevity."
- Never hardcode API URLs; always use `axiosClient` and environment configurations.
- No dead code or unused imports.
- All asynchronous flows must handle **success/error** states explicitly.
- When modifying files, **preserve the existing style** (indentation, quote style) to ensure clean Git diffs.

---

## 3) Naming Conventions
- **Components:** `PascalCase` (e.g., `ManageCompanyModal`, `LoginForm`).
- **Hooks:** `camelCase` with a `use` prefix (e.g., `useTheme`, `useAuthStore`).
- **Service functions:** `camelCase`, following the pattern `action + domain` (e.g., `getCompanies`, `createCompanyAdmin`).
- **Boolean variables:** Prefix with `is/has/can` (e.g., `isLoading`, `isPending`, `hasError`).
- **Constants:** `UPPER_SNAKE_CASE` for shared constants (e.g., `MOCK_NOTIFICATIONS`).

---

## 4) React Component Structure
**Recommended Order:**
1. Imports
2. Constants/small helpers (if specific to the file)
3. Main Component
4. Handlers / Queries / Mutations
5. JSX return
6. Default export

**Conventions:**
- Use **functional components + hooks**.
- Use **props destructuring** directly in the function parameters.
- Avoid creating complex inline functions within JSX if the logic is lengthy.

---

## 5) React Query Conventions
- `queryKey` must be stable with clear parameters (e.g., `['companyAdmins', company.id]`).
- Use `enabled` for queries that depend on IDs or specific conditions.
- Set `retry: false` for authentication flows or specific APIs that require manual redirect control.
- **After successful mutation:** Use `queryClient.invalidateQueries(...)` with the correct key.
- Provide clear UI **loading states** (`isLoading`, `isPending`) and disable actions during submission.

---

## 6) Service Layer (`src/services/*`)
- One service file per domain (e.g., `company.js`, `adminCompany.js`, `auth.js`).
- Each function should return `response.data`.
- Write concise but sufficient **JSDoc**:
    - Function purpose
    - Main parameters
    - Primary response type
- Use `FormData` and `multipart/form-data` for file uploads when required by the endpoint.

**Naming Patterns:**
- `get*` -> GET
- `create*` -> POST
- `update*` -> PUT/PATCH
- `delete*` / `deactivate*` -> DELETE

---

## 7) Auth & Routing Conventions
- **Login Routes:**
    - Admin: `/admin/login`
    - Company: `/:company_slug/login`
- When context-based redirection is needed, prioritize reading `company_slug` from `useParams()`.
- `ProtectedRoute` must verify the refresh token/session before rendering protected content.
- Fallback to `/admin/login` if the `company_slug` cannot be determined.

---

## 8) Zustand Conventions
- The Store should only hold state that needs to be **shared app-wide**.
- Actions within the store must be pure with descriptive names (e.g., `setTheme`, `toggleTheme`, `clearAuth`).
- If manually syncing with `localStorage`, persist only the strictly necessary keys.

---

## 9) Tailwind & UI Conventions
- Use existing **design tokens**: `bg-background`, `text-text`, `text-secondary`, `bg-primary`, etc.
- Organize classes into readable groups: **Layout -> Spacing -> Color -> State**.
- Interactive buttons must include:
    - `hover` state
    - `disabled` state (for async operations)
    - `cursor-pointer` for clickable elements
- **Standard Modal Structure:**
    - Overlay: `fixed inset-0`
    - Container: `rounded`, `shadow`, `max-w-*`
    - Distinct separation between Header, Body, and Footer.

---

## 10) Error Handling & UX
- Do not swallow errors silently unless intentional.
- Display user-friendly **toast messages**:
    - Success: `toast.success(...)`
    - Failure: `toast.error(error.response?.data?.error?.message || 'Fallback message')`
- **For Forms:**
    - Perform basic validation before submission.
    - Disable inputs/buttons during pending states.
    - Include a loading indicator for actions taking > ~300ms.

---

## 11) Import Ordering
**Prioritize the following order:**
1. React / Core libraries
2. Third-party libraries
3. Internal Hooks / Store
4. Services
5. Components within the same module
6. Styles / Assets

Keep imports clean; do not leave unused imports (enforced by ESLint `no-unused-vars`).

---

## 12) Comments & Language
- Comments should be brief and explain the **"why,"** rather than describing obvious code logic.
- You may use either **Vietnamese or English**, but remain consistent within the same file.
- Avoid outdated comments; update related comments whenever code is modified.