import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RepoDetail from './pages/RepoDetail';
import Navbar from './components/Navbar';
import AuthCallback from './pages/AuthCallback';

function App() {
    const { user, loading, logout } = useAuth();
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark');
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    if (loading) {
        return (
            <div className="app-shell flex min-h-screen items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-brand-700 dark:border-brand-200"></div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            {user && <Navbar user={user} onLogout={logout} theme={theme} onToggleTheme={toggleTheme} />}
            <Routes>
                <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
                <Route path="/repo/:id" element={user ? <RepoDetail /> : <Navigate to="/login" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
