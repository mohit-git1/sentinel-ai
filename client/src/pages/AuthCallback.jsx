import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * Handles the OAuth callback redirect from GitHub.
 * Exchanges the authorization code for a JWT token via the backend,
 * stores the token, and redirects to the dashboard.
 */
function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get('code');
        if (!code) {
            navigate('/login');
            return;
        }

        const exchangeCode = async () => {
            try {
                const res = await fetch(`/api/auth/github/callback?code=${code}`);
                const data = await res.json();

                if (data.token) {
                    localStorage.setItem('sentinel_token', data.token);
                    localStorage.setItem('sentinel_user', JSON.stringify(data.user));
                    navigate('/');
                } else {
                    console.error('Auth failed:', data.error);
                    navigate('/login');
                }
            } catch (error) {
                console.error('Auth error:', error);
                navigate('/login');
            }
        };

        exchangeCode();
    }, [searchParams, navigate]);

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
