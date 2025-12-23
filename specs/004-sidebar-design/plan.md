# Implementation Plan: Sidebar Navigation with Design Language Update

**Branch**: `004-sidebar-design` | **Date**: 2025-12-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-sidebar-design/spec.md`

## Summary

Add a permanent left sidebar for direct folder navigation, replacing the current sequential skip-through pattern. The sidebar will display all folders with unread articles (hiding empty folders), show unread count badges, and collapse into a hamburger menu on mobile devices (<768px). When opened on mobile, the sidebar will slide in over a semi-transparent dimming overlay that closes when tapped, matching the clarified mobile behavior. Simultaneously, update the visual design language to a dark theme with consistent spacing, typography, and border radius tokens. This feature leverages Next.js static generation, React for component state, and Tailwind CSS for responsive styling, requiring no new runtime services or APIs.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 15.x (React 19)
**Primary Dependencies**: Next.js (SSG), React, Tailwind CSS, Playwright (E2E), Vitest (unit tests)
**Storage**: localStorage for sidebar state persistence (mobile open/closed preference)
**Testing**: Vitest for unit tests, Playwright for E2E visual regression tests
**Target Platform**: Static PWA (desktop & mobile browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
**Project Type**: Web application (Next.js with static export)
**Performance Goals**: <100ms sidebar render, <200ms mobile sidebar animation, <100KB bundle size increase
**Constraints**: Static-only deployment (no server state), must work offline after initial load, WCAG 2.1 AA compliance
**Scale/Scope**: Single-user PWA, ~10-50 folders typical, supports up to 50 folders without degradation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

1. **Simplicity First** ✅
   - Feature enhances single-user efficiency without adding deployment complexity
   - No new services, runtime compute, or external dependencies
   - Reuses existing folder data structure from 003-timeline-folder-view
   - No release documentation needed beyond PR notes and automated tests
   - Removes complexity by eliminating "All" view option (clarification #5)

2. **Code Quality Discipline** ✅
   - ESLint + TypeScript strict mode enforced via pre-commit hooks
   - Components will be scoped to single concerns: `<Sidebar>`, `<FolderList>`, `<FolderItem>`, `<HamburgerMenu>`
   - Design tokens extracted to CSS variables in `src/styles/tokens.css` for reusability
   - Dead code: Remove old "Skip" button UI from current folder queue view in same PR

3. **Static Delivery Mandate** ✅
   - Sidebar component statically rendered during `npm run build && npm run export`
   - Folder list and unread counts sourced from existing RSS feed metadata at build time
   - Client-side hydration for interactive state (mobile toggle, active folder highlighting)
   - No new API endpoints; uses existing headless-rss `/folders` and `/items` endpoints
   - Mobile/desktop detection via CSS media queries (no server-side detection)

4. **Right-Sized Tests** ✅
   - **Automated tests before merge**:
     - Unit tests: Sidebar visibility logic, folder filtering (hide empty), unread count display
     - E2E tests: Folder navigation, mobile hamburger toggle, keyboard accessibility (Tab/Enter/Escape)
     - Visual regression: Playwright screenshots for sidebar states (desktop, mobile open/closed, hover)
   - **Manual smoke tests**: Design token application (colors, spacing, border radius) checked via visual inspection
   - **PR checklist**: Verify WCAG 2.1 AA contrast ratios using axe DevTools, test responsive breakpoints (320px, 768px, 1440px)

5. **Experience Consistency** ✅
   - Design tokens defined in `src/styles/tokens.css`:
     - Colors: `--bg-primary: #1a1a1a`, `--bg-surface: #2d2d2d`, `--color-primary: #3b82f6`, `--text-primary: #e5e5e5`
     - Spacing: `--spacing-1` through `--spacing-6` (4px, 8px, 12px, 16px, 24px, 32px)
     - Border radius: `--radius-card: 8px`, `--radius-button: 6px`, `--radius-badge: 50%`
   - Responsive breakpoints: Mobile (<768px), Tablet (768-1024px), Desktop (≥768px), Wide (>1440px)
   - WCAG 2.1 AA: All text contrast ≥4.5:1, keyboard navigation for all interactive elements
   - Visual regression tests capture: sidebar + article list, mobile states, hover/focus states

