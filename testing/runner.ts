// Import test functions
import { testMergeCVInfoContentWithCore } from './tests/cv-converter.test';

// Test registry - add new tests here
const TESTS: Record<string, () => Promise<void> | void> = {
    'merge-cv-info': testMergeCVInfoContentWithCore,
};

async function runTest(testName: string) {
    const testFn = TESTS[testName];

    if (!testFn) {
        console.error(`❌ Test "${testName}" not found.`);
        console.log('Available tests:', Object.keys(TESTS).join(', '));
        process.exit(1);
    }

    console.log(`🧪 Running test: ${testName}`);

    try {
        await testFn();
        console.log(`✅ Test "${testName}" passed!`);
    } catch (error) {
        console.error(`❌ Test "${testName}" failed:`);
        console.error(error);
        process.exit(1);
    }
}

// Get test name from command line args
const testName = process.argv[2];

if (!testName) {
    console.log('Usage: npm run test <test-name>');
    console.log('Available tests:', Object.keys(TESTS).join(', '));
    process.exit(1);
}

runTest(testName);
