import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 2500);
  };

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
      <div className="footer-col">
        <h4>Merch Store</h4>
        <p>Premium streetwear and band merch, drop after drop.</p>
        <div className="footer-social">
          <a href="#" aria-label="X / Twitter" onClick={(e) => e.preventDefault()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.6 8.7L23 22h-6.9l-5.4-6.6L4.5 22H1.4l8.1-9.3L1 2h7l4.9 6.1L18.9 2zm-1.2 18h1.9L7.4 4H5.4l12.3 16z"/></svg>
          </a>
          <a href="#" aria-label="Instagram" onClick={(e) => e.preventDefault()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 1.97.24 2.43.4a4.9 4.9 0 0 1 1.77 1.15 4.9 4.9 0 0 1 1.15 1.77c.17.46.36 1.26.4 2.43.07 1.25.07 1.65.07 4.85s0 3.6-.07 4.85c-.05 1.17-.24 1.97-.4 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.46.17-1.26.36-2.43.4-1.25.07-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.17-.46-.36-1.26-.4-2.43C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.85c.05-1.17.24-1.97.4-2.43a4.9 4.9 0 0 1 1.15-1.77A4.9 4.9 0 0 1 5.6 1.8c.46-.17 1.26-.36 2.43-.4C9.28 1.33 9.68 1.33 12 1.33V2.2zm0 3a6.8 6.8 0 1 0 0 13.6 6.8 6.8 0 0 0 0-13.6zm0 11.2a4.4 4.4 0 1 1 0-8.8 4.4 4.4 0 0 1 0 8.8zm7-11.4a1.6 1.6 0 1 1-3.2 0 1.6 1.6 0 0 1 3.2 0z"/></svg>
          </a>
          <a href="#" aria-label="YouTube" onClick={(e) => e.preventDefault()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.5V8.5l6.3 3.5-6.3 3.5z"/></svg>
          </a>
        </div>
      </div>

      <div className="footer-col">
        <h4>Shop</h4>
        <a href="/" onClick={(e) => e.preventDefault()}>All Products</a>
        <a href="/cart" onClick={(e) => e.preventDefault()}>Cart</a>
        <a href="/orders" onClick={(e) => e.preventDefault()}>My Orders</a>
      </div>

      <div className="footer-col">
        <h4>Customer Care</h4>
        <a href="#" onClick={(e) => e.preventDefault()}>Contact Us</a>
        <a href="#" onClick={(e) => e.preventDefault()}>Shipping Info</a>
        <a href="#" onClick={(e) => e.preventDefault()}>Returns</a>
      </div>

      <div className="footer-col">
        <h4>Newsletter</h4>
        <p>Get notified about new drops first.</p>
        <form className="newsletter-form" onSubmit={handleSubscribe}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">{subscribed ? '✓' : 'Subscribe'}</button>
        </form>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} Merch Store. All rights reserved.
      </div>
      </div>
    </footer>
  );
}
