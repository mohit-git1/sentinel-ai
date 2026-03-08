const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

if (!process.env.GEMINI_API_KEY) {
    console.error('⚠️  WARNING: GEMINI_API_KEY is not set! AI reviews will fail.');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Sleep for a given number of milliseconds.
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Send a pull request diff to Gemini and get structured review comments.
 * Includes retry logic with exponential backoff for rate limiting (429 errors).
 *
 * @param {string} diff - The raw unified diff from GitHub
 * @returns {{ comments: Array, summary: string }}
 */
const reviewDiff = async (diff) => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    // Trim very large diffs to stay within token limits
    const trimmedDiff = diff.length > 15000 ? diff.substring(0, 15000) + '\n...(truncated)' : diff;

    console.log(`[AI Review] Sending ${trimmedDiff.length} chars to Gemini...`);

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

    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const result = await model.generateContent([
                { text: systemPrompt },
                { text: `Review this pull request diff:\n\n${trimmedDiff}` },
            ]);

            const response = result.response.text();
            console.log(`[AI Review] Raw Gemini response (first 200 chars): ${response.substring(0, 200)}`);

            const parsed = JSON.parse(response);

            return {
                comments: parsed.comments || [],
                summary: parsed.summary || 'No summary provided.',
            };
        } catch (error) {
            lastError = error;
            const isRateLimit = error.message && error.message.includes('429');

            if (isRateLimit && attempt < maxRetries) {
                const waitTime = Math.pow(2, attempt) * 5000; // 10s, 20s, 40s
                console.warn(`[AI Review] Rate limited (attempt ${attempt}/${maxRetries}). Retrying in ${waitTime / 1000}s...`);
                await sleep(waitTime);
            } else if (!isRateLimit) {
                console.error(`[AI Review] Gemini API error: ${error.message}`);
                throw error;
            }
        }
    }

    console.error(`[AI Review] All ${maxRetries} attempts failed due to rate limiting.`);
    throw lastError;
};

module.exports = { reviewDiff };
