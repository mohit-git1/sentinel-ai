/**
 * Authenticated fetch wrapper.
 * Automatically attaches the JWT Bearer token from localStorage
 * and sets Content-Type to JSON for POST/PUT/PATCH requests.
 *
 * @param {string} url  - API endpoint path (e.g. '/api/repos')
 * @param {object} opts - Fetch options (method, body, etc.)
 * @returns {Promise<any>} Parsed JSON response
 */
export async function api(url, opts = {}) {
    const token = localStorage.getItem('sentinel_token');

    const headers = {
        ...(opts.headers || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Set JSON content type for requests with a body
    if (opts.body && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    const baseURL = import.meta.env.VITE_API_URL || '';
    const res = await fetch(`${baseURL}${url}`, { ...opts, headers });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${res.status}`);
    }

    return res.json();
}
