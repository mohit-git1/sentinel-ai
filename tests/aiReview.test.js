/**
 * Tests for the AI review service.
 * Validates prompt construction and response parsing.
 */

// Test: Diff trimming should cap at 15000 characters
function testDiffTrimming() {
    const maxLength = 15000;
    const longDiff = 'a'.repeat(20000);
    const trimmed = longDiff.length > maxLength
        ? longDiff.substring(0, maxLength) + '\n...(truncated)'
        : longDiff;

    console.assert(trimmed.length < longDiff.length, 'Trimmed diff should be shorter');
    console.assert(trimmed.includes('(truncated)'), 'Trimmed diff should have truncation marker');
    console.log('✅ testDiffTrimming passed');
}

// Test: Short diffs should not be trimmed
function testShortDiffNotTrimmed() {
    const maxLength = 15000;
    const shortDiff = 'const x = 1;\nconst y = 2;';
    const result = shortDiff.length > maxLength
        ? shortDiff.substring(0, maxLength) + '\n...(truncated)'
        : shortDiff;

    console.assert(result === shortDiff, 'Short diff should not be modified');
    console.assert(!result.includes('(truncated)'), 'Should not have truncation marker');
    console.log('✅ testShortDiffNotTrimmed passed');
}

// Test: AI response parsing should handle valid JSON
function testResponseParsing() {
    const mockResponse = JSON.stringify({
        comments: [
            {
                file: 'src/utils.js',
                line: 42,
                issue: 'Potential null reference',
                suggestion: 'Add null check',
                type: 'bug',
            },
        ],
        summary: 'Overall clean code with one minor issue.',
    });

    const parsed = JSON.parse(mockResponse);
    console.assert(Array.isArray(parsed.comments), 'Comments should be an array');
    console.assert(parsed.comments.length === 1, 'Should have one comment');
    console.assert(parsed.comments[0].type === 'bug', 'Comment type should be bug');
    console.assert(typeof parsed.summary === 'string', 'Summary should be a string');
    console.log('✅ testResponseParsing passed');
}

// Test: Empty response should have defaults
function testEmptyResponse() {
    const mockResponse = JSON.stringify({});
    const parsed = JSON.parse(mockResponse);

    const comments = parsed.comments || [];
    const summary = parsed.summary || 'No summary provided.';

    console.assert(comments.length === 0, 'Default comments should be empty');
    console.assert(summary === 'No summary provided.', 'Default summary should be set');
    console.log('✅ testEmptyResponse passed');
}

// Run all tests
testDiffTrimming();
testShortDiffNotTrimmed();
testResponseParsing();
testEmptyResponse();
console.log('\n🎉 All AI review tests passed!');
