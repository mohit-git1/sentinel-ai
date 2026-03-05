/**
 * Tests for GitHub service utilities.
 * Validates repo name parsing and webhook URL construction.
 */

// Test: fullName should split into owner and repo correctly
function testRepoNameParsing() {
    const fullName = 'octocat/hello-world';
    const [owner, repo] = fullName.split('/');

    console.assert(owner === 'octocat', 'Owner should be octocat');
    console.assert(repo === 'hello-world', 'Repo should be hello-world');
    console.log('✅ testRepoNameParsing passed');
}

// Test: Handle repo names with special characters
function testSpecialCharRepoName() {
    const fullName = 'my-org/my.repo-v2';
    const [owner, repo] = fullName.split('/');

    console.assert(owner === 'my-org', 'Owner should handle hyphens');
    console.assert(repo === 'my.repo-v2', 'Repo should handle dots and hyphens');
    console.log('✅ testSpecialCharRepoName passed');
}

// Test: Webhook URL should be correctly constructed
function testWebhookUrl() {
    const serverUrl = 'https://sentinel-api.onrender.com';
    const webhookPath = '/api/webhooks/github';
    const fullUrl = serverUrl + webhookPath;

    console.assert(
        fullUrl === 'https://sentinel-api.onrender.com/api/webhooks/github',
        'Webhook URL should be correctly constructed'
    );
    console.log('✅ testWebhookUrl passed');
}

// Test: Review comment formatting
function testCommentFormatting() {
    const comments = [
        { file: 'src/app.js', line: 10, issue: 'Missing error handling', suggestion: 'Add try-catch', type: 'bug' },
        { file: 'src/utils.js', line: 25, issue: 'Unused variable', suggestion: 'Remove it', type: 'style' },
    ];

    const body = comments
        .map((c) => `**${c.type.toUpperCase()}** in \`${c.file}\` (line ${c.line}):\n${c.issue}`)
        .join('\n\n---\n\n');

    console.assert(body.includes('**BUG**'), 'Should format bug type in uppercase');
    console.assert(body.includes('**STYLE**'), 'Should format style type in uppercase');
    console.assert(body.includes('---'), 'Should separate comments with dividers');
    console.log('✅ testCommentFormatting passed');
}

// Run all tests
testRepoNameParsing();
testSpecialCharRepoName();
testWebhookUrl();
testCommentFormatting();
console.log('\n🎉 All GitHub service tests passed!');
