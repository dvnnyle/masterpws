import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { 
  FiArrowLeft, 
  FiCheckCircle, 
  FiXCircle, 
  FiClock,
  FiRefreshCw
} from 'react-icons/fi';
import AdminDashboardNav from './ConsoleComp/AdminDashboardNav';
import "./CustomerOrderList.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:4000";

export default function CustomerOrderList() {
  const { userId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [refundedItems, setRefundedItems] = useState({});
  const [refundedOrders, setRefundedOrders] = useState({});
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        // Fetch user info first
        const userDoc = await getDocs(collection(db, "users"));
        const user = userDoc.docs.find(doc => doc.id === userId);
        if (user) {
          setUserInfo(user.data());
        }

        const ordersColRef = collection(db, "users", userId, "newOrders");
        const ordersSnapshot = await getDocs(ordersColRef);
        const fetchedOrders = ordersSnapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((order) => !!order.orderReference);
        
        setOrders(fetchedOrders);

        // Load refund data from database instead of localStorage
        const refundedItemsFromDB = {};
        const refundedOrdersFromDB = {};
        
        fetchedOrders.forEach(order => {
          // Load refunded items from database
          if (order.refundedItems) {
            Object.assign(refundedItemsFromDB, order.refundedItems);
          }
          
          // Load fully refunded orders from database
          if (order.fullyRefunded) {
            refundedOrdersFromDB[order.orderReference] = true;
          }
        });

        setRefundedItems(refundedItemsFromDB);
        setRefundedOrders(refundedOrdersFromDB);
        
        // Also update localStorage as backup
        localStorage.setItem("refundedItems", JSON.stringify(refundedItemsFromDB));
        localStorage.setItem("refundedOrders", JSON.stringify(refundedOrdersFromDB));
        
      } catch (err) {
        setError("Kunne ikke hente ordre: " + err.message);
      }
      setLoading(false);
    }
    fetchOrders();
  }, [userId]);

  useEffect(() => {
    // Load refunded state from localStorage on mount (only for refunds)
    const refundedItemsLS = JSON.parse(localStorage.getItem("refundedItems") || "{}");
    const refundedOrdersLS = JSON.parse(localStorage.getItem("refundedOrders") || "{}");
    setRefundedItems(refundedItemsLS);
    setRefundedOrders(refundedOrdersLS);
  }, [orders]);

  const toggleDropdown = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  // Helper function to check if order is captured (based on database only)
  const isOrderCaptured = (order) => {
    return order.captureStatus === "CAPTURED";
  };

  // Helper function to get detailed order status
  const getOrderStatus = (order) => {
    const isFullyRefunded = refundedOrders[order.orderReference];
    const isCaptured = order.captureStatus === 'CAPTURED';
    
    // Check for partial refunds
    const orderItems = order.items || order.products || [];
    let hasPartialRefunds = false;
    let totalRefundedAmount = 0;
    
    orderItems.forEach(item => {
      const key = `${order.orderReference}_${item.name}`;
      const refundedQty = refundedItems[key] || 0;
      if (refundedQty > 0 && refundedQty < (item.quantity || 1)) {
        hasPartialRefunds = true;
      }
      totalRefundedAmount += refundedQty * (item.price || 0);
    });

    if (isFullyRefunded) {
      return 'fully-refunded';
    }
    if (hasPartialRefunds || totalRefundedAmount > 0) {
      return 'partially-refunded';
    }
    if (isCaptured) {
      return 'captured-paid';
    }
    return 'pending-authorized';
  };

  // Helper function to get status display info
  const getStatusInfo = (status) => {
    switch (status) {
      case 'captured-paid':
        return { label: 'Paid & Captured', color: '#27ae60', icon: FiCheckCircle, bg: '#d4edda' };
      case 'fully-refunded':
        return { label: 'Fully Refunded', color: '#e74c3c', icon: FiXCircle, bg: '#f8d7da' };
      case 'partially-refunded':
        return { label: 'Partially Refunded', color: '#fd7e14', icon: FiXCircle, bg: '#fff3cd' };
      case 'pending-authorized':
      default:
        return { label: 'Authorized (Pending)', color: '#6f42c1', icon: FiClock, bg: '#e2e3f5' };
    }
  };

  // Helper function to calculate refund amounts
  const getRefundInfo = (order) => {
    const orderItems = order.items || order.products || [];
    let totalRefundedAmount = 0;
    let totalRefundedItems = 0;
    let totalItems = 0;

    orderItems.forEach(item => {
      const key = `${order.orderReference}_${item.name}`;
      const refundedQty = refundedItems[key] || 0;
      totalRefundedAmount += refundedQty * (item.price || 0);
      totalRefundedItems += refundedQty;
      totalItems += item.quantity || 1;
    });

    return {
      totalRefundedAmount,
      totalRefundedItems,
      totalItems,
      refundPercentage: totalItems > 0 ? Math.round((totalRefundedItems / totalItems) * 100) : 0
    };
  };

  async function handleRefund(orderReference, item, refundQty, pricePerUnit) {
    try {
      const refundReason = item
        ? `Refund item: ${item.name} x${refundQty}`
        : "Full order refund";

      const amountInMinorUnits = Math.round(pricePerUnit * refundQty * 100);

      const response = await fetch(`${BACKEND_URL}/refund-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: orderReference,
          amountValue: amountInMinorUnits,
          refundReason: refundReason,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Refund failed: ${error.error || JSON.stringify(error)}`);
        return;
      }

      alert("Refund successful");

      // Update Firestore database with refund information
      const orderToUpdate = orders.find(o => o.orderReference === orderReference);
      if (orderToUpdate) {
        const orderDocRef = doc(db, "users", userId, "newOrders", orderToUpdate.id);
        
        if (item) {
          // Individual item refund
          const key = `${orderReference}_${item.name}`;
          const prevQty = refundedItems[key] || 0;
          const newRefundedItems = {
            ...refundedItems,
            [key]: prevQty + refundQty,
          };
          
          // Update database with refunded items
          await updateDoc(orderDocRef, {
            refundedItems: newRefundedItems,
            lastRefundedAt: new Date().toISOString(),
            refundHistory: [...(orderToUpdate.refundHistory || []), {
              type: 'item',
              itemName: item.name,
              quantity: refundQty,
              amount: amountInMinorUnits / 100,
              refundedAt: new Date().toISOString(),
              reason: refundReason
            }]
          });
          
          setRefundedItems(newRefundedItems);
          localStorage.setItem("refundedItems", JSON.stringify(newRefundedItems));
        } else {
          // Full order refund
          const newRefundedOrders = {
            ...refundedOrders,
            [orderReference]: true,
          };
          
          // Update database with full order refund
          await updateDoc(orderDocRef, {
            fullyRefunded: true,
            refundedOrders: newRefundedOrders,
            lastRefundedAt: new Date().toISOString(),
            refundHistory: [...(orderToUpdate.refundHistory || []), {
              type: 'full_order',
              amount: amountInMinorUnits / 100,
              refundedAt: new Date().toISOString(),
              reason: refundReason
            }]
          });
          
          setRefundedOrders(newRefundedOrders);
          localStorage.setItem("refundedOrders", JSON.stringify(newRefundedOrders));
        }
        
        console.log("Refund information saved to Firestore");
      }
    } catch (error) {
      alert("Refund error: " + error.message);
      console.error("Firestore refund update error:", error);
    }
  }

  async function handleCapture(orderReference, totalPrice) {
    try {
      console.log('Attempting manual capture for:', {
        orderReference,
        totalPrice,
        amountInMinorUnits: Math.round(totalPrice * 100)
      });

      const amountInMinorUnits = Math.round(totalPrice * 100);

      const response = await fetch(`${BACKEND_URL}/capture-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: orderReference,
          amountValue: amountInMinorUnits,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Capture error details:', error);
        alert(`Capture failed: ${error.error || error.detail || JSON.stringify(error)}`);
        return;
      }

      const captureResult = await response.json();
      console.log('Manual capture successful:', captureResult);
      alert("Payment captured successfully");

      // Update the order in Firestore with capture status
      try {
        const orderToUpdate = orders.find(o => o.orderReference === orderReference);
        if (orderToUpdate) {
          const orderDocRef = doc(db, "users", userId, "newOrders", orderToUpdate.id);
          await updateDoc(orderDocRef, {
            captureStatus: "CAPTURED",
            capturedAt: new Date().toISOString(),
            capturedAmount: amountInMinorUnits,
            vippsCaptureResponse: captureResult
          });
          console.log("Updated order capture status in Firestore");
          
          // Update the local orders state to reflect the change immediately
          setOrders(prevOrders => 
            prevOrders.map(order => 
              order.orderReference === orderReference 
                ? { 
                    ...order, 
                    captureStatus: "CAPTURED",
                    capturedAt: new Date().toISOString(),
                    capturedAmount: amountInMinorUnits,
                    vippsCaptureResponse: captureResult
                  }
                : order
            )
          );
        }
      } catch (firestoreError) {
        console.error("Failed to update Firestore:", firestoreError);
      }
    } catch (error) {
      console.error('Capture error:', error);
      alert("Capture error: " + error.message);
    }
  }

  if (loading) {
    return (
      <>
        <AdminDashboardNav />
        <div className="customer-orders-container">
          <div className="loading-container">
            <FiRefreshCw className="loading-spinner" />
            <p>Loading customer orders...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <AdminDashboardNav />
        <div className="customer-orders-container">
          <div className="error-container">
            <p>Error: {error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminDashboardNav />
      
      <div className="customer-orders-container">
        {/* Header */}
        <div className="customer-orders-header">
          <div>
            <h1 className="customer-orders-title">
              Customer Orders
              {userInfo && (
                <span className="customer-info">
                  - {userInfo.name || userInfo.email || 'Unknown User'}
                </span>
              )}
            </h1>
            <p className="order-count">{orders.length} orders found</p>
          </div>
          <Link to="/Admin-Dashboard" className="customer-orders-backlink">
            <FiArrowLeft />
            Back to Dashboard
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found for this customer.</p>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order, idx) => {
              const status = getOrderStatus(order);
              const statusInfo = getStatusInfo(status);
              const StatusIcon = statusInfo.icon;
              const refundInfo = getRefundInfo(order);
              
              return (
                <div key={order.id || idx} className="order-card">
                  <div className="order-header">
                    <div className="order-reference">
                      <span className="order-id">#{(order.orderReference || '').substring(0, 8).padEnd(8, '0')}</span>
                      <div className="order-date">
                        {order.datePurchased
                          ? new Date(order.datePurchased).toLocaleDateString('no-NO', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : "Date unknown"}
                      </div>
                      <div className="status-info">
                        <span className={`status-badge ${status}`} style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                          <StatusIcon />
                          {statusInfo.label}
                        </span>
                        {refundInfo.totalRefundedAmount > 0 && (
                          <span className="refund-info">
                            {refundInfo.refundPercentage}% refunded ({refundInfo.totalRefundedAmount} NOK)
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      className="expand-btn"
                      onClick={() => toggleDropdown(idx)}
                      aria-expanded={openIndex === idx}
                    >
                      {openIndex === idx ? "▲" : "▼"}
                    </button>
                  </div>

                  {openIndex === idx && (
                    <div className="order-content">
                      {/* Payment Summary */}
                      <div className="payment-summary">
                        <h4>Payment Summary</h4>
                        <div className="payment-details">
                          <div className="payment-detail-item">
                            <span className="payment-label">Original Amount:</span>
                            <span className="payment-value">{order.totalPrice} NOK</span>
                          </div>
                          <div className="payment-detail-item">
                            <span className="payment-label">Captured Amount:</span>
                            <span className="payment-value captured">
                              {isOrderCaptured(order) ? `${order.totalPrice} NOK` : '0 NOK'}
                            </span>
                          </div>
                          <div className="payment-detail-item">
                            <span className="payment-label">Refunded Amount:</span>
                            <span className="payment-value refunded">
                              {refundInfo.totalRefundedAmount} NOK
                            </span>
                          </div>
                          <div className="payment-detail-item">
                            <span className="payment-label">Available to Refund:</span>
                            <span className="payment-value available">
                              {(order.totalPrice || 0) - refundInfo.totalRefundedAmount} NOK
                            </span>
                          </div>
                          <div className="payment-detail-item">
                            <span className="payment-label">Order Status:</span>
                            <span className={`payment-status ${status}`}>
                              <StatusIcon />
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Order Meta Information */}
                      <div className="order-meta">
                        <div className="order-meta-item">
                          <span className="order-meta-label">Customer Name</span>
                          <span className="order-meta-value">{order.buyerName || "Unknown"}</span>
                        </div>
                        <div className="order-meta-item">
                          <span className="order-meta-label">Phone Number</span>
                          <span className="order-meta-value">{order.phoneNumber || "Unknown"}</span>
                        </div>
                        <div className="order-meta-item">
                          <span className="order-meta-label">Purchase Date</span>
                          <span className="order-meta-value">
                            {order.datePurchased
                              ? new Date(order.datePurchased).toLocaleString('no-NO')
                              : "Unknown"}
                          </span>
                        </div>
                        <div className="order-meta-item">
                          <span className="order-meta-label">Total Amount</span>
                          <span className="order-meta-value">
                            {order.totalPrice ? `${order.totalPrice} NOK` : "Unknown"}
                          </span>
                        </div>
                        <div className="order-meta-item">
                          <span className="order-meta-label">Capture Status</span>
                          <span className={`capture-status ${order.captureStatus?.toLowerCase() || 'pending'}`}>
                            {order.captureStatus || "PENDING"}
                            {order.capturedAt && (
                              <div className="capture-time">
                                {new Date(order.capturedAt).toLocaleString('no-NO')}
                              </div>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Products List */}
                      <div className="products-section">
                        <h4>Order Items</h4>
                        <div className="products-list">
                          {(order.items || order.products || []).map((item, i) => {
                            const totalItemPrice =
                              item.price && item.quantity
                                ? item.price * item.quantity
                                : item.price || 0;
                            const key = `${order.orderReference}_${item.name}`;
                            const refundedQty = refundedItems[key] || 0;
                            const remainingQty = (item.quantity || 1) - refundedQty;
                            const currentRefundQty = 1;

                            return (
                              <div key={i} className={`product-item ${remainingQty === 0 ? "refunded-item" : ""}`}>
                                <div className="product-info">
                                  <span className="product-name">{item.name}</span>
                                  <span className="product-details">
                                    {item.quantity}x × {item.price} NOK = {totalItemPrice} NOK
                                  </span>
                                </div>
                                <div className="product-actions">
                                  {remainingQty === 0 ? (
                                    <span className="refunded-label">Fully Refunded</span>
                                  ) : (
                                    <>
                                      <button
                                        className="refund-btn"
                                        onClick={() =>
                                          handleRefund(order.orderReference, item, currentRefundQty, item.price)
                                        }
                                        disabled={remainingQty === 0}
                                      >
                                        <FiXCircle />
                                        Refund 1x
                                      </button>
                                      {refundedQty > 0 && (
                                        <span className="refunded-partial">
                                          Refunded: {refundedQty}x
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Order Actions */}
                      <div className="order-actions">
                        <button
                          className={isOrderCaptured(order) ? "captured-order" : "capture-btn"}
                          onClick={() => handleCapture(order.orderReference, order.totalPrice)}
                          disabled={isOrderCaptured(order)}
                        >
                          <FiCheckCircle />
                          {isOrderCaptured(order) ? "Payment Captured" : "Capture Payment"}
                        </button>
                        
                        <button
                          className={
                            refundedOrders[order.orderReference]
                              ? "refunded-order"
                              : "refund-btn"
                          }
                          onClick={() =>
                            handleRefund(order.orderReference, null, order.totalPrice, 1)
                          }
                          disabled={refundedOrders[order.orderReference]}
                        >
                          <FiXCircle />
                          {refundedOrders[order.orderReference]
                            ? "Order Fully Refunded"
                            : "Refund Full Order"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
