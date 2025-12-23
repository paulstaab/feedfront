# Research: Sidebar Navigation with Design Language Update

**Feature**: 004-sidebar-design  
**Date**: 2025-12-23  
**Purpose**: Document technology choices, patterns, and implementation approaches for sidebar navigation and design system update

## Research Questions

### 1. Sidebar Layout Pattern in Next.js/React

**Question**: What's the best pattern for implementing a persistent sidebar in Next.js with responsive behavior?

**Decision**: Use React Context + CSS Grid layout pattern

**Rationale**:
- Next.js App Router supports layouts that persist across page navigations
- CSS Grid provides clean responsive breakpoints without JavaScript
- React Context manages sidebar state (open/closed on mobile) globally
- Avoids prop drilling through component tree
- Tailwind utilities handle responsive classes cleanly

**Alternatives Considered**:
- **Portal-based sidebar**: Rejected - unnecessarily complex for static layout
- **Route-based sidebar**: Rejected - would re-mount component on navigation
- **Third-party library** (e.g., Radix UI): Rejected - adds bundle size for simple use case

**Implementation Approach**:
```typescript
// Layout structure using CSS Grid
<div className="grid grid-cols-[240px_1fr] md:grid-cols-1">
  <Sidebar />
  <main>{children}</main>
</div>

// Context for mobile state
const SidebarContext = createContext<{
  isOpen: boolean;
  toggle: () => void;
}>()
```

---

### 2. localStorage Persistence Strategy

**Question**: How should sidebar state (mobile open/closed preference) be persisted and hydrated?

**Decision**: Custom React hook with SSR-safe hydration

**Rationale**:
- localStorage only available client-side (not during SSR/SSG)
- Need to prevent hydration mismatch between server and client
- Simple custom hook avoids third-party dependency
- Defaults to closed on first visit (mobile-first)

**Alternatives Considered**:
- **Cookies**: Rejected - unnecessary server involvement for client-only state
- **URL query params**: Rejected - pollutes URL, doesn't persist across sessions
- **Third-party state library** (Zustand/Jotai): Rejected - overkill for single boolean

**Implementation Approach**:
```typescript
function useSidebarState() {
  const [isOpen, setIsOpen] = useState(false); // SSR default
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('sidebar-open');
    if (stored) setIsOpen(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-open', JSON.stringify(isOpen));
    }
  }, [isOpen, mounted]);

  return [isOpen, setIsOpen] as const;
}
```

---

### 3. Design Token System Integration

**Question**: How should design tokens (colors, spacing, typography) be implemented in the existing Tailwind setup?

**Decision**: CSS Custom Properties + Tailwind theme extension

**Rationale**:
- CSS variables allow runtime theming potential (future light/dark toggle)
- Tailwind can reference CSS variables in theme config
- Maintains single source of truth in `tokens.css`
- Works with SSR/SSG without hydration issues
- Industry standard pattern (Radix Colors, shadcn/ui)

**Alternatives Considered**:
- **Pure Tailwind config**: Rejected - harder to reference outside Tailwind classes
- **Sass variables**: Rejected - additional build step, no runtime access
- **Emotion/styled-components**: Rejected - adds runtime CSS-in-JS overhead

**Implementation Approach**:
```css
/* src/styles/tokens.css */
:root {
  --bg-primary: #1a1a1a;
  --bg-surface: #2d2d2d;
  --color-primary: #3b82f6;
  --text-primary: #e5e5e5;
  --spacing-1: 4px;
  /* ... */
}
```

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-surface': 'var(--bg-surface)',
        // ...
      }
    }
  }
}
```

---

### 4. Folder Filtering Logic

**Question**: Where should the "hide empty folders" logic be implemented?

**Decision**: Client-side filter in Sidebar component (derived state)

**Rationale**:
- Static build includes all folders in HTML
- Filter applied during render based on current unread counts
- Unread counts update dynamically when articles marked as read
- Keeps filtering logic co-located with sidebar rendering
- Avoids stale filtered lists in cache

**Alternatives Considered**:
- **Build-time filtering**: Rejected - would require rebuild when counts change
- **API-level filtering**: Rejected - API returns all folders, filtering is view concern
- **Separate filtered state**: Rejected - introduces state synchronization complexity

**Implementation Approach**:
```typescript
function Sidebar({ folders }) {
  const visibleFolders = useMemo(
    () => folders.filter(f => f.unreadCount > 0),
    [folders]
  );

  return <FolderList folders={visibleFolders} />;
}
```

---

### 5. Mobile Animation Performance

**Question**: How to achieve 60fps sidebar slide animation on mobile?

**Decision**: CSS transforms (translateX) with GPU acceleration

**Rationale**:
- CSS transforms trigger GPU compositing (better performance than `left`/`margin`)
- Framer Motion provides production-tested animation primitives
- 200ms duration meets SC-005 requirement (<200ms)
- Handles reduced-motion preferences automatically
- Works well with React's rendering cycle

**Alternatives Considered**:
- **JavaScript RAF animation**: Rejected - more complex, harder to maintain
- **Pure CSS transitions**: Rejected - harder to coordinate with React state
- **React Spring**: Rejected - larger bundle size than Framer Motion for this use case

**Implementation Approach**:
```typescript
import { motion } from 'framer-motion';

