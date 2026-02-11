# Test Suite Documentation

This directory contains comprehensive tests for the project.

## Test Structure

```
tests/
├── setup.js                    # Test setup and global mocks
├── unit/                       # Unit tests
│   ├── utils/                 # Utility function tests
│   ├── composables/           # Composable tests
│   ├── stores/                # Pinia store tests
│   ├── components/             # Vue component tests
│   └── boot/                   # Boot file tests
├── integration/                # Integration tests
└── e2e/                        # End-to-end tests
```

## Running Tests

### Run all tests in watch mode
```bash
npm test
```

### Run tests once
```bash
npm run test:run
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Coverage

The test suite covers:

- **Utilities**: Property ID normalization and comparison utilities
- **Composables**: Firebase integration composable (`useFirebase`)
- **Stores**: Pinia store for user data management
- **Components**: Vue components (FirebaseAuth, etc.)
- **Integration**: Firebase authentication and data flow
- **Routes**: Router configuration and route structure
- **Session Management**: Session timeout and management utilities

## Writing New Tests

### Unit Test Example

```javascript
import { describe, it, expect } from 'vitest'
import { myFunction } from '@/utils/myUtils'

describe('myFunction', () => {
  it('should do something', () => {
    expect(myFunction('input')).toBe('expected')
  })
})
```

### Component Test Example

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('should render correctly', () => {
    const wrapper = mount(MyComponent)
    expect(wrapper.text()).toContain('Expected Text')
  })
})
```

## Mocking

Firebase and other external dependencies are mocked in `tests/setup.js`. When writing new tests, ensure you mock external dependencies appropriately.

## Coverage Goals

- Unit tests: >80% coverage
- Integration tests: Cover critical user flows
- Component tests: Cover all major components
