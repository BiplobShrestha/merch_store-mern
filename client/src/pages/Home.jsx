import { useEffect, useState, useMemo, useRef } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard.jsx';
import Footer from '../components/Footer.jsx';

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [columns, setColumns] = useState(1);
  const gridRef = useRef(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await api.get('/products');
    setAllProducts(data);
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    const measure = () => {
      const style = getComputedStyle(el);
      const count = style.gridTemplateColumns.split(' ').filter(Boolean).length;
      setColumns(Math.max(1, count));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set(allProducts.map((p) => p.category || 'General'));
    return ['All', ...Array.from(set)];
  }, [allProducts]);

  const applyFilters = (categoryOverride, searchOverride) => {
    const cat = categoryOverride !== undefined ? categoryOverride : activeCategory;
    const q = (searchOverride !== undefined ? searchOverride : search).toLowerCase();
    let filtered = allProducts;
    if (cat !== 'All') filtered = filtered.filter((p) => (p.category || 'General') === cat);
    if (q) filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
    setProducts(filtered);
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    applyFilters(cat, undefined);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters(undefined, search);
  };

  const scrollToProducts = () => {
    document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="shop-hero">
        <div className="shop-hero-inner">
          <p className="shop-hero-eyebrow">New Drop</p>
          <h1>Fresh merch just landed. Grab it before it's gone.</h1>
          <p>Premium streetwear and band merch — tees, hoodies, vinyl, and accessories, drop after drop.</p>
          <button className="shop-hero-cta" onClick={scrollToProducts}>Shop New Drop</button>
        </div>
      </div>

      <div className="container">
        <form className="shop-search" onSubmit={handleSearch}>
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-pill${activeCategory === cat ? ' active' : ''}`}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div id="product-grid">
          {loading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div className="product-grid" ref={gridRef}>
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
              {(() => {
                const remainder = products.length % columns;
                const fillersNeeded = remainder === 0 ? 0 : columns - remainder;
                return Array.from({ length: fillersNeeded }).map((_, i) => (
                  <div className="filler-card" key={`filler-${i}`}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 2l2.6 6.6L21 11l-6.4 2.4L12 20l-2.6-6.6L3 11l6.4-2.4L12 2z" />
                    </svg>
                    <span>More drops coming soon</span>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
