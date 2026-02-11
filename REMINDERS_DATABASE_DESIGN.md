# Reminders — Database Design (Firebase / Firestore)

**Product & architecture recommendation for the Reminders feature.**

---

## 1. Design principles

- **Property-scoped**: Reminders belong to a property (inspection, lease renewal, tax due, etc.).
- **Reuse existing access control**: Use the same property-based security as the rest of the app (users access only properties they have roles for).
- **Action tracking**: Support repeating reminders, defer (renew), and complete with full history.
- **No extra top-level collection**: Avoid a separate `reminders` collection; keep reminders under the property so security stays simple and consistent.

---

## 2. Recommended structure: subcollection per property

Use a **subcollection under each property**:

```
properties / {propertyId} / reminders / {reminderId}
```

**Why this layout**

| Aspect | Subcollection under property | Top-level `reminders` collection |
|--------|------------------------------|-----------------------------------|
| **Security** | Reuse `properties/{id}` rules; one rule covers property + reminders | Need rules that join `reminders.property_id` with user roles (more complex, extra reads) |
| **Consistency** | Matches `property_photos`, `lease_docs`, etc. | Different pattern from rest of app |
| **Queries** | “All reminders” = loop over user’s properties and read each `reminders` subcollection (already done in RemindersPage) | Single query possible but requires composite index and role-based filtering in rules |
| **Data locality** | Reminder data lives with the property | Reminders separated from property |

**Conclusion:** Keep **`properties/{propertyId}/reminders/{reminderId}`** as the single place where reminder documents live.

---

## 3. Document schema: `reminders` (per reminder)

Each reminder is one document in `properties/{propertyId}/reminders/{reminderId}`.

### 3.1 Core fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `property_id` | string | ✅ | Same as parent (redundant but useful when flattening for UI). Must equal `propertyId` in path. |
| `category` | string | ✅ | e.g. `fee`, `rent`, `maintenance`, `labor`, `tax`, `other`. Drives filters and UI. |
| `title` | string | ⭕ | Short label (e.g. “Quarterly inspection”). Optional; can derive from category + property. |
| `start_date` | string (ISO date) | ✅ | Current cycle start (e.g. `2025-02-01`). For one-time, this is the due date. |
| `due_date` | string (ISO date) | ⭕ | Explicit due date if different from `start_date` (e.g. “due 7 days after start”). If missing, UI can treat `start_date` as due. |
| `repeat_by` | string | ✅ | `one-time` \| `daily` \| `weekly` \| `monthly` \| `yearly`. Drives “repeating” behavior. |
| `status` | boolean | ✅ | `true` = active, `false` = inactive (paused or completed and not recurring). |
| `amount` | number | ⭕ | Optional amount (e.g. tax due, fee). |
| `note` | string | ⭕ | Free text. |
| `created_date` | string (ISO) | ✅ | Creation time (never change). |
| `created_by` | string | ✅ | `userId` of creator. |

### 3.2 Action tracking (repeating & history)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `renewals` | array | ⭕ | Defer history. Each element: `{ renewed_at, previous_start_date, new_start_date [, reason ] }`. |
| `completions` | array | ⭕ | Completion history. Each element: `{ completed_at, completed_date }`. For one-time, one entry then `status: false`. |
| `completed` | boolean | ⭕ | `true` when one-time reminder was completed (and deactivated). Omit or `false` for active/recurring. |

**Renewal entry shape (recommended):**

```ts
{
  renewed_at: string,       // ISO datetime
  previous_start_date: string,  // ISO date
  new_start_date: string,   // ISO date
  reason?: string          // e.g. "Auto-deferred on completion" or "Manual defer"
}
```

**Completion entry shape (recommended):**

```ts
{
  completed_at: string,    // ISO datetime
  completed_date: string   // ISO date (cycle that was completed)
}
```

### 3.3 Optional / future

