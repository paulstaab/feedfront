# Quickstart: Sidebar Navigation Development

**Feature**: 004-sidebar-design  
**For**: Developers implementing sidebar navigation with design updates

---

## Prerequisites

- Node.js >=20 installed
- Project cloned and dependencies installed (`npm install`)
- Familiarity with Next.js App Router and React hooks
- Basic understanding of Tailwind CSS

---

## Development Setup

### 1. Install New Dependencies

```bash
npm install framer-motion@^11
```

### 2. Start Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Key Files to Modify

### New Files to Create

```
src/
  components/
    Sidebar/
      index.tsx          # Main Sidebar container
      FolderList.tsx     # Folder list component
      FolderItem.tsx     # Individual folder item
      UnreadBadge.tsx    # Unread count badge
      MobileToggle.tsx   # Hamburger button
      Overlay.tsx        # Mobile overlay
      SidebarContext.tsx # Context provider
      useSidebarState.ts # localStorage hook
  styles/
    tokens.css           # Design token CSS variables
  types/
    sidebar.ts           # TypeScript interfaces
```

### Files to Update

```
src/
  app/
    layout.tsx           # Add Sidebar to root layout
  styles/
    globals.css          # Import tokens.css
tailwind.config.js       # Extend theme with CSS variables
```

---

## Implementation Order

### Phase 1: Design Tokens (30 min)

1. **Create `src/styles/tokens.css`**:

```css
:root {
  /* Colors */
  --bg-primary: #1a1a1a;
  --bg-surface: #2d2d2d;
  --bg-hover: #3a3a3a;
  --color-primary: #3b82f6;
  --text-primary: #e5e5e5;
  --text-secondary: #a3a3a3;
  --border-subtle: #404040;
  
  /* Spacing */
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  
  /* Sidebar */
  --sidebar-width: 240px;
}
```

2. **Import in `src/styles/globals.css`**:

```css
@import './tokens.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

3. **Update `tailwind.config.js`**:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-surface': 'var(--bg-surface)',
        'bg-hover': 'var(--bg-hover)',
        'primary': 'var(--color-primary)',
      }
    }
  }
}
```

### Phase 2: Type Definitions (15 min)

**Create `src/types/sidebar.ts`**:

```typescript
export interface Folder {
  id: string;
  name: string;
  unreadCount: number;
  icon?: string;
  createdAt: string;
}

export interface SidebarState {
  isOpen: boolean;
  lastToggled?: number;
}

export type FolderSelectHandler = (folderId: string) => void;
```

### Phase 3: Core Logic (45 min)

1. **Create `src/components/Sidebar/useSidebarState.ts`**:

```typescript
import { useState, useEffect } from 'react';

export function useSidebarState() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('sidebar-open');
    if (stored) {
      setIsOpen(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('sidebar-open', JSON.stringify(isOpen));
    }
  }, [isOpen, mounted]);

  return [isOpen, setIsOpen] as const;
}
```

2. **Create `src/components/Sidebar/SidebarContext.tsx`**:

```typescript
'use client';
import { createContext, useContext, ReactNode } from 'react';
import { useSidebarState } from './useSidebarState';

interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useSidebarState();

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggle: () => setIsOpen(prev => !prev),
        close: () => setIsOpen(false),
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within SidebarProvider');
  return context;
}
```

### Phase 4: UI Components (1.5 hours)

Work through components in this order:
1. UnreadBadge (simplest, no dependencies)
2. FolderItem (uses UnreadBadge)
3. FolderList (uses FolderItem)
4. MobileToggle (standalone)
5. Overlay (standalone)
6. Sidebar (composes all)

**Tip**: Reference [contracts/components.md](./contracts/components.md) for prop interfaces

### Phase 5: Layout Integration (30 min)

**Update `src/app/layout.tsx`**:

```typescript
import { SidebarProvider } from '@/components/Sidebar/SidebarContext';
import Sidebar from '@/components/Sidebar';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SidebarProvider>
          <div className="grid grid-cols-[240px_1fr] md:grid-cols-1">
            <Sidebar folders={mockFolders} />
            <main>{children}</main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
```

---

