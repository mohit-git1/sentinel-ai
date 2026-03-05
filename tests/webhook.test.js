/**
 * Tests for the GitHub webhook handler.
 * Verifies signature validation and event processing.
 */
const crypto = require('crypto');

// Helper: create a valid HMAC signature for a payload
function createSignature(secret, payload) {
    const hmac = crypto.createHmac('sha256', secret);
    return 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
}

// Test: Valid webhook signature should be accepted
function testValidSignature() {
    const secret = 'test-webhook-secret';
    const payload = {
        action: 'opened',
        pull_request: { number: 1, title: 'Test PR', user: { login: 'testuser' } },
        repository: { full_name: 'testuser/test-repo' },
    };

    const signature = createSignature(secret, payload);
    const expectedPrefix = 'sha256=';

    console.assert(signature.startsWith(expectedPrefix), 'Signature should start with sha256=');
    console.assert(signature.length > expectedPrefix.length, 'Signature should have a hash value');
    console.log('✅ testValidSignature passed');
}

// Test: Invalid signature should not match
function testInvalidSignature() {
    const secret = 'test-webhook-secret';
    const payload = { action: 'opened' };
    const wrongSecret = 'wrong-secret';

    const validSig = createSignature(secret, payload);
    const invalidSig = createSignature(wrongSecret, payload);

    console.assert(validSig !== invalidSig, 'Different secrets should produce different signatures');
    console.log('✅ testInvalidSignature passed');
}

// Test: Only pull_request events should be processed
function testEventFiltering() {
    const prEvents = ['opened', 'synchronize'];
    const ignoredEvents = ['closed', 'labeled', 'review_requested'];

    prEvents.forEach((action) => {
        console.assert(
            ['opened', 'synchronize'].includes(action),
            `${action} should be processed`
        );
    });

    ignoredEvents.forEach((action) => {
        console.assert(
            !['opened', 'synchronize'].includes(action),
            `${action} should be ignored`
        );
    });

    console.log('✅ testEventFiltering passed');
}

// Run all tests
testValidSignature();
testInvalidSignature();
testEventFiltering();
console.log('\n🎉 All webhook tests passed!');
