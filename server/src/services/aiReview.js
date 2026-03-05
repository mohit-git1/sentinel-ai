const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Send a pull request diff to GPT-4o-mini and get structured review comments.
 *
 * The prompt instructs the model to act as a senior code reviewer and return
 * a JSON object with `comments` (array) and `summary` (string).
 *
 * @param {string} diff - The raw unified diff from GitHub
 * @returns {{ comments: Array, summary: string }}
 */
const reviewDiff = async (diff) => {
    // Trim very large diffs to stay within token limits
    const trimmedDiff = diff.length > 15000 ? diff.substring(0, 15000) + '\n...(truncated)' : diff;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `You are a senior software engineer reviewing a GitHub pull request.
Analyze the diff and return a JSON object with:
- "comments": an array of issues found, each with:
  - "file": the file path
  - "line": the approximate line number
  - "issue": what you found (be specific)
  - "suggestion": how to fix it
  - "type": one of "bug", "style", "performance", "security", "suggestion"
- "summary": a 2–3 sentence plain-English summary of the PR quality

Focus on:
1. Bugs and logic errors
2. Security vulnerabilities
3. Performance issues
4. Code style and best practices
5. Missing error handling
6. Test suggestions

Be concise. Only flag real issues, not nitpicks. Return valid JSON only.`,
            },
            {
                role: 'user',
                content: `Review this pull request diff:\n\n${trimmedDiff}`,
            },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content);

    return {
        comments: result.comments || [],
        summary: result.summary || 'No summary provided.',
    };
};

module.exports = { reviewDiff };
