# COMPREHENSIVE SOFTWARE DEVELOPMENT BUNDLE (PAWDAR PROJECT RULES)
*Applies to all 3 platforms: Mobile (Flutter), Web (Next.js), and Backend*

---

## 📌 PART I: COMMON RULES

### 1. Language & Communication Standards
*   **User Communication:** All explanations, discussions, plans, and guidelines sent to the user **must be written in clear, structured, and technically precise Vietnamese**. Avoid overusing English unless referring to specific technical terms that cannot be translated.
*   **Git Commit Messages:** All commit messages **must be written in English**.
*   **Source Code & Comments:**
    *   All source code must be written in English (variables, functions, classes, files, etc.).
    *   All comments in code (including `TODO`, `FIXME` tags) **must be entirely in English**. No Vietnamese inside the source code.

### 2. Workflow Orchestration
*   **Plan First:** For any non-trivial task (3+ steps or involving architectural decisions), **you must create a plan before taking action**.
    *   Write a detailed implementation plan in `tasks/todo.md` with clear checklists.
    *   Confirm the plan before starting the implementation.
    *   Track progress using `[ ]` (not started), `[/]` (in progress), and `[x]` (completed) directly inside the file.
*   **Autonomous Bug Fixing:** When given a bug report, proactively analyze logs, trace errors, find root causes, and resolve them. Do not ask the user for step-by-step guidance.
*   **Self-Improvement Loop:** After any correction or feedback from the user, immediately update lessons learned in `tasks/lessons.md` to prevent repeating the same mistake.
*   **Demand Elegance & Senior Standards:**
    *   Always strive for the most minimal changes to avoid introducing unexpected bugs.
    *   If a fix feels hacky, pause and design a clean, elegant, and optimal solution matching Senior Developer standards.
*   **Verification Before Done:** Never mark a task as complete without verifying it works (run tests, check logs, run the dev build) to prove correctness.

---

## 📱 PART II: FLUTTER MOBILE RULES

### 1. Routing & Transitions
*   **Route Definition:** Always use `_buildSlideRoute` when defining new routes in `AppRouter` (`lib/core/config/routes/routes.dart`). Avoid using default `MaterialPageRoute` unless explicitly requested for system-level modals.
*   **Navigation:** **Must always** use `NavigationUtils` (`pushNamed`, `pushReplacementNamed`, `pop`) for all navigation to ensure smooth transitions by automatically dismissing the keyboard.
*   **Navigator.pop:** Whenever handling a form submission or action that leads to a navigation pop, always call `FocusManager.instance.primaryFocus?.unfocus()` with a small delay (e.g., `Future.delayed(const Duration(milliseconds: 100))`) before `Navigator.pop()` to prevent keyboard flicker/jank.

### 2. UI & Responsiveness
*   **Auto Dismiss Keyboard:** Any page containing input fields (`TextField`, `FormField`) or pickers must be wrapped in a `GestureDetector` with `onTap: () => FocusScope.of(context).unfocus()` to ensure the keyboard or picker is dismissed when tapping outside.
*   **ScreenUtil:** Always use `.w`, `.h`, and `.sp` for all sizes, margins, padding, and font sizes to ensure responsiveness across all screen sizes.
*   **Theme & Typography:**
    *   Always use brand colors from `AppColors`.
    *   Always use `Theme.of(context).textTheme` for ALL text styles.
    *   *Note:* Do not override `fontSize` when styling UI (only `fontWeight` modifications are permitted). Any font size adjustments should be handled within the centralized theme initialization.
*   **Layout & Padding:** All pages must use `SingleChildScrollView` to prevent layout overflow issues (e.g., when the keyboard appears). Maintain consistent horizontal padding (e.g., `20.w`) across all pages.
*   **Loading States:** Always use Shimmer (Skeleton) effects instead of default `CircularProgressIndicator` when displaying data loading states.

### 3. Architecture & Code Organization
*   **Feature-Based Structure:** Place pages and business logic in `lib/features/[feature_name]/presentation/pages/`.
*   **Common Libraries:** Consolidate frequently used package imports inside `lib/common_libs.dart`.
*   **Constants:** Store all reusable strings (routes, assets path, API URLs) in `lib/common/constants/`.

### 4. Coding Standards
*   Keep `main.dart` as minimal as possible.
*   Use the `equatable` package for models and states to optimize object comparisons.
*   Use `logger` for debugging instead of `print()`.
*   **Event Handlers:** All functionality (navigation, form submission, etc.) must be defined in separate named methods (e.g., `_onLoginPressed`, `_navigateToProfile`) instead of being written as inline functions within `onTap` or `onPressed` properties.
*   **SnackBars & Dialogs:** **Must always** use `CustomSnackBar.show` for displaying notifications (success, error, warning, info) and `CustomDialog.show` with the appropriate `DialogType`. Do not use default `ScaffoldMessenger` or `showDialog`.

