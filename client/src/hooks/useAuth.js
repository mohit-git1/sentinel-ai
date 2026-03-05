import { useState, useEffect } from 'react';

/**
 * Custom hook for managing authentication state.
 * Reads the token and user from localStorage on mount.
 */
export function useAuth() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const token = localStorage.getItem('sentinel_token');
            const storedUser = localStorage.getItem('sentinel_user');

            if (token && storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Auth state error:', error);
            localStorage.removeItem('sentinel_token');
            localStorage.removeItem('sentinel_user');
        } finally {
            setLoading(false);
        }
    }, []);

    return { user, loading };
}
