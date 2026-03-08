const mongoose = require('mongoose');
require('dotenv').config();

(async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('./src/models/User');
    
    // Use mohit-git1's token since they own the repo
    const user = await User.findOne({ username: 'mohit-git1' });
    if (!user) {
        console.log('mohit-git1 user not found');
        process.exit(1);
    }
    const token = user.accessToken;
    
    const owner = 'mohit-git1';
    const repo = 'testing-repo';
    
    // 1. Get the default branch's latest commit SHA
    const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/main`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json' }
    });
    
    if (!refRes.ok) {
        console.log('Failed to get ref:', refRes.status, await refRes.text());
        process.exit(1);
    }
    
    const refData = await refRes.json();
    const sha = refData.object.sha;
    console.log('Base commit SHA:', sha);
    
    // 2. Create a new branch
    const branchName = 'test-sentinel-ai-' + Date.now();
    const branchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: sha })
    });
    
    if (!branchRes.ok) {
        console.log('Failed to create branch:', branchRes.status, await branchRes.text());
        process.exit(1);
    }
    console.log('Created branch:', branchName);
    
    // 3. Create a file with intentional issues
    const code = `// Test file for Sentinel AI review

function add(a, b) {
    return a + b;
}

// Missing input validation - division by zero risk
function divide(a, b) {
    return a / b;
}

// Potential SQL injection vulnerability
function getUser(userInput) {
    const query = "SELECT * FROM users WHERE name = '" + userInput + "'";
    return db.execute(query);
}

// Unused variable and missing error handling
function fetchData(url) {
    const result = fetch(url);
    const unused = 42;
    return result;
}

module.exports = { add, divide, getUser, fetchData };
`;
    
    const fileContent = Buffer.from(code).toString('base64');
    
    const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/test-review.js`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: 'Add test file for AI review',
            content: fileContent,
            branch: branchName
        })
    });
    
    if (!fileRes.ok) {
        console.log('Failed to create file:', fileRes.status, await fileRes.text());
        process.exit(1);
    }
    console.log('Created test file on branch');
    
    // 4. Create a Pull Request
    const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: 'Test PR for Sentinel AI Review',
            head: branchName,
            base: 'main',
            body: 'This PR tests the Sentinel AI code review pipeline. It contains intentional issues for the AI to detect.'
        })
    });
    
    if (!prRes.ok) {
        console.log('Failed to create PR:', prRes.status, await prRes.text());
        process.exit(1);
    }
    
    const prData = await prRes.json();
    console.log('Created PR #' + prData.number + ': ' + prData.title);
    console.log('PR URL:', prData.html_url);
    
    await mongoose.disconnect();
})();
