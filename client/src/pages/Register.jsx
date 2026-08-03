import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [socialNote, setSocialNote] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleSocial = (provider) => {
    setSocialNote(`${provider} sign-up is coming soon — use email for now.`);
  };

  return (
    <div className="auth-page">
      <div className="auth-split">
        <div className="auth-illustration">
          <img src="/assets/login-illustration.png" alt="" />
        </div>

        <div className="auth-form-panel">
        <div className="auth-card">
          <h1>Create your account</h1>
          <p className="auth-subtitle">Join to shop the store, track orders, and leave ratings.</p>

          <p className="auth-note">First account ever created becomes the store admin automatically.</p>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="auth-submit">Sign up</button>
          </form>

          <div className="auth-divider">or</div>

          <div className="auth-social">
            <button type="button" className="auth-social-btn" onClick={() => handleSocial('Google')}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"/>
                <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.85.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.9v2.33A9 9 0 0 0 9 18z"/>
                <path fill="#FBBC05" d="M3.95 10.71A5.4 5.4 0 0 1 3.66 9c0-.59.1-1.17.29-1.71V4.96H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.04l3.05-2.33z"/>
                <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.96l3.05 2.33C4.66 5.16 6.65 3.58 9 3.58z"/>
              </svg>
              Continue with Google
            </button>
            <button type="button" className="auth-social-btn" onClick={() => handleSocial('Facebook')}>
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#1877F2" d="M18 9a9 9 0 1 0-10.4 8.89v-6.29H5.31V9h2.29V6.98c0-2.26 1.34-3.51 3.4-3.51.99 0 2.02.17 2.02.17v2.22h-1.14c-1.12 0-1.47.7-1.47 1.42V9h2.5l-.4 2.6h-2.1v6.29A9 9 0 0 0 18 9z"/>
              </svg>
              Continue with Facebook
            </button>
          </div>
          {socialNote && <p className="auth-social-note">{socialNote}</p>}

          <p className="auth-switch">Already have one? <Link to="/login">Log in</Link></p>
        </div>
      </div>
      </div>
    </div>
  );
}