### 5. API Development Flow
Every new API implementation must follow the established "Auth Flow" pattern:
1.  **Models:** Create request/response models using `freezed` and `json_serializable`.
2.  **API Service:** Create remote data source returning `Future<Either<ErrorResponse, T>>`, using `DioClient` via Service Locator (`sl`). Must wrap inside a `try-catch` block catching `DioException` and check status codes (`200` or `201`) before parsing JSON.
3.  **Repository:**
    *   Define the interface in the domain layer (`lib/features/[feature]/domain/repository/`).
    *   Implement it in the data layer (`lib/features/[feature]/data/repository/`).
    *   Must use Service Locator `sl` to access dependencies (e.g., `_apiService = sl<AuthApiService>()`) instead of Constructor Injection.
4.  **UseCases:** Create single-purpose UseCase classes for each API action under `lib/features/[feature]/domain/usecases/`.
5.  **BLoC/Cubit:**
    *   Manage state using Cubit. Separate Cubit and State into two distinct files (e.g., `auth_cubit.dart` and `auth_state.dart`).
    *   **Asynchronous Safety:** Always check `if (isClosed) return;` before calling `emit()` in async methods to avoid "Cannot emit new states after calling close" errors.

---

## 🌐 PART III: NEXT.JS/REACT WEB RULES

### 1. Light/Dark Theme Setup
*   **Mandatory Configuration:** Every web project must centralize Light/Dark theme toggling from the beginning.
*   **Implementation:**
    *   Use a global `ThemeProvider` to manage theme states and synchronize them with the HTML class (or `data-theme` attribute).
    *   Provide an easily accessible `ThemeToggle` button on the header or sidebar.
    *   Sync colors dynamically via Tailwind CSS variables (or standard CSS variables) for smooth transition effects.

### 2. 3-Layer Clean Architecture & App Router Composition
Source code must be strictly organized into layers under `src/`:
*   **Domain Layer (`src/domain`):**
    *   `src/domain/entities`: Contains pure data definitions (Entities/Types).
    *   `src/domain/repositories`: Contains Interfaces for Repositories (e.g., `AuthRepository`).
    *   `src/domain/usecases`: Contains single-purpose Use Case classes.
    *   *Rule:* Independent of network libraries, frameworks, or external APIs.
*   **Application Layer (`src/application`):**
    *   `src/application/dto`: Contains Data Transfer Objects for data serialization/transmission.
    *   `src/application/mappers`: Contains mappers to map data between layers.
    *   `src/application/services`: Contains intermediate services coordinating data flow.
*   **Infrastructure Layer (`src/infrastructure`):**
    *   `src/infrastructure/repositories`: Implements Repository Interfaces from the Domain layer (e.g., `RtkAuthRepository`).
    *   `src/infrastructure/rtk` or similar: Sets up global state (Redux Toolkit/Zustand) and API configuration.
    *   `src/infrastructure/http`: Base HTTP client wrappers (Axios/Fetch).
    *   `src/infrastructure/api`: Declares endpoints and handles system API integrations.
*   **Presentation Layer (`src/presentation`):**
    *   UI components and view-only logic:
        *   `pages/`: Contains major page-level components (typically using `"use client"`).
        *   `components/`: Contains smaller reusable UI components.
        *   `hooks/`: Custom hooks for UI logic or global state interactions (e.g., `useAuthState`).
        *   `providers/`: Contains wrapper configurations (`ThemeProvider`, `ReduxProvider`, `QueryClientProvider`, etc.).
*   **Thin Entrypoint App Router (`src/app`):**
    *   **Rule:** Files named `page.tsx` under `src/app` must be extremely thin. Their sole purpose is to parse server-side parameters (`searchParams`, `params`) and pass them directly to the corresponding Page Component of the Presentation layer. No UI logic or direct API queries are allowed here.

### 3. State Management & Data Fetching
*   **Global State:** Use Redux Toolkit or Zustand as the single source of truth for application state.
*   **API Queries:** Fetch data using libraries with built-in caching (RTK Query / React Query).
*   **Repository Pattern:** All API calls must be wrapped inside Repository implementations to decouple the UI from the network client.
*   **Error Handling:** Use centralized helpers to parse API errors into unified domain-specific errors.

