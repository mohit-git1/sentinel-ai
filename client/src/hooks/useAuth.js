import { useState, useEffect } from 'react';

/**
 * Custom hook for managing authentication state.
 * On mount, reads token from localStorage and validates it with the backend.
 * If the token is valid, auto-logs the user in without prompting for login.
 * If the token is expired or invalid, clears it and sends user to login.
 */
export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateSession = async () => {
            try {
                const token = localStorage.getItem('sentinel_token');

                if (!token) {
                    setLoading(false);
                    return;
                }

                // Validate the JWT with the backend to make sure it's still valid
                const res = await fetch('/api/auth/me', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (res.ok) {
                    const serverUser = await res.json();
                    // Update stored user with fresh data from the server
                    const userData = {
                        id: serverUser._id,
                        username: serverUser.username,
                        avatarUrl: serverUser.avatarUrl,
                    };
                    localStorage.setItem('sentinel_user', JSON.stringify(userData));
                    setUser(userData);
                } else {
                    // Token expired or invalid — clear everything
                    console.warn('Session expired. Please log in again.');
                    localStorage.removeItem('sentinel_token');
                    localStorage.removeItem('sentinel_user');
                }
            } catch (error) {
                console.error('Auth validation error:', error);
                // On network error, use cached user data so the app doesn't break
                // (e.g. backend temporarily unreachable)
                const storedUser = localStorage.getItem('sentinel_user');
                if (storedUser) {
                    try {
                        setUser(JSON.parse(storedUser));
                    } catch {
                        localStorage.removeItem('sentinel_token');
                        localStorage.removeItem('sentinel_user');
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        validateSession();
    }, []);

    const logout = () => {
        localStorage.removeItem('sentinel_token');
        localStorage.removeItem('sentinel_user');
        setUser(null);
    };

    return { user, loading, logout };
}
