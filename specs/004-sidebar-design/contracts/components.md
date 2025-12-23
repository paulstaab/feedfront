# Component Contracts: Sidebar System

**Feature**: 004-sidebar-design  
**Purpose**: Define interfaces and props for sidebar components

---

## 1. Sidebar (Container)

**Responsibility**: Main sidebar container managing state and layout

### Props Interface
```typescript
interface SidebarProps {
  /** List of folders to display */
  folders: Folder[];
  
  /** Currently selected folder ID (optional, for highlighting) */
  selectedFolderId?: string;
  
  /** Callback when folder is selected */
  onFolderSelect?: (folderId: string) => void;
  
  /** CSS class for styling overrides */
  className?: string;
}
```

### Context Provided
```typescript
interface SidebarContextValue {
  /** Whether sidebar is open on mobile */
  isOpen: boolean;
  
  /** Toggle sidebar visibility (mobile only) */
  toggle: () => void;
  
  /** Close sidebar (mobile only) */
  close: () => void;
}
```

### Accessibility
- `role="navigation"`
- `aria-label="Folder navigation"`
- `aria-hidden={!isOpen}` on mobile when closed

### Example Usage
```typescript
<Sidebar
  folders={folders}
  selectedFolderId={currentFolderId}
  onFolderSelect={(id) => navigate(`/timeline/${id}`)}
/>
```

---

## 2. FolderList

**Responsibility**: Renders filtered list of folders with selection state

### Props Interface
```typescript
interface FolderListProps {
  /** Filtered folders to display */
  folders: Folder[];
  
  /** Currently selected folder ID */
  selectedId?: string;
  
  /** Callback when folder is clicked */
  onSelect: (folderId: string) => void;
}
```

### Behavior
- Filters out folders with `unreadCount === 0` internally
- Shows empty state if no folders match filter
- Keyboard navigable (Tab/Shift-Tab)

### Accessibility
- `<ul>` with `role="list"` (implicit)
- Each item has `role="listitem"` (implicit)

### Example Usage
```typescript
<FolderList
  folders={folders}
  selectedId="abc-123"
  onSelect={handleFolderSelect}
/>
```

---

## 3. FolderItem

**Responsibility**: Individual folder list item with badge and selection state

### Props Interface
```typescript
interface FolderItemProps {
  /** Folder data */
  folder: Folder;
  
  /** Whether this folder is currently selected */
  isSelected: boolean;
  
  /** Click handler */
  onClick: (folderId: string) => void;
}
```

### Visual States
| State | CSS Class | Appearance |
|-------|-----------|------------|
| Default | `folder-item` | bg-transparent, text-gray-300 |
| Hover | `folder-item:hover` | bg-surface, text-white |
| Selected | `folder-item--selected` | bg-primary-600, text-white |
| Focus | `folder-item:focus` | Ring outline (blue) |

### Accessibility
- `<button>` element (native keyboard support)
- `aria-current="page"` when selected
- `aria-label="{folder.name} ({folder.unreadCount} unread)"`

### Example Usage
```typescript
<FolderItem
  folder={{ id: '123', name: 'Tech', unreadCount: 5 }}
  isSelected={true}
  onClick={(id) => console.log('Selected:', id)}
/>
```

---

## 4. UnreadBadge

**Responsibility**: Display unread count badge

### Props Interface
```typescript
interface UnreadBadgeProps {
  /** Unread article count */
  count: number;
  
  /** Optional size variant */
  size?: 'sm' | 'md' | 'lg';
}
```

### Behavior
- Shows count if `count > 0`
- Hides if `count === 0`
- Rounds to "99+" if `count > 99`

### Accessibility
- `aria-label="{count} unread articles"`
- Not interactive (decorative badge)

### Example Usage
```typescript
<UnreadBadge count={12} size="md" />
// Renders: <span aria-label="12 unread articles">12</span>
```

---

## 5. MobileToggle (Hamburger Button)

**Responsibility**: Toggle button for mobile sidebar

### Props Interface
```typescript
interface MobileToggleProps {
  /** Whether sidebar is currently open */
  isOpen: boolean;
  
  /** Toggle callback */
  onToggle: () => void;
}
```

### Behavior
- Only visible on mobile (<768px)
- Icon changes: ☰ (closed) → ✕ (open)
- Fixed position in top-left corner

### Accessibility
- `<button>` element
- `aria-label="Open sidebar"` when closed
- `aria-label="Close sidebar"` when open
- `aria-expanded={isOpen}`

