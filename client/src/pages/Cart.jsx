import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext.jsx';
import LocationPicker from '../components/LocationPicker.jsx';

const VALID_PROMO_CODES = { SAVE10: 0.1 };
const FREE_SHIPPING_THRESHOLD = 2000;
const FLAT_SHIPPING = 150;

export default function Cart() {
  const [cart, setCart] = useState(null);
  const [message, setMessage] = useState('');
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null); // { code, rate }
  const [promoNote, setPromoNote] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState(null); // { lat, lng }
  const navigate = useNavigate();
  const { refreshCart } = useCart();

  const load = async () => {
    const { data } = await api.get('/cart');
    setCart(data);
  };

  useEffect(() => {
    load();
  }, []);

  const updateQty = async (productId, quantity) => {
    const { data } = await api.put(`/cart/${productId}`, { quantity });
    setCart(data);
    refreshCart();
  };

  const removeItem = async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setCart(data);
    refreshCart();
  };

  const handlePromo = (e) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const rate = VALID_PROMO_CODES[code];
    if (rate) {
      setAppliedPromo({ code, rate });
      setPromoNote(`"${code}" applied — 10% off your items (shipping not discounted).`);
    } else {
      setAppliedPromo(null);
      setPromoNote('That code isn\'t valid.');
    }
    setTimeout(() => setPromoNote(''), 4000);
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoInput('');
  };

  const checkout = async () => {
    if (!deliveryLocation) {
      setMessage('Please set your delivery location on the map first.');
      return;
    }
    setCheckingOut(true);
    setMessage('');
    try {
      await api.post('/orders', { deliveryLocation, ...(appliedPromo ? { promoCode: appliedPromo.code } : {}) });
      setMessage('Order placed!');
      refreshCart();
      setTimeout(() => navigate('/orders'), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Checkout failed');
      setCheckingOut(false);
    }
  };

  if (!cart) return <div className="container">Loading...</div>;

  const itemCount = cart.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discount = appliedPromo ? Math.round(subtotal * appliedPromo.rate) : 0;
  const shipping = subtotal > 0 ? (subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING) : 0;
  const total = subtotal - discount + shipping;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  if (cart.items.length === 0) {
    return (
      <div className="container">
        <div className="cart-empty">
          <img src="/assets/empty-cart-illustration.png" alt="" />
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet. Go find your next favorite drop.</p>
          <Link to="/">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="cart-page-title">Your Cart</h2>

      {amountToFreeShipping > 0 ? (
        <div className="shipping-banner">
          🚚 Add <strong>Rs. {amountToFreeShipping}</strong> more to unlock <strong>free shipping</strong> (orders over Rs. {FREE_SHIPPING_THRESHOLD}).
        </div>
      ) : (
        <div className="shipping-banner shipping-banner-unlocked">
          🎉 You've unlocked <strong>free shipping</strong> on this order!
        </div>
      )}

      {message && <p>{message}</p>}

      <div className="field">
        <label>Delivery Location</label>
        <LocationPicker value={deliveryLocation} onChange={setDeliveryLocation} />
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div className="cart-item-card" key={item.product._id}>
              <div className="cart-item-img">
                <img
                  src={item.product.image || 'https://via.placeholder.com/160x160?text=No+Image'}
                  alt={item.product.name}
                />
              </div>
              <div className="cart-item-info">
                <h4>{item.product.name}</h4>
                <p className="cart-item-price">Rs. {item.product.price}</p>
                <button className="cart-item-remove" onClick={() => removeItem(item.product._id)}>
                  🗑 Remove
                </button>
              </div>
              <div className="qty-stepper">
                <button
                  onClick={() => updateQty(item.product._id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQty(item.product._id, item.quantity + 1)}>+</button>
              </div>
              <div className="cart-item-subtotal">Rs. {item.product.price * item.quantity}</div>
            </div>
          ))}
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal ({itemCount} items)</span>
            <span>Rs. {subtotal}</span>
          </div>
          {appliedPromo && (
            <div className="summary-row summary-row-discount">
              <span>Discount ({appliedPromo.code})</span>
              <span>− Rs. {discount}</span>
            </div>
          )}
          <div className="summary-row">
            <span>Estimated Shipping</span>
            <span>{shipping === 0 ? 'Free' : `Rs. ${shipping}`}</span>
          </div>
          <hr className="summary-divider" />
          <div className="summary-total">
            <span>Total</span>
            <span>Rs. {total}</span>
          </div>

          {appliedPromo ? (
            <div className="promo-applied">
              <span>✓ Code <strong>{appliedPromo.code}</strong> applied</span>
              <button type="button" onClick={removePromo}>Remove</button>
            </div>
          ) : (
            <form className="promo-row" onSubmit={handlePromo}>
              <input
                placeholder="Promo Code"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
              />
              <button type="submit">Apply</button>
            </form>
          )}
          {promoNote && <p className="promo-note">{promoNote}</p>}

          <button className="checkout-btn" onClick={checkout} disabled={checkingOut}>
            {checkingOut ? 'Placing order...' : 'Checkout'}
          </button>
        </div>
      </div>
    </div>
  );
}
