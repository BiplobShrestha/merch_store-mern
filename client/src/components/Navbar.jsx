import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <img src="/assets/logo.png" alt="Merch Store" className="brand-logo" />
      </Link>

      <div className="navbar-right">
        <Link to="/" className={`nav-link-icon${isActive('/') ? ' active' : ''}`}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 01-8 0" />
          </svg>
          Shop
        </Link>

        {user && (
          <Link to="/cart" className={`nav-link-icon${isActive('/cart') ? ' active' : ''}`}>
            <span className="cart-icon-wrap">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" />
              </svg>
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </span>
            Cart
          </Link>
        )}

        {user && (
          <Link to="/orders" className={`nav-link-icon${isActive('/orders') ? ' active' : ''}`}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 2h6a1 1 0 011 1v2H8V3a1 1 0 011-1z" />
              <rect x="5" y="4" width="14" height="18" rx="2" />
              <path d="M9 11h6M9 15h6" />
            </svg>
            Orders
          </Link>
        )}

        {user?.role === 'admin' && (
          <Link to="/admin" className="champ-btn">Champ</Link>
        )}

        {!user && location.pathname !== '/login' && <Link to="/login" className="nav-link-icon">Login</Link>}
        {!user && location.pathname !== '/register' && <Link to="/register" className="nav-link-icon">Register</Link>}

        {user && (
          <div className="profile-wrap" ref={menuRef}>
            <button className="profile-avatar" onClick={() => setMenuOpen((o) => !o)} aria-label="Account menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
            </button>
            {menuOpen && (
              <div className="profile-dropdown">
                <div className="profile-dropdown-name">{user.name}</div>
                <button className="profile-dropdown-item" onClick={() => setMenuOpen(false)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
                  </svg>
                  Profile
                </button>
                <button className="profile-dropdown-item logout" onClick={handleLogout}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                    <path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
                  </svg>
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
