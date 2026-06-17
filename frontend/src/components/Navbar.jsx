import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        StoreRate<span>.</span>
      </div>

      <div className="navbar-actions">
        {user && (
          <>
            <span className="nav-role-badge">{user.role.replace('_', ' ')}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {user.name.split(' ')[0]}
            </span>
          </>
        )}

        <button className="theme-toggle" onClick={toggle} title="Toggle theme">
          {theme === 'dark' ? '☀' : '☾'}
        </button>

        {user && (
          <button className="btn btn-ghost btn-sm" onClick={logout}>
            Sign out
          </button>
        )}
      </div>
    </nav>
  );
}
