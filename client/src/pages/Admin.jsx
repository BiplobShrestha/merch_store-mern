import { useEffect, useState } from 'react';
import api from '../api/axios';

const emptyForm = { name: '', description: '', price: '', image: '', category: '', stock: '' };

export default function Admin() {
  const [tab, setTab] = useState('products'); // products | add | orders
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [productSearch, setProductSearch] = useState('');

  const loadProducts = async () => {
    const { data } = await api.get('/products');
    setProducts(data);
  };

  const loadOrders = async () => {
    const { data } = await api.get('/orders');
    setOrders(data);
  };

  useEffect(() => {
    loadProducts();
    loadOrders();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submitProduct = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
        setMessage('Product updated');
      } else {
        await api.post('/products', payload);
        setMessage('Product created');
      }
      setForm(emptyForm);
      setEditingId(null);
      loadProducts();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Save failed');
    }
  };

  const editProduct = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name, description: p.description, price: p.price,
      image: p.image, category: p.category, stock: p.stock,
    });
    setTab('add');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const deleteProduct = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    await api.delete(`/products/${id}`);
    loadProducts();
  };

  const updateOrderStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      loadOrders();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const deleteOrder = async (id) => {
    if (!confirm('Delete this order? This cannot be undone.')) return;
    try {
      await api.delete(`/orders/${id}`);
      loadOrders();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete order');
    }
  };

  return (
    <div className="container">
      <h2 className="admin-title">Admin Dashboard</h2>

      <div className="admin-tabs">
        <button className={`admin-tab${tab === 'products' ? ' active' : ''}`} onClick={() => setTab('products')}>
          All Products
        </button>
        <button className={`admin-tab${tab === 'add' ? ' active' : ''}`} onClick={() => setTab('add')}>
          Add Product
        </button>
        <button className={`admin-tab${tab === 'orders' ? ' active' : ''}`} onClick={() => setTab('orders')}>
          Orders
        </button>
      </div>

      {tab === 'products' && (
        <div>
          <input
            className="admin-product-search"
            placeholder="Search products by name..."
            value={productSearch}
            onChange={(e) => setProductSearch(e.target.value)}
          />
          <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Ratings</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products
                .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                .map((p) => (
                <tr key={p._id}>
                  <td>
                    <img
                      className="admin-thumb"
                      src={p.image || 'https://via.placeholder.com/46x46?text=No+Img'}
                      alt={p.name}
                    />
                  </td>
                  <td>{p.name}</td>
                  <td>Rs. {p.price}</td>
                  <td>{p.stock}</td>
                  <td>
                    {p.numRatings > 0 ? (
                      <span className="admin-rating-display">⭐ {p.avgRating.toFixed(1)} ({p.numRatings})</span>
                    ) : (
                      <span className="admin-rating-display admin-rating-none">None</span>
                    )}
                  </td>
                  <td>
                    <button className="admin-edit-btn" onClick={() => editProduct(p)}>Edit</button>
                    <button className="admin-delete-btn" onClick={() => deleteProduct(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'rgba(23,20,15,0.5)' }}>No products yet.</td></tr>
              )}
              {products.length > 0 && products.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase())).length === 0 && (
                <tr><td colSpan="6" style={{ textAlign: 'center', color: 'rgba(23,20,15,0.5)' }}>No products match "{productSearch}".</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {tab === 'add' && (
        <div className="admin-card">
          <h3 className="admin-section-title">{editingId ? 'Edit Product' : 'Add Product'}</h3>
          {message && <p>{message}</p>}
          <form className="admin-form-grid" onSubmit={submitProduct}>
            <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
            <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} required />
            <input name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />
            <input name="category" placeholder="Category" value={form.category} onChange={handleChange} />
            <input className="full-width" name="image" placeholder="Image URL" value={form.image} onChange={handleChange} />
            <textarea className="full-width" name="description" placeholder="Description" value={form.description} onChange={handleChange} rows={3} />
            <div className="admin-form-actions">
              <button type="submit">{editingId ? 'Update' : 'Create'}</button>
              {editingId && (
                <button type="button" className="cancel-btn" onClick={cancelEdit}>Cancel</button>
              )}
            </div>
          </form>
        </div>
      )}

      {tab === 'orders' && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td>{o.user?.name} ({o.user?.email})</td>
                  <td>Rs. {o.total}</td>
                  <td>{o.status}</td>
                  <td>
                    <select
                      className="admin-status-select"
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o._id, e.target.value)}
                    >
                      {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="admin-delete-btn" onClick={() => deleteOrder(o._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'rgba(23,20,15,0.5)' }}>No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
