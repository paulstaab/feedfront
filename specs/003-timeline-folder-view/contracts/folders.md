# Folders API Contract

`GET /folders` provides the metadata necessary to label folders and map feeds → folders for unread aggregation.

## Request

No parameters.

```
GET https://<baseUrl>/folders
Authorization: Basic <credentials>
```

## Response

```json
[
  {
    "id": 9,
    "name": "Tech",
    "feeds": [42, 51, 77],
    "parentId": null,
    "opened": true
  }
]
```

- `feeds` lists feed IDs that we already receive via `/feeds`. This allows us to join `Article.feedId → Folder.id`.
- `opened` is ignored by the timeline but preserved for potential future UI.

## Usage in Folder-Based Timeline

1. Load folders once per session using `useSWRImmutable`.
2. Persist `id` and `name` inside `FolderQueueEntry` for quick display.
3. Use the `feeds` array as a fallback mapping when an article lacks `folderId` (older servers). In that case, derive `folderId` by checking the parent feed.

## Errors

- `401 Unauthorized`: bubble the error up to `useAuth` and redirect to login.
- Other errors: show toast + allow retry; cached folder metadata stays valid.
