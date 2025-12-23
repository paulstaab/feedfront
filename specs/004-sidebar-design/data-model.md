# Data Model: Sidebar Navigation

**Feature**: 004-sidebar-design  
**Version**: 1.0  
**Last Updated**: 2025-12-23

## Entities

### 1. Folder

**Description**: Represents a content category/source with associated articles

**Source**: Existing entity from 003-timeline-folder-view

**Fields**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `id` | string | Yes | UUID v4 | Unique identifier |
| `name` | string | Yes | 1-50 chars | Display name |
| `unreadCount` | number | Yes | >= 0 | Number of unread articles |
| `icon` | string | No | Valid emoji or icon name | Visual identifier |
| `createdAt` | ISO 8601 string | Yes | Valid date | Creation timestamp |

**Relationships**:
- Has many `Article` (not modeled in this feature)
- Displayed in `Sidebar` component

**State Transitions**:
```
INITIAL (unreadCount = 0)
  ↓ [New article arrives]
UNREAD (unreadCount > 0)
  ↓ [User marks article as read]
UNREAD (unreadCount -= 1)
  ↓ [Last article marked as read]
INITIAL (unreadCount = 0)
```

**Invariants**:
- `unreadCount` cannot be negative
- `id` must be unique across all folders
- `name` must be non-empty

**Example**:
```json
{
  "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "name": "Tech News",
  "unreadCount": 12,
  "icon": "📰",
  "createdAt": "2025-01-15T10:30:00Z"
}
```

---

### 2. SidebarState

**Description**: Client-side UI state for sidebar visibility (mobile only)

**Source**: New entity for this feature

**Fields**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `isOpen` | boolean | Yes | `false` | Whether sidebar is visible on mobile |
| `lastToggled` | number | No | `Date.now()` | Timestamp of last toggle action |

**Persistence**:
- Stored in localStorage as `sidebar-open` key
- Hydrated on client mount (SSR-safe)
- Not synced across tabs/devices

**State Transitions**:
```
CLOSED (isOpen = false)
  ↓ [User clicks hamburger]
OPEN (isOpen = true)
  ↓ [User clicks overlay OR folder link OR Escape key]
CLOSED (isOpen = false)
```

**Invariants**:
- Desktop viewport (>= 768px): `isOpen` always `true` (sidebar always visible)
- Mobile viewport (< 768px): `isOpen` toggleable

**Example localStorage value**:
```json
{
  "isOpen": true,
  "lastToggled": 1737809400000
}
```

---

### 3. FolderFilter (Derived State)

**Description**: Runtime filter configuration for visible folders

**Source**: New derived state for this feature

**Fields**:
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `showEmpty` | boolean | Yes | `false` | Whether to show folders with unreadCount = 0 |

**Derivation**:
```typescript
function getVisibleFolders(folders: Folder[], filter: FolderFilter): Folder[] {
  if (filter.showEmpty) {
    return folders;
  }
  return folders.filter(f => f.unreadCount > 0);
}
```

**Notes**:
- Not persisted (always defaults to `showEmpty = false`)
- Applied during render, not stored separately
- FR-002: "Only folders with unread articles are visible"

---

## Relationships Diagram

```
┌─────────────────┐
│   Folder[]      │ (from existing state)
│   - id          │
│   - name        │
│   - unreadCount │
└────────┬────────┘
         │
         │ filters by unreadCount > 0
         ↓
┌─────────────────┐
│ FolderFilter    │ (derived state)
│ - showEmpty     │
└────────┬────────┘
         │
         │ used by
         ↓
┌─────────────────┐
│   Sidebar       │ (component)
│   - folders     │
│   - isOpen      │←──────┐
└─────────────────┘        │
                           │
                  ┌────────┴────────┐
                  │ SidebarState    │ (UI state)
                  │ - isOpen        │
                  │ - lastToggled   │
                  └─────────────────┘
                           │
                           │ persisted in
                           ↓
                  ┌─────────────────┐
                  │  localStorage   │
                  │  "sidebar-open" │
                  └─────────────────┘
```

---

## Validation Rules

### Folder
1. `name` must not be empty string
2. `unreadCount` must be non-negative integer
3. `id` must be valid UUID v4 format

### SidebarState
1. `isOpen` defaults to `false` on first visit
2. Desktop viewport: `isOpen` locked to `true` (CSS handles visibility)
3. localStorage value must be valid JSON boolean

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| All folders have `unreadCount = 0` | Sidebar shows empty state message |
| localStorage corrupted/invalid | Fallback to `isOpen = false` |
| Folder deleted while sidebar open | Remove from list, no error |
| New folder added with 0 unread | Not visible until first article arrives |
| User disables localStorage | State resets to `false` on page reload |

---

## Migration Notes

**Existing Data**:
- `Folder` entity already exists in application state (from feature 003)
- No schema changes required to existing folder data
- New fields: None

**New Data**:
- `SidebarState` is new client-side state only
- No server/database schema changes
- localStorage schema: `{ "isOpen": boolean }`

---

## Performance Considerations

| Operation | Complexity | Notes |
|-----------|------------|-------|
| Filter folders by unreadCount | O(n) | Acceptable for n < 100 folders |
| Toggle sidebar state | O(1) | Single boolean update |
| Persist to localStorage | O(1) | Synchronous write ~1ms |
| Hydrate from localStorage | O(1) | Single key read |

**Optimization Opportunities**:
- If folder count exceeds 100: Use virtual scrolling (react-window)
- If localStorage slow: Debounce writes with 500ms delay

---

## TypeScript Definitions

```typescript
// types/sidebar.ts

export interface Folder {
  id: string; // UUID v4
  name: string; // 1-50 chars
  unreadCount: number; // >= 0
  icon?: string; // Optional emoji or icon name
  createdAt: string; // ISO 8601
}

export interface SidebarState {
  isOpen: boolean;
  lastToggled?: number; // Unix timestamp
}

export interface FolderFilter {
  showEmpty: boolean;
}

// Derived type for visible folders
export type VisibleFolders = Folder[];
```

---

## Success Criteria

- [ ] `Folder` type matches existing implementation (no breaking changes)
- [ ] `SidebarState` persists correctly across page reloads
- [ ] Filter logic correctly hides folders with `unreadCount = 0`
- [ ] Desktop viewport ignores `isOpen` state (always visible)
- [ ] Mobile viewport respects `isOpen` state
- [ ] No hydration mismatches in Next.js SSR

---

## References

- [Feature Spec](./spec.md) - Functional requirements
- [Research](./research.md) - Technology choices
- [Implementation Plan](./plan.md) - Technical approach
