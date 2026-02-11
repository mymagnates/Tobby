# Developer Action Plan - Test Suite Implementation

## Objective
Install test dependencies, fix identified issues, and execute the full test suite to ensure all tests pass.

---

## Phase 1: Install Dependencies (CRITICAL)

### Step 1.1: Install Test Dependencies
```bash
cd /Users/MacAirEZ/Desktop/projectTobby
npm install --save-dev vitest @vue/test-utils jsdom @vitest/ui @vitejs/plugin-vue @vitest/coverage-v8
```

### Step 1.2: Verify Installation
```bash
npm list vitest @vue/test-utils jsdom
```

**Expected**: All packages should be listed without errors.

---

## Phase 2: Fix Configuration Issues

### Step 2.1: Update package.json
Ensure `@vitejs/plugin-vue` is in devDependencies (should be added in Step 1.1).

### Step 2.2: Verify vitest.config.js
Check that `vitest.config.js` exists and is properly configured. File should already exist at root.

### Step 2.3: Verify tests/setup.js
Check that `tests/setup.js` exists and mocks are properly configured.

---

## Phase 3: Fix Mock Path Issues

### Step 3.1: Fix tests/setup.js Mock Paths
**File**: `tests/setup.js`
**Issue**: Mock path may be incorrect
**Action**: Verify the mock path `../../src/boot/firebase` is correct relative to `tests/setup.js`

### Step 3.2: Fix Test File Mock Paths
**Files to check**:
- `tests/unit/composables/useFirebase.test.js`
- `tests/unit/stores/userDataStore.test.js`
- `tests/integration/firebase-integration.test.js`

**Action**: Verify all mock paths use correct relative paths from test file location.

---

## Phase 4: Run Initial Test Execution

### Step 4.1: Run Tests
```bash
npm run test:run
```

### Step 4.2: Document Errors
Capture all errors and failures:
- Import errors
- Mock errors
- Test failures
- Configuration errors

### Step 4.3: Fix Identified Issues
Address each error systematically:
1. Fix import paths
2. Fix mock implementations
3. Fix test assertions
4. Fix configuration issues

---

## Phase 5: Fix Quasar Component Mocking

### Step 5.1: Check Quasar Component Tests
**File**: `tests/unit/components/FirebaseAuth.test.js`

**Issue**: Quasar components (`q-card`, `q-input`, `q-btn`, etc.) may not render properly in tests.

**Solutions**:
1. Option A: Install Quasar test utilities (if available)
   ```bash
   npm install --save-dev @quasar/quasar-app-extension-testing-unit-vitest
   ```

2. Option B: Create custom Quasar component mocks in `tests/setup.js`:
   ```javascript
   // Add to tests/setup.js
   config.global.stubs = {
     'q-card': true,
     'q-card-section': true,
     'q-input': true,
     'q-btn': true,
     'q-form': true,
     'q-dialog': true,
     'q-banner': true,
     'q-icon': true,
     // Add other Quasar components as needed
   }
   ```

### Step 5.2: Update Component Tests
Update `FirebaseAuth.test.js` to work with mocked Quasar components.

---

## Phase 6: Enhance Firebase Mocks

### Step 6.1: Improve Mock Implementations
**Files**: All test files using Firebase mocks

**Enhancements Needed**:
1. Make `onSnapshot` return realistic data structures
2. Make `getDoc` return proper document structure with `exists()` method
3. Make `addDoc` return document reference with `id`
4. Add error simulation capabilities

**Example Enhancement**:
```javascript
// In test files, enhance mocks like this:
getDoc.mockResolvedValue({
  exists: () => true,
  id: 'doc123',
  data: () => ({ name: 'Test' })
})
```

---

## Phase 7: Run Full Test Suite

### Step 7.1: Run All Tests
```bash
npm run test:run
```

### Step 7.2: Generate Coverage Report
```bash
npm run test:coverage
```

### Step 7.3: Review Coverage
- Check coverage percentage
- Identify uncovered code paths
- Add tests for uncovered areas if needed

---

## Phase 8: Fix Remaining Test Failures

### Step 8.1: Categorize Failures
Group failures by type:
- Import/module errors
- Mock errors
- Assertion failures
- Async/timing issues

### Step 8.2: Fix Each Category
1. Fix import errors first
2. Fix mock errors second
3. Fix assertion failures third
4. Fix async issues last

### Step 8.3: Re-run Tests
After each fix, re-run tests to verify:
```bash
npm run test:run
```

---

## Phase 9: Validation & Documentation

### Step 9.1: Final Test Run
```bash
npm run test:run
```

**Success Criteria**:
- ✅ All tests pass
- ✅ No errors or warnings
- ✅ Coverage report generated

### Step 9.2: Generate Final Coverage Report
```bash
npm run test:coverage
```

### Step 9.3: Document Results
Create `TEST_EXECUTION_RESULTS.md` with:
- Test execution summary
- Coverage metrics
- Any remaining issues
- Recommendations for future improvements

---

## Common Issues & Solutions

### Issue 1: "Cannot find module 'vitest'"
**Solution**: Run `npm install --save-dev vitest`

### Issue 2: "Cannot find module '@vue/test-utils'"
**Solution**: Run `npm install --save-dev @vue/test-utils`

### Issue 3: "Quasar components not rendering"
**Solution**: Add Quasar component stubs to `tests/setup.js` (see Phase 5)

### Issue 4: "Firebase mocks not working"
**Solution**: Verify mock paths and enhance mock implementations (see Phase 6)

### Issue 5: "Async test failures"
**Solution**: Ensure proper use of `await` and `vi.waitFor()` for async operations

### Issue 6: "Pinia store not initialized"
**Solution**: Ensure `setActivePinia(createPinia())` is called in `beforeEach`

---

## Expected Test Results

After successful execution:
- **Total Tests**: ~95-125 test cases
- **Passing**: All tests should pass
- **Coverage**: Target 80%+ coverage
- **Duration**: Tests should complete in < 30 seconds

---

## Files to Modify

1. `package.json` - Add dependencies (auto-updated by npm install)
2. `tests/setup.js` - Fix mock paths, add Quasar stubs
3. `tests/unit/components/FirebaseAuth.test.js` - Fix Quasar component handling
4. `tests/unit/composables/useFirebase.test.js` - Enhance Firebase mocks
5. `tests/unit/stores/userDataStore.test.js` - Enhance Firebase mocks
6. `tests/integration/firebase-integration.test.js` - Enhance Firebase mocks

---

## Success Checklist

- [ ] All dependencies installed
- [ ] All tests can execute (no import errors)
- [ ] All tests pass
- [ ] Coverage report generated
- [ ] Coverage > 80%
- [ ] No console errors or warnings
- [ ] Documentation updated

---

## Notes

- Work through phases sequentially
- Test after each major change
- Document any issues encountered
- Keep test execution logs for reference

---

**Ready for Execution**: Yes  
**Estimated Time**: 1-2 hours  
**Priority**: High