### Example Usage
```typescript
<MobileToggle
  isOpen={sidebarOpen}
  onToggle={() => setSidebarOpen(!sidebarOpen)}
/>
```

---

## 6. Overlay

**Responsibility**: Semi-transparent dimming overlay for mobile sidebar

### Props Interface
```typescript
interface OverlayProps {
  /** Whether overlay is visible */
  visible: boolean;
  
  /** Click handler (should close sidebar) */
  onClick: () => void;
}
```

### Behavior
- Only renders on mobile (<768px)
- Covers main content with a semi-transparent dimming layer when sidebar is open
- Closes sidebar when clicked

### Accessibility
- `role="presentation"` (decorative element)
- Not keyboard focusable
- Click triggers sidebar close

### Example Usage
```typescript
<Overlay
  visible={isMobileAndOpen}
  onClick={closeSidebar}
/>
```

---

## Component Hierarchy

```
<Sidebar>
  └── <SidebarContext.Provider>
      ├── <MobileToggle />
      ├── <aside>
      │   └── <FolderList>
      │       └── <FolderItem> (repeats)
      │           ├── <span>{folder.name}</span>
      │           └── <UnreadBadge />
      └── <Overlay />
</Sidebar>
```

---

## Shared Types

```typescript
// types/sidebar.ts

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

---

## Event Contracts

### onFolderSelect
**Signature**: `(folderId: string) => void`

**Triggered When**: User clicks folder item

**Expected Behavior**:
1. Close mobile sidebar
2. Navigate to folder timeline
3. Update selected state

**Example**:
```typescript
function handleFolderSelect(folderId: string) {
  closeSidebar(); // Mobile only
  router.push(`/timeline/${folderId}`);
}
```

### onToggle (Mobile)
**Signature**: `() => void`

**Triggered When**: User clicks hamburger button or overlay

**Expected Behavior**:
1. Toggle `isOpen` state
2. Persist to localStorage
3. Trigger animation (Framer Motion)

**Example**:
```typescript
function handleToggle() {
  setIsOpen(prev => !prev);
  localStorage.setItem('sidebar-open', JSON.stringify(!isOpen));
}
```

---

## CSS Custom Properties

Components reference these design tokens:

```css
/* Sidebar */
--sidebar-width: 240px;
--sidebar-bg: var(--bg-surface);
--sidebar-border: var(--border-subtle);

/* Folder Item */
--folder-item-height: 48px;
--folder-item-padding: 12px 16px;
--folder-item-bg-hover: var(--bg-hover);
--folder-item-bg-selected: var(--color-primary);

/* Badge */
--badge-bg: var(--color-primary);
--badge-text: var(--text-on-primary);
--badge-radius: 12px;
--badge-padding: 2px 8px;

/* Mobile */
--overlay-bg: rgba(0, 0, 0, 0.5);
--toggle-size: 44px;
```

---

## Performance Contracts

| Component | Render Budget | Notes |
|-----------|---------------|-------|
| Sidebar | <50ms | Initial render |
| FolderList | <30ms | With <50 folders |
| FolderItem | <5ms per item | Individual render |
| UnreadBadge | <2ms | Decorative only |
| Animation | <200ms | Open/close transition |

---

## Testing Contracts

### Unit Test Coverage (Vitest)
- [ ] Sidebar: Context provider, state management
- [ ] FolderList: Filtering logic, empty state
- [ ] FolderItem: Selection state, click handler
- [ ] UnreadBadge: Count formatting (0, 5, 99+)
- [ ] MobileToggle: Aria labels, icon toggle

### E2E Test Coverage (Playwright)
- [ ] Mobile: Open/close sidebar
- [ ] Mobile: Overlay closes sidebar
- [ ] Desktop: Sidebar always visible
- [ ] Keyboard: Tab navigation, Escape key
- [ ] Selection: Folder highlight, navigation

### Visual Regression (Playwright)
- [ ] Desktop: Sidebar default state
- [ ] Mobile: Closed state
- [ ] Mobile: Open state
- [ ] Hover: Folder item hover
- [ ] Selected: Folder item selected

---

## Success Criteria

- [ ] All components follow single responsibility principle
- [ ] Props interfaces are type-safe and minimal
- [ ] Accessibility attributes present on all interactive elements
- [ ] No prop drilling (Context used appropriately)
- [ ] Performance budgets met (<100ms total render)
- [ ] All events have clear contracts and handlers
