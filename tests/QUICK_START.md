# Quick Start Guide for Testing

## Prerequisites

Before running tests, install the required dependencies:

```bash
npm install --save-dev vitest @vue/test-utils jsdom @vitest/ui @vitejs/plugin-vue
```

## Running Tests

### 1. Run all tests in watch mode
```bash
npm test
```

### 2. Run tests once (CI mode)
```bash
npm run test:run
```

### 3. Run tests with UI
```bash
npm run test:ui
```

### 4. Generate coverage report
```bash
npm run test:coverage
```

## Test Structure

```
tests/
├── setup.js                          # Global test configuration
├── unit/                             # Unit tests
│   ├── utils/                       # Utility tests
│   ├── composables/                 # Composable tests
│   ├── stores/                      # Store tests
│   ├── components/                  # Component tests
│   └── boot/                        # Boot file tests
├── integration/                     # Integration tests
└── e2e/                             # End-to-end tests
```

## What's Tested

✅ **Utilities**: Property ID normalization and comparison  
✅ **Composables**: Firebase integration (`useFirebase`)  
✅ **Stores**: User data store (Pinia)  
✅ **Components**: Authentication component  
✅ **Session Management**: Session timeout utilities  
✅ **Integration**: Firebase authentication flows  
✅ **Routes**: Router configuration  

## Troubleshooting

### Tests fail with "Cannot find module"
Install missing dependencies:
```bash
npm install --save-dev vitest @vue/test-utils jsdom
```

### Firebase mocks not working
Check that `tests/setup.js` is properly configured and imported in `vitest.config.js`.

### Component tests fail
Ensure Quasar is properly mocked in `tests/setup.js`.

## Next Steps

1. Install dependencies: `npm install --save-dev vitest @vue/test-utils jsdom`
2. Run tests: `npm test`
3. Review coverage: `npm run test:coverage`
4. Add more tests as needed
