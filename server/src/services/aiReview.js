const { OpenAI } = require('openai');
require('dotenv').config();

if (!process.env.NVIDIA_API_KEY) {
    console.error('⚠️  WARNING: NVIDIA_API_KEY is not set! AI reviews will fail.');
}

const client = new OpenAI({
    baseURL: 'https://integrate.api.nvidia.com/v1',
    apiKey: process.env.NVIDIA_API_KEY,
});

/**
 * Sleep for a given number of milliseconds.
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Send a pull request diff to NVIDIA AI and get structured review comments.
 * Includes retry logic with exponential backoff for rate limiting (429 errors).
 *
 * @param {string} diff - The raw unified diff from GitHub
 * @returns {{ comments: Array, summary: string }}
 */
const reviewDiff = async (diff) => {
    if (!process.env.NVIDIA_API_KEY) {
        throw new Error('NVIDIA_API_KEY environment variable is not set');
    }

    // Trim very large diffs to stay within token limits
    const trimmedDiff = diff.length > 15000 ? diff.substring(0, 15000) + '\n...(truncated)' : diff;

    console.log(`[AI Review] Sending ${trimmedDiff.length} chars to NVIDIA AI...`);

    const systemPrompt = `You are a code review API. You must respond with ONLY a JSON object. 
Do not write any text before or after the JSON.
Do not use markdown. Do not use code fences.
Your entire response must be parseable by JSON.parse().
Use exactly this structure:
{"summary":"string","issues":[{"severity":"high|medium|low","file":"string","line":0,"issue":"string","suggestion":"string"}],"approved":false}`;

    const maxRetries = 3;
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const completion = await client.chat.completions.create({
                model: 'microsoft/phi-4-mini-instruct',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: `Review this pull request diff:\n\n${trimmedDiff}` }
                ],
                temperature: 0.1,
                top_p: 0.7,
                max_tokens: 1024,
                stream: false
            });

            const raw = completion.choices[0].message.content;
            console.log(`[AI Review] Raw NVIDIA API response (first 200 chars): ${raw.substring(0, 200)}`);

            let result;
            try {
                const cleaned = raw.replace(/```json|```/g, '').trim();
                // try direct parse first
                result = JSON.parse(cleaned);
            } catch (e) {
                // fallback: try to extract JSON object from within the text
                const match = raw.match(/\{[\s\S]*\}/);
                if (match) {
                    try {
                        result = JSON.parse(match[0]);
                    } catch (innerErr) {
                        result = {
                            summary: raw.substring(0, 500),
                            issues: [],
                            approved: false
                        };
                    }
                } else {
                    // last resort: convert plain text response into our structure manually
                    result = {
                        summary: raw.substring(0, 500),
                        issues: [],
                        approved: false
                    };
                }
            }

            // --- Second Call: Optimizations ---
            const optSystemPrompt = `You are a code optimization expert. Analyze this diff and return ONLY a JSON array. Each item must have: { file, originalCode, optimizedCode, explanation, impact } where impact is 'performance', 'readability', 'security', or 'maintainability'. Return empty array if no optimizations found. No markdown, no text outside the JSON array.`;
            
            let optimizations = [];
            try {
                const optCompletion = await client.chat.completions.create({
                    model: 'microsoft/phi-4-mini-instruct',
                    messages: [
                        { role: 'system', content: optSystemPrompt },
                        { role: 'user', content: `Review this pull request diff for optimizations:\n\n${trimmedDiff}` }
                    ],
                    temperature: 0.1,
                    top_p: 0.7,
                    max_tokens: 1500,
                    stream: false
                });

                const rawOpt = optCompletion.choices[0].message.content;
                const cleanedOpt = rawOpt.replace(/```json|```/g, '').trim();
                
                try {
                    optimizations = JSON.parse(cleanedOpt);
                } catch (e) {
                    const match = rawOpt.match(/\[[\s\S]*\]/);
                    if (match) optimizations = JSON.parse(match[0]);
                }
                
                if (!Array.isArray(optimizations)) optimizations = [];
            } catch (optErr) {
                console.error(`[AI Review] Optimizations API call failed: ${optErr.message}`);
                // Don't fail the whole review if optimization fails
            }

            return {
                comments: result.issues || result.comments || [],
                summary: result.summary || 'No summary provided.',
                optimizations: optimizations
            };
        } catch (error) {
            lastError = error;
            const isRateLimit = error.status === 429 || (error.message && error.message.includes('429'));

            if (isRateLimit && attempt < maxRetries) {
                const waitTime = Math.pow(2, attempt) * 5000; // 10s, 20s, 40s
                console.warn(`[AI Review] Rate limited (attempt ${attempt}/${maxRetries}). Retrying in ${waitTime / 1000}s...`);
                await sleep(waitTime);
            } else if (!isRateLimit) {
                console.error(`[AI Review] NVIDIA API error: ${error.message}`);
                throw error;
            }
        }
    }

    console.error(`[AI Review] All ${maxRetries} attempts failed due to rate limiting.`);
    throw lastError;
};

module.exports = { reviewDiff };