6. **Unread-Only Focus** ✅
   - Sidebar displays ONLY folders with unread articles (FR-001 + clarification #2)
   - Empty folders (zero unread) are hidden immediately when last article is marked read
   - No "All" view option means no risk of displaying read articles (clarification #5)
   - Unread counts update in real-time when articles marked as read (FR-006)
   - Folder list filtered client-side: `folders.filter(f => f.unreadCount > 0)` before rendering
   - When all articles in a folder are marked read and another folder has unread articles, navigation automatically jumps to the next folder with unread items (no dedicated "all read" page), per clarified FR-011

## Project Structure

### Documentation (this feature)

```text
specs/004-sidebar-design/
├── plan.md              # This file
├── research.md          # Phase 0: Technology choices and patterns
├── data-model.md        # Phase 1: Folder/Sidebar state entities
├── quickstart.md        # Phase 1: Developer onboarding guide
├── contracts/           # Phase 1: Component interfaces (if needed)
├── checklists/          # Quality validation checklists
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
src/
├── components/
│   └── Sidebar/
│       ├── Sidebar.tsx           # Main sidebar container component
│       ├── FolderList.tsx        # Scrollable folder list
│       ├── FolderItem.tsx        # Individual folder with badge
│       ├── HamburgerMenu.tsx     # Mobile toggle button
│       └── Sidebar.test.tsx      # Component unit tests
├── hooks/
│   └── useSidebarState.ts        # Mobile open/closed state + localStorage persistence
├── styles/
│   ├── tokens.css                # Design tokens (colors, spacing, radius)
│   └── sidebar.css               # Sidebar-specific styles (if needed beyond Tailwind)
├── types/
│   └── sidebar.ts                # TypeScript interfaces for Sidebar/Folder state
└── app/
    └── timeline/
        └── page.tsx              # Update to include Sidebar component

tests/
├── unit/
│   └── components/
│       └── Sidebar.test.tsx      # Folder filtering, badge display, state logic
└── e2e/
    └── sidebar-navigation.spec.ts # Folder switching, mobile toggle, keyboard nav

```

**Structure Decision**: Web application structure (Next.js). Using existing `src/components/` pattern. New `Sidebar/` directory for related components. Design tokens in `src/styles/tokens.css` for global reuse. No new backend code required.

## Phase Status

### Phase 0: Research & Analysis ✅ COMPLETE
- **research.md**: 7 research questions answered with technology decisions
  - Sidebar layout pattern: React Context + CSS Grid
  - localStorage strategy: SSR-safe custom hook
  - Design tokens: CSS Custom Properties + Tailwind theme extension
  - Folder filtering: Client-side derived state
  - Animation: Framer Motion with GPU acceleration
  - Keyboard navigation: Standard ARIA patterns + Escape key
  - Visual regression: Playwright screenshot comparison
- **Unknowns Resolved**: All NEEDS CLARIFICATION items addressed
- **Dependencies Added**: framer-motion@^11 (~25KB gzipped)

### Phase 1: Design & Contracts ✅ COMPLETE
- **data-model.md**: 3 entities defined
  - Folder (existing, no changes)
  - SidebarState (new, localStorage-persisted)
  - FolderFilter (derived state)
- **contracts/components.md**: 6 component interfaces defined
  - Sidebar (container), FolderList, FolderItem, UnreadBadge, MobileToggle, Overlay
  - Props contracts, accessibility requirements, event handlers
  - Performance budgets and testing contracts
- **quickstart.md**: Developer onboarding guide
  - 5-phase implementation order (Tokens → Types → Logic → UI → Layout)
  - Testing strategy with example tests
  - Debugging tips and design review checklist
- **Agent Context**: GitHub Copilot context updated with new patterns

### Constitution Re-check (Post-Design) ✅ PASS

All 6 principles validated after design phase:

1. **Simplicity First** ✅
   - Design confirms no new services or runtime complexity
   - Single dependency added (framer-motion) justified for production-tested animations
   - Component hierarchy shallow (max 3 levels deep)

2. **Code Quality Discipline** ✅
   - All components follow single responsibility principle (contracts validate this)
   - TypeScript interfaces defined in contracts prevent prop drilling
   - Design token system ensures CSS maintainability

3. **Static Delivery Mandate** ✅
   - Data model confirms all state is client-side (localStorage + React state)
   - No server-side persistence or API additions
   - SSR-safe hooks prevent hydration mismatches

4. **Right-Sized Tests** ✅
   - Testing contracts define unit, E2E, and visual regression coverage
   - Quickstart includes example tests (Vitest + Playwright)
   - Performance budgets defined (<100ms render, <200ms animation)

5. **Experience Consistency** ✅
   - Design tokens documented in research.md (colors, spacing, radius)
   - Component contracts specify all visual states (hover, selected, focus)
   - Accessibility requirements defined per component (ARIA labels, roles)

6. **Unread-Only Focus** ✅
   - Data model enforces filter: `folders.filter(f => f.unreadCount > 0)`
   - No "All" option in design (removed per clarification #5)
   - FolderFilter entity explicitly documents filtering logic

## Complexity Tracking

> No Constitution violations identified. All gates passed (initial + post-design).

