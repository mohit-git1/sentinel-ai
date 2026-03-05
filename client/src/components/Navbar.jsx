import { Link, useNavigate } from 'react-router-dom';

/**
 * Top navigation bar — shown on all authenticated pages.
 * Displays the Sentinel AI logo, nav links, and user avatar.
 */
function Navbar({ user }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('sentinel_token');
        localStorage.removeItem('sentinel_user');
        navigate('/login');
        window.location.reload();
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-surface-light/80 backdrop-blur-xl border-b border-slate-700/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:shadow-brand-500/40 transition-shadow">
                            <span className="text-white text-sm font-bold">S</span>
                        </div>
                        <span className="text-lg font-semibold text-white">
                            Sentinel <span className="text-brand-400">AI</span>
                        </span>
                    </Link>

                    {/* Right side */}
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="text-slate-300 hover:text-white text-sm font-medium transition-colors"
                        >
                            Dashboard
                        </Link>
                        <div className="flex items-center gap-3">
                            <img
                                src={user.avatarUrl}
                                alt={user.username}
                                className="w-8 h-8 rounded-full ring-2 ring-slate-600"
                            />
                            <span className="text-sm text-slate-300 hidden sm:inline">{user.username}</span>
                            <button
                                onClick={handleLogout}
                                className="text-slate-400 hover:text-red-400 text-sm font-medium transition-colors ml-2"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