### 4. UI & Styling Standards
*   **Tailwind CSS:** Use Tailwind for styling. Declare variables for colors and effects in the global stylesheet and apply them uniformly via utility classes.
*   **Design Tokens & Font Consistency:** Any new UI components or pages created **must** strictly adhere to the established "Honey Oak & Sweet Cream" wood theme CSS variables defined in `globals.css` (e.g. `var(--primary)`, `var(--background)`, `var(--foreground)`, `var(--border)`, `var(--success)`) and **must** use the configured `Merriweather` serif font (`var(--font-merriweather)`). Do **not** hardcode arbitrary color hexes, default Tailwind colors (e.g. indigo, blue, emerald), or default Geist/sans-serif fonts, to prevent style and font mismatches.
*   **i18n (Multi-Language):** Never hardcode strings directly in the UI. Use locales files and import translations dynamically via the localization hook.
*   **Form Validation:** Use React Hook Form with Zod (or equivalent schemas) for robust input validation and clean error styling.
*   **Section Layout Standard:** Any section created in the layout must use the standard Tailwind `container` utility class with appropriate padding (e.g., `container mx-auto px-4` or `px-6`) to keep the content aligned, unified, and fully responsive.
*   **Card & Shadow Standards:** All cards must strictly adhere to the predefined shadow styles defined in the global design token/theme settings. Do not apply arbitrary, inline shadow values.
*   **Comprehensive Responsive Optimization:** When adding any new UI component, it must be thoroughly optimized, clean, and responsive across all three layout form factors: Mobile, Tablet, and Web. Use Tailwind breakpoints carefully to ensure layout perfection without overflow on any screen resolution.
*   **Interactive Pointer & Text Selection:** Any clickable or interactive element (buttons, links, toggles, tabs, icons, and custom interactive nodes) **must** have the `cursor-pointer` utility class applied to ensure a clear visual affordance. Additionally, all created UI elements (headers, layout containers, cards, icons, list items, and interactive nodes) **must** utilize the `select-none` class to ensure a high-end, native-like user experience by preventing accidental text highlight selections during interactions.

---

## 🖥️ PART IV: BACKEND API & SERVICES RULES

### 1. Clean Architecture for Backend
Backend code must follow clean layered architecture to ensure maintainability:
*   **Controller / Route Handler Layer:** Receives HTTP requests, performs basic schema validation, forwards them to the appropriate UseCase, and formats JSON responses. Do not write business logic here.
*   **UseCase / Service Layer (Core Business Logic):** Houses the core business rules. Completely decoupled from transport protocols (HTTP/gRPC); processes input and calls repositories for data persistence.
*   **Repository Layer (Data Access):** The only layer interacting directly with databases (ORM, SQL queries, Redis, etc.). Defines pure CRUD operations.

### 2. API Design Standards
*   **RESTful Standards:** API must follow HTTP methods:
    *   `GET` for retrieving data.
    *   `POST` for creation.
    *   `PUT`/`PATCH` for updates.
    *   `DELETE` for deleting data.
*   **Unified Response Format:** All API responses must follow a standardized JSON structure:
    *   *Success:* `{ "success": true, "data": ... }`
    *   *Failure:* `{ "success": false, "error": { "code": "ERROR_CODE", "message": "Detailed message", "details": ... } }`
*   **Pagination & Filters:** All listing APIs (`GET`) must support pagination (`page`, `limit`) and basic search filters to prevent memory exhaustion and optimize bandwidth.
*   **Data Validation:** Client-sent data must be strictly validated using Schema Validation (e.g., Class-Validator, Zod, Joi) before entering business logic layers.

### 3. Authentication & Security
*   **Authentication:** Use secure JWT tokens. Configure short-lived Access Tokens and store long-lived Refresh Tokens in HTTP-only cookies.
*   **Authorization (RBAC/ABAC):** Protect API endpoints with Role-based / Permission-based Access Control middlewares.
*   **System Protection:**
    *   Configure Rate Limiting to prevent brute-force/DDoS attacks.
    *   Enforce CORS configurations to only allow whitelisted domains (like the frontend domain).
    *   **Environment Variables:** Never hardcode passwords, secret keys, or DB connections. Retrieve all configurations securely from environment variables (`.env`).

### 4. Database & Migrations
*   **No Direct DDL on Production:** Never modify schemas directly in the production database. All schema changes must be driven through database migration files.
*   **Query Optimization:**
    *   Use indexes appropriately on fields frequently used in filters (`WHERE`), sorting, or joins.
    *   Avoid N+1 queries by leveraging eager loading/populate methods when fetching relational data.

### 5. Error Handling & Structured Logging
*   **Centralized Error Handling:** Implement global error handler middlewares to catch all unhandled exceptions. Never leak server internal details or stack traces to the client (respond with HTTP 500 and a generic message, and write details to internal logs).
*   **Structured Logging:** Write logs in structured JSON format (using libraries like Winston, Pino, or Zap) categorized clearly by log levels (`INFO`, `WARN`, `ERROR`).