<motion.aside
  initial={{ x: '-100%' }}
  animate={{ x: isOpen ? 0 : '-100%' }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
  className="fixed md:static"
>
  {/* Sidebar content */}
</motion.aside>
```

When the sidebar is open on mobile, it appears over a semi-transparent dimming overlay (for example `rgba(0, 0, 0, 0.4)`) that covers the rest of the page. Clicking or tapping on this dimmed backdrop closes the sidebar.
---

### 6. Keyboard Navigation Pattern

**Question**: What keyboard shortcuts should be supported for WCAG 2.1 AA compliance?

**Decision**: Standard navigation keys + Escape for mobile dismiss

**Rationale**:
- Tab/Shift-Tab: Native browser focus navigation (no custom code needed)
- Enter/Space: Native button/link activation (no custom code needed)
- Escape: Close mobile sidebar (requires custom handler)
- Arrow keys: Not needed (folder list uses standard tabbing)
- Follows ARIA Authoring Practices Guide patterns

**Alternatives Considered**:
- **Vim-style keys** (j/k navigation): Rejected - not accessible, not standard
- **Custom focus trap**: Rejected - only needed for modals, sidebar is navigation
- **Roving tabindex**: Rejected - unnecessary complexity for simple list

**Implementation Approach**:
```typescript
function Sidebar({ isOpen, onClose }) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <aside role="navigation" aria-label="Folder navigation">
      {/* Native Tab/Enter work automatically */}
    </aside>
  );
}
```

---

### 7. Visual Regression Testing Strategy

**Question**: How to implement visual regression tests for sidebar states?

**Decision**: Playwright built-in screenshot comparison with custom fixtures

**Rationale**:
- Playwright already in use for E2E tests (no new tooling)
- Built-in visual comparison with configurable threshold
- Can mock folder data for consistent screenshots
- Captures multiple states in single test run
- Percy integration available but not required initially

**Alternatives Considered**:
- **Percy/Chromatic**: Rejected - adds external service dependency, costs money
- **Jest image snapshots**: Rejected - requires separate test runner for visual tests
- **Manual visual QA only**: Rejected - doesn't meet "Right-Sized Tests" principle

**Implementation Approach**:
```typescript
// tests/e2e/visual-regression.spec.ts
test('sidebar visual states', async ({ page }) => {
  await page.goto('/timeline');
  
  // Desktop state
  await expect(page).toHaveScreenshot('sidebar-desktop.png');
  
  // Mobile closed
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(page).toHaveScreenshot('sidebar-mobile-closed.png');
  
  // Mobile open
  await page.click('[aria-label="Open sidebar"]');
  await expect(page).toHaveScreenshot('sidebar-mobile-open.png');
  
  // Hover state
  await page.hover('.folder-item:first-child');
  await expect(page).toHaveScreenshot('folder-hover.png');
});
```

---

## Summary of Technology Stack

| Concern | Technology | Rationale |
|---------|-----------|-----------|
| Layout | CSS Grid + Tailwind | Simple responsive, no JS overhead |
| State Management | React Context + useState | Right-sized for single boolean + folder list |
| Persistence | localStorage + custom hook | SSR-safe, simple, no dependencies |
| Design Tokens | CSS Custom Properties | Runtime flexibility, Tailwind integration |
| Animation | Framer Motion | Production-tested, bundle-efficient |
| Testing | Playwright + Vitest | Already in use, meets coverage needs |
| Accessibility | Native HTML + ARIA labels | Standards-compliant, minimal custom code |

## Dependencies to Add

```json
{
  "dependencies": {
    "framer-motion": "^11.x" // For mobile sidebar animation
  }
}
```

**Bundle Impact**: ~25KB gzipped (well under 100KB budget)

## Implementation Risks

| Risk | Mitigation |
|------|------------|
| Hydration mismatch (sidebar state) | Use SSR-safe hook with mounted flag |
| Safari transform bug | Test on Safari 14+, use will-change: transform |
| Folder count scaling (>50) | Virtual scrolling if needed (react-window) |
| Color contrast failures | Validate all token pairs with axe DevTools |

## Next Steps (Phase 1)

1. Create `data-model.md` defining Folder and SidebarState entities
2. Define component interfaces in `contracts/` (if needed for shared types)
3. Write `quickstart.md` with developer setup instructions
4. Update GitHub Copilot context with new patterns and decisions
