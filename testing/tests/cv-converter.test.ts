import * as fs from 'fs';
import * as path from 'path';
import { mergeCVInfoContentWithCore } from '../../src/lib/cv-converter';
import { CVInfoContent, CVCore } from '../../src/lib/types';

export async function testMergeCVInfoContentWithCore() {
    console.log('📁 Loading test data...');

    // Load the test data files
    const cvInfoPath = path.join(__dirname, '../../public/samples/cv_info.json');
    const cvCorePath = path.join(__dirname, '../../public/samples/cv_core.json');

    if (!fs.existsSync(cvInfoPath)) {
        throw new Error(`CV Info file not found: ${cvInfoPath}`);
    }

    if (!fs.existsSync(cvCorePath)) {
        throw new Error(`CV Core file not found: ${cvCorePath}`);
    }

    const cvInfoContent: CVInfoContent = JSON.parse(fs.readFileSync(cvInfoPath, 'utf-8'));
    const cvCore: CVCore = JSON.parse(fs.readFileSync(cvCorePath, 'utf-8'));

    console.log('🔄 Calling mergeCVInfoContentWithCore...');

    // Call the function we're testing
    const result = mergeCVInfoContentWithCore(cvInfoContent, cvCore);

    console.log('💾 Writing result to tmp.json...');

    // Write the result to tmp.json in the tests directory
    const outputPath = path.join(__dirname, 'tmp.json');
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

    console.log(`📝 Result written to: ${outputPath}`);

    // Basic validation - ensure we got something back
    if (!result || typeof result !== 'object') {
        throw new Error('Expected result to be an object');
    }

    console.log('✨ Test completed successfully!');
}
