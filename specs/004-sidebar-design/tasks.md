---

description: "Tasks for implementing sidebar navigation and design language update"
---

# Tasks: 004-sidebar-design - Sidebar Navigation with Design Language Update

**Input**: Design documents from `/specs/004-sidebar-design/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests & Evidence**: Follow the Right-Sized Tests principle. Each user story includes minimal automated tests or manual smoke checks for risky flows (navigation, unread-only behavior, responsive layout, and visual design). No release runbooks are required. All scenarios must preserve the Unread-Only Focus principle—ensure read articles never reappear in unread views and are evicted from cache/state when marked as read.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, US4) from spec.md
- Every task includes exact file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm dependencies and baseline project setup for this feature.

- [X] T001 Ensure framer-motion dependency is declared in package.json under dependencies for sidebar animations in package.json
- [X] T002 Verify Tailwind and PostCSS configs are present and usable for design tokens in tailwind.config.js and postcss.config.js
- [X] T003 [P] Run formatting, linting, and typecheck scripts to confirm baseline passes before feature work in package.json scripts (npm run format, npm run lint:fix, npm run typecheck)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core shared infrastructure that MUST be complete before any user story work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Define shared sidebar types (Folder, SidebarState, FolderFilter) in src/types/sidebar.ts
- [X] T005 Create design tokens file for dark theme colors, spacing, and radii, and import it into global styles in src/styles/tokens.css and src/styles/globals.css
- [X] T006 Extend Tailwind theme to reference CSS variables for sidebar-related colors (bg-primary, bg-surface, primary, text colors) in tailwind.config.js
- [X] T007 Implement SSR-safe sidebar visibility hook using localStorage for mobile open/closed state in src/hooks/useSidebarState.ts
- [X] T008 Implement SidebarContext provider exposing isOpen, toggle, and close for mobile sidebar state in src/components/Sidebar/SidebarContext.tsx
- [X] T009 Wire SidebarProvider into the root layout so all timeline pages can access sidebar state in src/app/layout.tsx
- [X] T010 [P] Ensure existing timeline page exports folder data needed by Sidebar (or can consume it via props/context) in src/app/timeline/page.tsx

**Checkpoint**: Foundational layer ready—user story implementation can now begin.

---

## Phase 3: User Story 1 - Navigate Between Folders via Sidebar (Priority: P1) 🎯 MVP

**Goal**: Allow users to view all folders with unread articles in a permanent sidebar and switch between them with a single click, updating the main content to show the selected folder’s articles.

**Independent Test**: With multiple folders containing unread articles, clicking any folder name in the sidebar updates the main content to that folder’s articles, highlights the active folder, and automatically selects the first folder with unread items on initial load.

### Tests & Checks for User Story 1 (Right-Sized)

- [X] T011 [P] [US1] Add unit tests covering initial folder selection logic and folder click navigation in tests/unit/components/Sidebar.navigation.test.tsx
- [X] T012 [P] [US1] Add E2E test verifying sidebar-driven folder switching without page reload in tests/e2e/sidebar-navigation.spec.ts
- [X] T048 [P] [US1] Add E2E test verifying that marking individual articles as read preserves the current folder view and that marking all articles in a folder as read automatically navigates to the next folder with unread articles (when available) in tests/e2e/sidebar-navigation.spec.ts

### Implementation for User Story 1

- [X] T013 [US1] Create Sidebar container component that renders navigation structure and accepts folders and selectedFolderId props in src/components/Sidebar/Sidebar.tsx
- [X] T014 [P] [US1] Implement FolderList component that renders a vertical list of folders and delegates selection to a callback in src/components/Sidebar/FolderList.tsx
- [X] T015 [P] [US1] Implement FolderItem component that displays folder name and selected styling, and invokes onClick with folder id in src/components/Sidebar/FolderItem.tsx
- [X] T016 [US1] Apply client-side filtering to only pass folders with unreadCount > 0 into FolderList in src/components/Sidebar/Sidebar.tsx
- [X] T017 [US1] Wire Sidebar into the timeline layout so selecting a folder updates the visible articles without full page reload in src/app/timeline/page.tsx
- [X] T018 [US1] Ensure Sidebar highlights the active folder based on current route or selectedFolderId in src/components/Sidebar/FolderItem.tsx
- [X] T019 [US1] Make Sidebar scrollable when folder list exceeds viewport height while keeping any fixed navigation controls accessible in src/components/Sidebar/Sidebar.tsx
- [X] T049 [US1] Implement mark-as-read behavior so individual mark-read actions do not change the selected folder, and a mark-all-read action navigates to the next folder with unread articles (if any) without showing a separate all-read page in src/app/timeline/page.tsx

**Checkpoint**: User Story 1 fully functional and testable independently (desktop navigation only).

---

## Phase 4: User Story 2 - Visual Feedback for Folder Status (Priority: P2)

**Goal**: Provide visual feedback for which folders have unread articles and how many, so users can prioritize reading.

**Independent Test**: With folders having varying unread counts, each visible folder shows a circular unread badge on the right, badges disappear when counts reach zero, and folders remain ordered by existing queue priority.

### Tests & Checks for User Story 2 (Right-Sized)

- [X] T020 [P] [US2] Add unit tests for unread badge rendering and 0/99+ formatting logic in tests/unit/components/Sidebar.unreadBadge.test.tsx
- [X] T021 [P] [US2] Extend navigation unit tests to cover hiding folders with unreadCount === 0 from the sidebar list and asserting folders are removed once all their articles are marked read in tests/unit/components/Sidebar.navigation.test.tsx

### Implementation for User Story 2

- [X] T022 [P] [US2] Implement UnreadBadge component to render circular badge with primary blue background and white text in src/components/Sidebar/UnreadBadge.tsx
- [X] T023 [US2] Integrate UnreadBadge into FolderItem aligned to the right edge of each folder row in src/components/Sidebar/FolderItem.tsx
- [X] T024 [US2] Update FolderList rendering logic to ensure folders are ordered by existing queue priority from folder data in src/components/Sidebar/FolderList.tsx
- [X] T025 [US2] Ensure unread counts update in real time when articles are marked read or new articles arrive using existing timeline state in src/app/timeline/page.tsx
- [X] T026 [US2] Add tooltip support for truncated folder names so full names are visible on hover in src/components/Sidebar/FolderItem.tsx

**Checkpoint**: User Story 2 independently verifies unread-only visibility and badge feedback while building on User Story 1.

---

## Phase 5: User Story 3 - Responsive Sidebar Behavior (Priority: P3)

**Goal**: Provide a collapsible mobile sidebar that preserves full folder navigation while maximizing content space on small screens.

**Independent Test**: On viewports below 768px, the sidebar is hidden by default and replaced by a hamburger button in the top-left; tapping the button opens the sidebar over content with a semi-transparent dimming overlay, and tapping on the dimmed area or on a folder closes it. Resizing back to desktop shows the sidebar permanently.

### Tests & Checks for User Story 3 (Right-Sized)

- [ ] T027 [P] [US3] Add E2E tests covering mobile open/close behavior, including tapping outside to close and auto-close on folder select in tests/e2e/sidebar-mobile.spec.ts
- [ ] T028 [P] [US3] Add E2E tests validating responsive behavior across breakpoints (mobile <768px, tablet 768-1024px, desktop ≥768px) in tests/e2e/sidebar-responsive.spec.ts

### Implementation for User Story 3

- [ ] T029 [P] [US3] Implement MobileToggle (hamburger) button positioned in the top-left of the header that calls SidebarContext.toggle in src/components/Sidebar/MobileToggle.tsx
- [ ] T030 [US3] Connect MobileToggle into the header or layout so it appears only on small viewports using responsive classes in src/app/layout.tsx
- [ ] T031 [US3] Implement a mobile sidebar presentation using framer-motion to slide in/out from the left with ≤200ms animation, coordinated with showing/hiding the dimming overlay in src/components/Sidebar/Sidebar.tsx
- [ ] T032 [US3] Implement a semi-transparent dimming overlay behind the sidebar that covers the rest of the content and closes the sidebar when tapped on mobile in src/components/Sidebar/Overlay.tsx
- [ ] T033 [US3] Ensure sidebar automatically closes on mobile after a folder is selected while keeping the selected folder’s articles visible in src/components/Sidebar/Sidebar.tsx
- [ ] T034 [US3] Ensure sidebar is always visible on desktop (ignoring isOpen) and transitions correctly when resizing between mobile and desktop breakpoints in src/components/Sidebar/Sidebar.tsx
- [ ] T035 [US3] Add Escape key handler to close the sidebar on mobile while preserving normal keyboard navigation in src/components/Sidebar/Sidebar.tsx

**Checkpoint**: User Story 3 complete—sidebar responsive behavior validated independently on small screens.

---

## Phase 6: User Story 4 - Updated Visual Design Language (Priority: P2)

**Goal**: Apply a modern dark-theme visual design across the sidebar and related timeline UI, including colors, spacing, typography, and interaction states.

**Independent Test**: With the new tokens applied, all pages use the dark color palette, consistent spacing and border radii, and smooth interactions that match the reference design while passing WCAG 2.1 AA contrast checks.

### Tests & Checks for User Story 4 (Right-Sized)

- [ ] T036 [P] [US4] Add or update Playwright visual regression tests capturing desktop and mobile sidebar states, including hover/focus states, in tests/e2e/sidebar-visual.spec.ts
- [ ] T037 [P] [US4] Run accessibility checks (axe or similar) for color contrast and keyboard navigation on timeline + sidebar pages and capture issues list in tests/e2e/accessibility/sidebar-accessibility.spec.ts

### Implementation for User Story 4

- [ ] T038 [P] [US4] Apply dark theme tokens to sidebar background, surface areas, text, and borders using CSS variables in src/styles/tokens.css
- [ ] T039 [US4] Update Sidebar, FolderList, and FolderItem components to use Tailwind classes wired to the new design tokens for colors, spacing, and radii in src/components/Sidebar/Sidebar.tsx and src/components/Sidebar/FolderList.tsx and src/components/Sidebar/FolderItem.tsx
- [ ] T040 [US4] Update article list and cards in the main timeline view to use consistent dark-theme tokens and spacing in src/app/timeline/page.tsx
- [ ] T041 [US4] Implement consistent hover and focus treatments for sidebar items and primary buttons using outline and background styles in src/components/Sidebar/FolderItem.tsx and src/styles/sidebar.css
- [ ] T042 [US4] Ensure typography scale and font stack match specification for body, headings, and captions in src/styles/globals.css

**Checkpoint**: User Story 4 complete—visual design language updated and validated independently.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and cross-story improvements after core stories are implemented.

- [ ] T043 [P] Consolidate any duplicate sidebar-related types or utilities into shared modules for reuse in src/types/sidebar.ts and src/lib/
- [ ] T044 [P] Remove obsolete queue navigation UI (e.g., old Skip button) that is now superseded by sidebar navigation in src/app/timeline/page.tsx and related components
- [ ] T045 [P] Add or update developer documentation describing sidebar usage and extension points in docs/ and specs/004-sidebar-design/quickstart.md
- [ ] T046 Run full lint, typecheck, unit, and E2E suites to ensure no regressions before merging in package.json scripts and CI configuration
- [ ] T047 Review bundle size impact of sidebar and design changes and adjust if over budget in package.json and any bundle analysis configuration

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies—should be completed first to confirm environment and tooling.
- **Foundational (Phase 2)**: Depends on Phase 1 and BLOCKS all user story phases; complete T004–T010 before any [US*] tasks.
- **User Story Phases (3–6)**: All depend on Foundational completion.
  - User Story 1 (P1) is the core MVP and should be implemented first.
  - User Story 2 (P2) builds on US1 but can be developed in parallel once foundational work and basic Sidebar wiring are in place.
  - User Story 3 (P3) depends on US1/US2 behavior and SidebarContext for responsive state but tests independently on mobile.
  - User Story 4 (P2) can run in parallel with US2/US3 after tokens and core components exist.
- **Polish (Phase 7)**: Depends on all desired user stories being completed.

### User Story Dependencies

- **US1 (Navigate Between Folders)**: Depends on Phase 2 foundational tasks; no dependency on other stories.
- **US2 (Visual Feedback for Folder Status)**: Depends on US1’s Sidebar + FolderList/FolderItem components; enhances but does not structurally change navigation.
- **US3 (Responsive Sidebar Behavior)**: Depends on US1 and foundational SidebarContext/useSidebarState; adds mobile-specific behavior.
- **US4 (Updated Visual Design Language)**: Depends on tokens from Phase 2 and components from US1/US2; applies styling across sidebar and timeline.

### Parallel Opportunities

- After foundational tasks (T004–T010):
  - US1 implementation (T013–T019) and US2 implementation (T022–T026) can be split across developers, with test tasks (T011–T012, T020–T021) running in parallel.
  - US3 (T029–T035) can start once SidebarContext and basic Sidebar wiring from US1 are in place.
  - US4 styling tasks (T038–T042) can run in parallel with US2/US3 once tokens and base components exist.
- Within each phase, tasks marked [P] are safe to execute in parallel because they touch different files or are read-only checks.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003).
2. Complete Phase 2: Foundational (T004–T010).
3. Implement User Story 1 (Phase 3: T011–T019).
4. Validate US1 independently using unit and E2E tests (T011–T012) and manual checks from spec.md.
5. Optionally deploy/demo as the first MVP increment.

### Incremental Delivery

1. Deliver MVP with US1 (Phase 3).
2. Add US2 (Phase 4) for unread badge feedback and live count updates.
3. Add US3 (Phase 5) for mobile responsiveness and animation.
4. Add US4 (Phase 6) for full design language update and visual polish.
5. Finish with Phase 7 (Polish) for cleanup, docs, and performance checks.

### Parallel Team Strategy

With multiple developers available:

- Developer A: Focus on foundational hooks/context (Phase 2) and US1 navigation behavior.
- Developer B: Implement US2 unread badges and live count updates.
- Developer C: Implement US3 mobile toggle, framer-motion animations, and responsive behavior.
- Developer D: Apply US4 design tokens, visual polish, and visual regression tests.

All developers should coordinate through tasks in [specs/004-sidebar-design/tasks.md](specs/004-sidebar-design/tasks.md) and keep tests green as each story lands.