| Field | Type | Description |
|-------|------|-------------|
| `lease_id` | string | Link to a lease (e.g. “Lease renewal” reminder). |
| `reminder_template_id` | string | If you add reusable templates later. |
| `next_run_at` | string (ISO) | Cached “next due” for queries (e.g. for notifications). |
| `updated_at` | string (ISO) | Last update time. |

---

## 4. Indexes (Firestore)

- **List reminders by property:**  
  Collection path is already `properties/{propertyId}/reminders`. List documents with optional `orderBy('start_date')` or `orderBy('created_date', 'desc')`.  
  **Index:** Create a **single-field index** on `start_date` or `created_date` when you use `orderBy` (Firebase will prompt in console).
- **Filter by status/category:**  
  Done in memory after fetch (current approach) is fine for typical property reminder counts. If a property ever has hundreds of reminders, add composite indexes for `status` + `start_date` (or similar) when you introduce server-side filtering.

---

## 5. Security rules (Firestore)

Keep reminders under the same property rule that already allows subcollections (as in your existing `FIRESTORE_RULES.md`). Example:

```javascript
match /properties/{propertyId} {
  // Only users with a role on this property can read/write property and subcollections
  allow read, write: if request.auth != null
    && exists(/databases/$(database)/documents/users/$(request.auth.uid)/roles/$(propertyId));

  match /reminders/{reminderId} {
    allow read, write: if request.auth != null
      && exists(/databases/$(database)/documents/users/$(request.auth.uid)/roles/$(propertyId));
  }
  // ... other subcollections (property_photos, lease_docs, etc.)
}
```

No separate top-level `reminders` rule is needed if you stay with the subcollection design.

---

## 6. How the app uses it today (alignment)

- **RemindersPage** already:
  - **Reads:** Iterates `userAccessibleProperties` and loads `properties/${property.id}/reminders`.
  - **Create:** `createDocument('properties/${propertyId}/reminders', reminderData)`.
  - **Update:** `updateDocument('properties/${reminder.property_id}/reminders', reminder.id, payload)`.
  - **Delete:** `deleteDocument('properties/${reminder.property_id}/reminders', reminder.id)`.
  - **Complete:** Recurring → add to `renewals` + `completions`, set new `start_date`; one-time → add to `completions`, set `status: false`, `completed: true`.
  - **Defer:** Append to `renewals`, set `start_date` to today.
- **IndexPage** still uses **mock** reminders; it should be updated to load from the same `properties/{id}/reminders` (e.g. aggregate from store or a small “reminders for dashboard” loader that reuses the same paths).

So the **database design** is already in place; the main gap is **IndexPage** using real Firestore reminders instead of mocks.

---

## 7. Optional: reminder templates (future)

If you later add “templates” (e.g. “Quarterly inspection”, “Annual tax”) to create reminders faster:

- **Option A – No new collection:** Store a `reminder_templates` array (or map) on a **single config document** per property, e.g. `properties/{propertyId}/config/reminders`, and create reminder documents from that.
- **Option B – Global templates:** Add a top-level collection `reminder_templates` with documents like `{ category, title, default_repeat_by, default_note }`, and create reminders under `properties/{id}/reminders` by copying from a template.

Start without templates; introduce when you have a clear UX for “create from template”.

---

## 8. Summary

| Decision | Recommendation |
|----------|----------------|
| **Location** | `properties/{propertyId}/reminders/{reminderId}` (subcollection). |
| **Core fields** | `property_id`, `category`, `start_date`, `repeat_by`, `status`, `created_date`, `created_by`; optional: `title`, `due_date`, `amount`, `note`. |
| **Action tracking** | `renewals[]` (defer history), `completions[]` (completion history), `completed` for one-time. |
| **Security** | Same as property: only users with a role on that property can read/write its reminders. |
| **Indexes** | Add single-field (or composite) indexes when you use `orderBy` / filters in queries. |
| **Next step** | Wire **IndexPage** dashboard reminders to Firestore using this same schema and paths (no new collections). |

This gives you a single, consistent database design for reminders (repeating + action tracking) that fits your current app and your product roadmap.
