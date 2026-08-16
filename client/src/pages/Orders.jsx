import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import OrderTrackingMap from '../components/OrderTrackingMap.jsx';

function RateWidget({ orderId, productId, onRated }) {
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (stars === 0) {
      setMsg('Pick a star rating first.');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/ratings', { orderId, productId, stars, comment });
      onRated();
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to submit rating');
      setSubmitting(false);
    }
  };

  return (
    <form className="rate-widget" onSubmit={submit}>
      <span className="rate-widget-label">Rate this item</span>
      <div className="star-picker">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            type="button"
            key={s}
            className={s <= (hoverStars || stars) ? 'filled' : ''}
            onMouseEnter={() => setHoverStars(s)}
            onMouseLeave={() => setHoverStars(0)}
            onClick={() => setStars(s)}
            aria-label={`${s} star`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        placeholder="Optional comment"
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {msg && <p className="rate-note">{msg}</p>}
      <button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Rating'}</button>
    </form>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [ratedItems, setRatedItems] = useState({});
  const [expandedTracking, setExpandedTracking] = useState(null); // order id or null
  const [trackingData, setTrackingData] = useState({}); // { [orderId]: trackingResult }
  const [trackingLoading, setTrackingLoading] = useState(false);

  const load = async () => {
    const [ordersRes, ratingsRes] = await Promise.all([
      api.get('/orders/mine'),
      api.get('/ratings/mine'),
    ]);
    setOrders(ordersRes.data);
    const ratedMap = {};
    ratingsRes.data.forEach((r) => {
      ratedMap[`${r.order}-${r.product}`] = true;
    });
    setRatedItems(ratedMap);
  };

  useEffect(() => {
    load();
  }, []);

  const markRated = (orderId, productId) => {
    setRatedItems((prev) => ({ ...prev, [`${orderId}-${productId}`]: true }));
  };

  const toggleTracking = async (orderId) => {
    if (expandedTracking === orderId) {
      setExpandedTracking(null);
      return;
    }
    setExpandedTracking(orderId);
    if (!trackingData[orderId]) {
      setTrackingLoading(true);
      try {
        const { data } = await api.get(`/orders/${orderId}/tracking`);
        setTrackingData((prev) => ({ ...prev, [orderId]: data }));
      } catch (err) {
        const status = err.response?.status;
        const serverMsg = err.response?.data?.message;
        const message = serverMsg
          ? `${serverMsg}${status ? ` (${status})` : ''}`
          : err.request
            ? 'Could not reach the server. Check your connection or try again.'
            : 'Something went wrong loading tracking.';
        setTrackingData((prev) => ({ ...prev, [orderId]: { stage: 'error', message } }));
      } finally {
        setTrackingLoading(false);
      }
    }
  };

  if (orders.length === 0) {
    return (
      <div className="container">
        <div className="orders-empty">
          <img src="/assets/empty-orders-illustration.png" alt="" />
          <h3>No orders yet</h3>
          <p>Once you place an order, you'll be able to track it and rate your items here.</p>
          <Link to="/">Start Shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h2 className="orders-page-title">Order History</h2>

      {orders.map((order) => {
        const productIds = order.items.map((i) => i.product);
        const firstUnratedIdx = order.status === 'Delivered'
          ? order.items.findIndex((item, idx) => !ratedItems[`${order._id}-${productIds[idx]}`])
          : -1;

        return (
          <div key={order._id} className="order-card">
            <div className="order-card-header">
              <div className="order-header-left">
                <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                <span className="order-date">
                  Placed: {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <span className={`status-pill status-${order.status}`}>{order.status}</span>
            </div>

            <div className="order-items-row">
              {order.items.map((item, idx) => (
                <div className="order-item-mini" key={`${order._id}-${idx}`}>
                  <div className="order-item-thumb">
                    <img
                      src={item.image || 'https://via.placeholder.com/80x80?text=No+Image'}
                      alt={item.name}
                    />
                  </div>
                  <div>
                    <h5>{item.name}</h5>
                    <p>Qty {item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-card-footer">
              <span className="order-total"><strong>Total: Rs. {order.total}</strong></span>

              {order.status === 'Delivered' && firstUnratedIdx !== -1 ? (
                <RateWidget
                  orderId={order._id}
                  productId={productIds[firstUnratedIdx]}
                  onRated={() => markRated(order._id, productIds[firstUnratedIdx])}
                />
              ) : order.status === 'Delivered' ? (
                <span className="rated-badge">✓ Rated</span>
              ) : (
                <button className={`track-btn status-${order.status}`} onClick={() => toggleTracking(order._id)}>
                  {expandedTracking === order._id ? 'Hide Tracking' : 'Track Order'}
                </button>
              )}
            </div>

            {expandedTracking === order._id && (
              <div className="order-tracking-panel">
                {trackingLoading && !trackingData[order._id] ? (
                  <p className="rate-note">Loading tracking...</p>
                ) : (
                  <OrderTrackingMap tracking={trackingData[order._id]} />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
