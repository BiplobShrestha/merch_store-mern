import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import api from '../api/axios';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();
  const [status, setStatus] = useState('idle'); // idle | adding | added

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    setStatus('adding');
    try {
      await api.post('/cart', { productId: product._id, quantity: 1 });
      setStatus('added');
      refreshCart();
      setTimeout(() => setStatus('idle'), 1500);
    } catch (err) {
      setStatus('idle');
    }
  };

  return (
    <div className="shop-product-card">
      <Link to={`/product/${product._id}`}>
        <div className="product-img-wrap">
          <img
            src={product.image || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
          />
        </div>
      </Link>
      <div className="product-info">
        <Link to={`/product/${product._id}`}>
          <h3>{product.name}</h3>
        </Link>
        <p className="product-price">Rs. {product.price}</p>
        <p className="product-meta">
          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
          {product.numRatings > 0 && ` · ⭐ ${product.avgRating?.toFixed(1)} (${product.numRatings})`}
        </p>
        <button
          className={`add-to-cart-btn${status === 'added' ? ' added' : ''}`}
          onClick={handleAddToCart}
          disabled={product.stock === 0 || status === 'adding'}
        >
          {status === 'added' ? 'Added ✓' : product.stock === 0 ? 'Out of stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
