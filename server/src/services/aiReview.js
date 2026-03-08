const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Send a pull request diff to Gemini and get structured review comments.
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

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
        },
    });

    const systemPrompt = `You are a senior software engineer reviewing a GitHub pull request.
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

Be concise. Only flag real issues, not nitpicks. Return valid JSON only.`;

    const result = await model.generateContent([
        { text: systemPrompt },
        { text: `Review this pull request diff:\n\n${trimmedDiff}` },
    ]);

    const response = result.response.text();
    const parsed = JSON.parse(response);

    return {
        comments: parsed.comments || [],
        summary: parsed.summary || 'No summary provided.',
    };
};

module.exports = { reviewDiff };
