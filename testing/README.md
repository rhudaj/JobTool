# Test Framework

This is a simple test framework for the JobTool2 project.

## Running Tests

To run a test by name:
```bash
npm run test <test-name>
```

Example:
```bash
npm run test merge-cv-info
```

## Available Tests

- `merge-cv-info`: Tests the `mergeCVInfoContentWithCore` function

## Adding New Tests

1. Create a new test function in `tests/cv-converter.test.ts` (or create a new test file)
2. Add your test function to the `TESTS` registry in `tests/runner.ts`

### Example: Adding a new test

1. In `tests/cv-converter.test.ts`, add:
```typescript
export async function testMyNewFeature() {
    console.log('🧪 Testing my new feature...');
    // Your test logic here
    console.log('✅ Feature test completed!');
}
```

2. In `tests/runner.ts`, add to the TESTS object:
```typescript
const TESTS: Record<string, () => Promise<void> | void> = {
    'merge-cv-info': testMergeCVInfoContentWithCore,
    'my-new-test': testMyNewFeature,  // Add this line
};
```

3. Run your test:
```bash
npm run test my-new-test
```

## Test Output

Tests write their output to `tests/tmp.json` for inspection.