## Testing Strategy

### Unit Tests (Vitest)

**Run tests**: `npm run test`

**Example test** (`tests/unit/Sidebar.test.tsx`):

```typescript
import { render, screen } from '@testing-library/react';
import { FolderList } from '@/components/Sidebar/FolderList';

test('hides folders with zero unread count', () => {
  const folders = [
    { id: '1', name: 'Tech', unreadCount: 5 },
    { id: '2', name: 'News', unreadCount: 0 }, // Should be hidden
  ];
  
  render(<FolderList folders={folders} onSelect={() => {}} />);
  
  expect(screen.getByText('Tech')).toBeInTheDocument();
  expect(screen.queryByText('News')).not.toBeInTheDocument();
});
```

### E2E Tests (Playwright)

**Run tests**: `npm run test:e2e`

**Example test** (`tests/e2e/sidebar.spec.ts`):

```typescript
import { test, expect } from '@playwright/test';

test('mobile sidebar opens and closes', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/timeline');

  // Initially closed
  await expect(page.locator('aside[role="navigation"]')).toHaveAttribute('aria-hidden', 'true');

  // Open sidebar
  await page.click('[aria-label="Open sidebar"]');
  await expect(page.locator('aside[role="navigation"]')).toHaveAttribute('aria-hidden', 'false');

  // Close via overlay
  await page.click('[role="presentation"]');
  await expect(page.locator('aside[role="navigation"]')).toHaveAttribute('aria-hidden', 'true');
});
```

---

## Debugging Tips

### Issue: Hydration Mismatch

**Error**: "Text content does not match server-rendered HTML"

**Solution**: Use `mounted` flag in `useSidebarState` hook

```typescript
if (!mounted) return null; // Avoid rendering client-only state during SSR
```

### Issue: localStorage Not Persisting

**Check**:
1. Browser DevTools > Application > Local Storage
2. Verify `sidebar-open` key exists
3. Check for JSON parse errors in console

### Issue: Sidebar Not Animating

**Check**:
1. Framer Motion installed: `npm list framer-motion`
2. Component wrapped in `<motion.aside>`
3. Check for CSS conflicts (e.g., `overflow: hidden` on parent)

### Issue: Folder Count Not Updating

**Check**:
1. Folders prop passed to Sidebar
2. `useMemo` dependency array in FolderList
3. React DevTools > Components > Sidebar (inspect props)

---

## Design Review Checklist

Before marking feature complete:

- [ ] Desktop: Sidebar always visible (CSS Grid, not JavaScript)
- [ ] Mobile: Sidebar hidden by default, opens with hamburger
- [ ] Folders with `unreadCount = 0` are hidden
- [ ] Unread badges show correct count (round to 99+ if >99)
- [ ] Hover states work on folder items
- [ ] Selected folder highlighted with blue background
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Screen reader announces folder names and unread counts
- [ ] Animation completes in <200ms
- [ ] Color contrast meets WCAG 2.1 AA (use axe DevTools)

---

## Performance Validation

**Tool**: Lighthouse (Chrome DevTools)

**Targets**:
- Performance: >90
- Accessibility: 100
- Best Practices: >90

**Check bundle size**:
```bash
npm run build
npm run analyze # If analyze script exists
```

**Expected**: Sidebar components add <25KB gzipped

---

## Code Style

**Formatting**: Use Prettier
```bash
npm run format
```

**Linting**: Use ESLint
```bash
npm run lint:fix
```

**Type Checking**: Use TypeScript
```bash
npm run typecheck
```

---

## Resources

- [Data Model](./data-model.md) - Entity definitions
- [Component Contracts](./contracts/components.md) - Prop interfaces
- [Research](./research.md) - Technology decisions
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS Grid](https://tailwindcss.com/docs/grid-template-columns)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

---

## Getting Help

**Stuck on implementation?**
1. Check [spec.md](./spec.md) for functional requirements
2. Review [plan.md](./plan.md) for technical approach
3. Read existing tests in `tests/` for patterns

**Questions?**
- Check constitution.md for project principles
- Review similar components in `src/components/`
- Use GitHub Copilot for code suggestions
