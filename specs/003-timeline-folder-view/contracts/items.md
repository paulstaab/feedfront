# Items API Contract (headless-rss v1.3)

## 1. `GET /items`

Retrieves articles according to filters. Used to hydrate the folder cache on load and after manual updates.

### Request

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `type` | number | ✅ | `3` = "all feeds"; future work may request per-folder/per-feed by switching type/id. |
| `id` | number | ✅ (when `type` ≠ 3) | Folder/feed identifier. We pass `0` when `type = 3`. |
| `getRead` | boolean | optional | `false` (default) for unread only. |
| `batchSize` | number | optional | Defaults to 200 per API spec; we request 50. |
| `offset` | number | optional | For pagination/infinite scroll fallback. |
| `oldestFirst` | boolean | optional | Always `false` (newest first). |

### Response

```json
{
  "items": [
    {
      "id": 123,
      "feedId": 42,
      "folderId": 9,
      "title": "Sample article",
      "author": "Feed Author",
      "pubDate": 1734038400,
      "body": "<p>Full text</p>",
      "url": "https://example.com/article",
      "enclosureLink": null,
      "enclosureMime": null,
      "unread": true,
      "starred": false,
      "fingerprint": "..."
    }
  ],
  "total": 50
}
```

`Article` objects are normalized via existing `normalizeArticle()` helper before entering the timeline cache.

### Errors

- `401 Unauthorized`: credentials invalid; trigger logout.
- Network failures: show toast + retry with exponential backoff, keeping cache intact.

---

## 2. `GET /items/updated`

Optional optimization used by the Update button to fetch only items changed since the last sync.

### Request

| Param | Type | Required | Notes |
|-------|------|----------|-------|
| `lastModified` | number | ✅ | Unix timestamp (seconds) from `TimelineCacheEnvelope.lastSynced`. |
| `type` | number | ✅ | Typically `3`. |
| `id` | number | ✅ | `0` when `type = 3`. |

### Response

Same shape as `GET /items`, but may return empty `items` when nothing changed.

### Behavior

- On success, merge returned articles into cache.
- On `304` or empty payload, simply bump `lastSynced`.

---

## 3. `POST /items/read/multiple`

Marks a set of article IDs as read. Used when the user clicks "Mark All as Read" for a folder.

### Request Body

```json
{
  "itemIds": [123, 456, 789]
}
```

### Response

`204 No Content` on success.

### Errors

- `400`: Occurs if payload is empty; prevent by guarding in UI.
- `500`: Retry with exponential backoff; keep `pendingReadIds` until success.

---

## 4. `POST /items/{id}/read`

Marks a single article as read when its card is expanded.

### Path Params

- `id` (number): Article identifier.

### Response

`204 No Content` on success.

### Notes

- Called optimistically; failures revert the UI state and surface toast.

---

## 5. `POST /items/unread/multiple` (Fallback)

Not part of the primary flow but retained for parity. Allows us to revert skipped folders back to unread if future UX requires it.

```json
{
  "itemIds": [123, 456]
}
```

Currently unused; documented here for completeness.
