import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Products.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState(null); // Start null to know if loaded yet
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  // Helper for haptic feedback
  const vibrate = () => {
    if (navigator.vibrate) navigator.vibrate(30);
  };

  // Load quantities from localStorage on mount
  useEffect(() => {
    const savedQuantities = localStorage.getItem("productQuantities");
    if (savedQuantities) {
      setQuantities(JSON.parse(savedQuantities));
    } else {
      setQuantities({}); // no saved quantities
    }
  }, []);

  // Save quantities to localStorage whenever quantities change (but only after loaded)
  useEffect(() => {
    if (quantities !== null) {
      localStorage.setItem("productQuantities", JSON.stringify(quantities));
    }
  }, [quantities]);

  useEffect(() => {
    document.body.classList.add("products-page-body");
    return () => {
      document.body.classList.remove("products-page-body");
    };
  }, []);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, orderBy("category"));
        const productSnapshot = await getDocs(q);
        const productList = productSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(productList);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading || quantities === null) {
    // Wait until quantities loaded from localStorage and products loaded
    return <div className="loading">Laster produkter...</div>;
  }

  const groupedProducts = products.reduce((groups, product) => {
    const category = product.category || "Other";
    if (!groups[category]) groups[category] = [];
    groups[category].push(product);
    return groups;
  }, {});

  Object.keys(groupedProducts).forEach(category => {
    groupedProducts[category].sort((a, b) => a.price - b.price);
  });

  const incrementQuantity = (productId) => {
    setQuantities(prev => ({ ...prev, [productId]: (prev[productId] || 0) + 1 }));
  };

  const decrementQuantity = (productId) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      return { ...prev, [productId]: current > 0 ? current - 1 : 0 };
    });
  };

  const totalQuantity = Object.values(quantities).reduce((sum, q) => sum + q, 0);
  const totalPrice = products.reduce(
    (sum, p) => sum + (quantities[p.id] || 0) * p.price,
    0
  );

  const handleAddAllToCart = () => {
    const selectedProducts = products.filter(p => quantities[p.id] > 0);
    if (selectedProducts.length === 0) {
      alert("Velg antall billetter før du går videre til betaling.");
      return;
    }

    const cartItems = selectedProducts.flatMap(p => {
      const qty = quantities[p.id] || 0;
      // Use a 6-digit random number for short unique ID
      let shortRand = Math.floor(Math.random() * 900000 + 100000); // 6 digits
      // Helper to get a 2-letter code from idx (AA, AB, AC, ..., ZZ)
      const getLetterCode = idx => {
        const first = String.fromCharCode(65 + Math.floor(idx / 26));
        const second = String.fromCharCode(65 + (idx % 26));
        return first + second;
      };
      if (p.category === 'klippekort' && p.type === 'stampCardTicket' && qty > 1) {
        return Array.from({ length: qty }).map((_, idx) => ({
          ...p,
          quantity: 1,
          id: `KLK${shortRand + idx > 999999 ? (shortRand % 1000000) : shortRand + idx}${(idx > 899999 ? getLetterCode(idx - 900000) : '')}`,
        }));
      } else if (p.category === 'klippekort' && p.type === 'stampCardTicket') {
        return [{
          ...p,
          quantity: qty,
          id: `KLK${shortRand}`,
        }];
      } else {
        return [{
          ...p,
          quantity: qty,
          id: `${String(p.id || p.productId || '')}${Date.now()}`,
        }];
      }
    });

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    navigate("/mycart");
  };

  const getCategoryImage = (category) => {
    switch (category?.toLowerCase()) {
      case "golf":
        return require("../assets/cat/gold.webp"); // <-- your golf image
      case "lek":
        return require("../assets/cat/lek.webp");
      case "tilbehør":
        return require("../assets/cat/tilbe.webp");
      case "annet":
        return require("../assets/cat/klippekort.webp");
      case "månedskort":
        return require("../assets/cat/month.webp"); // Add your image for Månedskort here
      case "klippekort":
        return require("../assets/cat/klippekort.webp");
      default:
        return require("../assets/pws.png");
    }
  };

  const categoryOrder = ["golf", "lek", "klippekort", "månedskort","tilbehør"];
  const orderedCategories = categoryOrder
    .map(cat => Object.keys(groupedProducts).find(key => key.toLowerCase() === cat))
    .filter(Boolean)
    .concat(Object.keys(groupedProducts).filter(key => !categoryOrder.includes(key.toLowerCase())));

  // Get all available categories for dropdown
  const allCategories = Object.keys(groupedProducts);

  return (
    <div className="products-wrapper">
      <div className="global-rectangle">
        <h1 className="global-title">BILLETTER</h1>
      </div>
      <div className="category-filter-bar">
        <select id="category-filter" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          <option value="">Alle kategorier</option>
          {allCategories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="products-container">
        {orderedCategories.filter(category => !selectedCategory || category === selectedCategory).map(category => (
          <div key={category} className="category-group">
            <h3 className="category-title">🚀 {category.toUpperCase()}</h3>
            <ul className="shop-products-list">
              {groupedProducts[category].map(product => (
                <li key={product.id} className="product-card">
                  <img
                    src={
                      product.imageUrl || getCategoryImage(product.category)
                    }
                    alt={product.name}
                    className="product-image"
                  />
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <strong>{product.price} kr</strong>
                  </div>
                  <div className="quantity-controls-container">
                    <div className="quantity-controls">
                      <button
                        className="qty-btn"
                        onClick={() => {
                          vibrate();
                          decrementQuantity(product.id);
                        }}
                        aria-label={`Decrease quantity for ${product.name}`}
                      >
                        –
                      </button>
                      <span className="qty-display">{quantities[product.id] || 0}</span>
                      <button
                        className="qty-btn"
                        onClick={() => {
                          vibrate();
                          incrementQuantity(product.id);
                        }}
                        aria-label={`Increase quantity for ${product.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

<div className="logo-div" style={{ color: "white" }}>
  <h3>HAR DU HUSKET ALT?</h3>
</div>

      {/* Only show summary if any product quantity > 0 */}
      {totalQuantity > 0 && (
        <div className="summary-card">
          <h4 className="summary-title">SAMMENDRAG</h4>
          <div className="summary-section">
            <ul className="summary-list">
              {products
                .filter(p => quantities[p.id] > 0)
                .map(p => (
                  <li key={p.id} className="summary-item">
                    {quantities[p.id]}x {p.name} = {quantities[p.id] * p.price} kr
                    {p.category === 'klippekort' && p.type === 'stampCardTicket' && p.id && String(p.id).startsWith('KLK') && (
                      <span style={{ color: '#7a5af5', marginLeft: 8 }}>[ID: {p.id}]</span>
                    )}
                  </li>
                ))}
            </ul>
            <p className="summary-total">
              Total: <strong>{totalPrice} kr</strong>
            </p>
          </div>

          <div className="add-all-container">
            <button
              className="add-all-btn"
              onClick={() => {
                vibrate();
                handleAddAllToCart();
              }}
            >
              Gå til betaling
            </button>
            <button
              className="clear-btn"
              onClick={() => {
                vibrate();
                setQuantities({});
              }}
            >
              Fjern alt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}