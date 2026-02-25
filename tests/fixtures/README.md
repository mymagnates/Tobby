# Test Fixtures

Centralized test data for Handout project.

## Structure

| File | Purpose |
|------|---------|
| `storeSeed.js` | Pre-seeded in-memory store for backend API tests. Use `createSeededStore()` with `createApiServer({ store })`. |
| `domainFixtures.js` | Domain fixtures for MVP rules: opportunities, proposals, assignments, invoices, SP profiles. |
| `firestoreSamples.json` | Firestore-compatible documents for integration tests. Paths follow project Firestore structure. |

## Usage

### Backend API tests (storeSeed)

```js
import { createApiServer } from '../../backend/apiServer.js'
import { createSeededStore } from '../fixtures/storeSeed.js'

const { server, store } = createApiServer({ store: createSeededStore() })
// store now has tasks (task-1, task-2), inventories, spCards, invoices
```

### Domain rules tests (domainFixtures)

```js
import { invoiceFixtures, validInvoiceSubmissionPayload } from '../fixtures/domainFixtures.js'
import { validateInvoiceSubmission } from '../../src/domain/mvp/index.js'

// Use fixtures in mvpRules tests
const validation = validateInvoiceSubmission(validInvoiceSubmissionPayload)
```

### Frontend / utils (src/utils/testData.js)

```js
import {
  generateTestProperties,
  generateTestLeases,
  generateTestTransactions,
  generateAllTestData,
} from '@/utils/testData'
```

## Firestore Samples

`firestoreSamples.json` documents can be imported for local emulator or integration tests. Subcollections use `{propertyId}` placeholder—replace with actual property ID when seeding.
