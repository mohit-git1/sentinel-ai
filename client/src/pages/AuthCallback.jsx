import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Handles the OAuth callback redirect from GitHub.
 * Receives the JWT token from the backend redirect,
 * stores the token, and redirects to the dashboard.
 */
function AuthCallback() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        // Save the token provided by the backend redirect
        localStorage.setItem('sentinel_token', token);
        
        // Use window.location.href to force a full page reload.
        // This ensures the useAuth hook runs fresh and detects the new token.
        window.location.href = '/';
    }, [searchParams]);

    return (
        <div className="min-h-screen bg-surface flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Authenticating with GitHub...</p>
            </div>
        </div>
    );
}

export default AuthCallback;
