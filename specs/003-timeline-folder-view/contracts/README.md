# Contracts: Folder-Based Timeline View

All interactions reuse the existing headless-rss REST API. No new backend compute is introduced. This feature relies on the endpoints below:

| User Action | Endpoint | Document |
|-------------|----------|----------|
| Load unread articles grouped by folder | `GET /items` | [items.md](./items.md) |
| Fetch folder metadata / feed memberships | `GET /folders` | [folders.md](./folders.md) |
| Mark every article in the visible folder as read | `POST /items/read/multiple` | [items.md](./items.md) |
| Mark a single article as read when expanded | `POST /items/{id}/read` | [items.md](./items.md) |
| Refresh unread list with delta sync | `GET /items/updated` (optional optimization) | [items.md](./items.md) |

No additional endpoints are required for "Skip"—that behavior stays client-side until the user eventually marks the folder as read.
