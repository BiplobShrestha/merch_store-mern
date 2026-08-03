import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');

  const load = async () => {
    const { data } = await api.get(`/products/${id}`);
    setProduct(data);
    const r = await api.get(`/ratings/product/${id}`);
    setRatings(r.data);
  };

  useEffect(() => {
    load();
  }, [id]);

  const addToCart = async () => {
    try {
      await api.post('/cart', { productId: id, quantity: qty });
      setMessage('Added to cart!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add to cart');
    }
  };

  if (!product) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <img
          src={product.image || 'https://via.placeholder.com/300x220?text=No+Image'}
          alt={product.name}
          style={{ maxWidth: '320px', borderRadius: '10px' }}
        />
        <div>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p><strong>Rs. {product.price}</strong></p>
          <p>⭐ {product.avgRating?.toFixed(1) || 'No ratings'} ({product.numRatings} ratings)</p>
          <p>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>

          {user && product.stock > 0 && (
            <div>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                style={{ width: '80px', display: 'inline-block', marginRight: '0.5rem' }}
              />
              <button onClick={addToCart}>Add to Cart</button>
            </div>
          )}
          {!user && <p><em>Log in to purchase</em></p>}
          {message && <p>{message}</p>}
        </div>
      </div>

      <h3 style={{ marginTop: '2rem' }}>Reviews</h3>
      {ratings.length === 0 && <p>No reviews yet.</p>}
      {ratings.map((r) => (
        <div key={r._id} className="card" style={{ marginBottom: '0.75rem' }}>
          <strong>{r.user?.name || 'User'}</strong> — {'⭐'.repeat(r.stars)}
          <p>{r.comment}</p>
        </div>
      ))}
    </div>
  );
}
