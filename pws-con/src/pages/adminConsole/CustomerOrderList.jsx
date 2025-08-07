// CustomerOrderList.jsx
// (Moved from my-app)
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { FiCheckCircle, FiXCircle, FiClock, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
// import AdminDashboardNav from './AdminDashboardNav'; // Uncomment if you move this component too
import '../styles/CustomerOrderList.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';


export default function CustomerOrderList() {
  const { userId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIndex, setOpenIndex] = useState(null);
  const [refundedItems, setRefundedItems] = useState({});
  const [refundedOrders, setRefundedOrders] = useState({});
  const [userInfo, setUserInfo] = useState(null);

  // Memoize fetchOrders to avoid react-hooks/exhaustive-deps warning
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch user info first
      const userDoc = await getDocs(collection(db, "users"));
      const user = userDoc.docs.find(doc => doc.id === userId);
      if (user) {
        setUserInfo(user.data());
      }

      const ordersColRef = collection(db, "users", userId, "newOrders");
      const ordersSnapshot = await getDocs(ordersColRef);
      
      // Fetch orders with their subcollections (myTickets and myKlippekort)
      const fetchedOrders = await Promise.all(
        ordersSnapshot.docs
          .filter((doc) => !!doc.data().orderReference)
          .map(async (doc) => {
            const orderData = doc.data();
            let allItems = [...(orderData.items || [])];
            
            try {
              // Fetch myTickets subcollection
              const myTicketsCol = collection(doc.ref, "myTickets");
              const ticketsSnap = await getDocs(myTicketsCol);
              const tickets = ticketsSnap.docs.map(ticketDoc => ({
                ...ticketDoc.data(),
                id: ticketDoc.id,
                subcollection: 'myTickets'
              }));
              allItems.push(...tickets);

              // Fetch myKlippekort subcollection
              const myKlippekortCol = collection(doc.ref, "myKlippekort");
              const klippekortSnap = await getDocs(myKlippekortCol);
              const klippekort = klippekortSnap.docs.map(kkDoc => ({
                ...kkDoc.data(),
                id: kkDoc.id,
                subcollection: 'myKlippekort'
              }));
              allItems.push(...klippekort);

              // Fetch myPasses subcollection (for month passes)
              const myPassesCol = collection(doc.ref, "myPasses");
              const passesSnap = await getDocs(myPassesCol);
              const passes = passesSnap.docs.map(passDoc => ({
                ...passDoc.data(),
                id: passDoc.id,
                subcollection: 'myPasses'
              }));
              allItems.push(...passes);
            } catch (subcollectionError) {
              console.warn(`Error fetching subcollections for order ${orderData.orderReference}:`, subcollectionError);
            }

            return {
              id: doc.id,
              ...orderData,
              items: allItems, // Merge original items with subcollection items
              products: allItems // Also set as products for backward compatibility
            };
          })
      );
      
      setOrders(fetchedOrders);

      // Load refund data from Firestore only (no localStorage)
      const refundedItemsFromDB = {};
      const refundedOrdersFromDB = {};
      fetchedOrders.forEach(order => {
        if (order.refundedItems) {
          Object.assign(refundedItemsFromDB, order.refundedItems);
        }
        if (order.fullyRefunded) {
          refundedOrdersFromDB[order.orderReference] = true;
        }
      });
      setRefundedItems(refundedItemsFromDB);
      setRefundedOrders(refundedOrdersFromDB);
    } catch (err) {
      setError("Kunne ikke hente ordre: " + err.message);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Remove localStorage fallback: always use Firestore as source of truth for refund state
  // This ensures the UI always reflects the latest backend data after refund/capture

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
    
    // Use Vipps data for accurate refund status
    const vippsData = order.vippsCaptureResponse?.aggregate;
    const capturedAmount = vippsData ? (vippsData.capturedAmount?.value || 0) / 100 : (order.capturedAmount || 0);
    const refundedAmount = vippsData ? (vippsData.refundedAmount?.value || 0) / 100 : 0;
    
    // Check for full refund based on amounts
    if (isFullyRefunded || (capturedAmount > 0 && refundedAmount >= capturedAmount)) {
      return 'fully-refunded';
    }
    
    // Check for partial refunds
    if (refundedAmount > 0) {
      return 'partially-refunded';
    }
    
    // Check if captured
    if (isCaptured || capturedAmount > 0) {
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

  // Helper function to calculate refund amounts using both custom tracking and Vipps data
  const getRefundInfo = (order) => {
    const orderItems = order.items || order.products || [];
    let totalRefundedAmount = 0;
    let totalRefundedItems = 0;
    let totalItems = 0;
    
    // Calculate from custom refundedItems tracking for item-level details
    orderItems.forEach(item => {
      const key = `${order.orderReference}_${item.name}`;
      const refundedQty = refundedItems[key] || 0;
      totalRefundedAmount += refundedQty * (item.price || 0);
      totalRefundedItems += refundedQty;
      totalItems += item.quantity || 1;
    });
    
    // Use Vipps response data for accurate refunded amount if available
    const vippsRefundedAmount = order.vippsCaptureResponse?.aggregate?.refundedAmount?.value || 0;
    const actualRefundedAmount = vippsRefundedAmount > 0 ? vippsRefundedAmount / 100 : totalRefundedAmount;
    
    return {
      totalRefundedAmount: actualRefundedAmount,
      totalRefundedItems,
      totalItems,
      refundPercentage: totalItems > 0 ? Math.round((totalRefundedItems / totalItems) * 100) : 0,
      vippsRefundedAmount: vippsRefundedAmount / 100 // Store in NOK for display
    };
  };

  // Helper function to get payment amounts from Vipps data
  const getPaymentAmounts = (order) => {
    const vippsData = order.vippsCaptureResponse?.aggregate;
    if (!vippsData) {
      return {
        authorizedAmount: order.totalPrice || 0,
        capturedAmount: isOrderCaptured(order) ? (order.capturedAmount || order.totalPrice || 0) : 0,
        refundedAmount: 0,
        availableToRefund: order.totalPrice || 0
      };
    }
    
    const authorizedAmount = (vippsData.authorizedAmount?.value || 0) / 100;
    const capturedAmount = (vippsData.capturedAmount?.value || 0) / 100;
    const refundedAmount = (vippsData.refundedAmount?.value || 0) / 100;
    const availableToRefund = capturedAmount - refundedAmount;
    
    return {
      authorizedAmount,
      capturedAmount,
      refundedAmount,
      availableToRefund: Math.max(0, availableToRefund)
    };
  };

  async function handleRefund(orderReference, item, refundQty, pricePerUnit) {
    try {
      const refundReason = item
        ? `Refund item: ${item.name} x${refundQty}`
        : "Full order refund";
      const amountInMinorUnits = Math.round(pricePerUnit * refundQty * 100);
      // Prepare payload for backend
      const payload = {
        reference: orderReference,
        amountValue: amountInMinorUnits,
        refundReason: refundReason,
        userId,
      };
      if (item) {
        payload.itemName = item.name;
        payload.refundQty = refundQty;
      }
      const response = await fetch(`${BACKEND_URL}/refund-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const backendResult = await response.json();
      if (!response.ok) {
        console.error("Refund backend error:", backendResult);
        alert(`Refund failed: ${backendResult.error || backendResult.detail || JSON.stringify(backendResult)}`);
        return;
      }
      console.log("Refund backend response:", backendResult);
      alert("Refund successful");
      setOpenIndex(null); // close any open dropdowns to force UI refresh
      await fetchOrders(); // always use backend/Firestore as source of truth
      // Optionally log the updated order state
      console.log("Orders after refund (from backend):", orders);
    } catch (error) {
      alert("Refund error: " + error.message);
      console.error("Refund error:", error);
    }
  }

  async function handleCapture(orderReference, totalPrice) {
    try {
      const amountInMinorUnits = Math.round(totalPrice * 100);
      const response = await fetch(`${BACKEND_URL}/capture-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: orderReference,
          amountValue: amountInMinorUnits,
          userId,
        }),
      });
      const backendResult = await response.json();
      if (!response.ok) {
        console.error("Capture backend error:", backendResult);
        alert(`Capture failed: ${backendResult.error || backendResult.detail || JSON.stringify(backendResult)}`);
        return;
      }
      console.log("Capture backend response:", backendResult);
      alert("Payment captured successfully");
      setOpenIndex(null);
      await fetchOrders();
      console.log("Orders after capture (from backend):", orders);
    } catch (error) {
      alert("Capture error: " + error.message);
      console.error("Capture error:", error);
    }
  }

  if (loading) {
    return (
      <div className="customer-orders-container">
        <div className="loading-container">
          <FiRefreshCw className="loading-spinner" />
          <p>Loading customer orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-orders-container">
        <div className="error-container">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
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
        <Link to="/" className="customer-orders-backlink">
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
            const paymentAmounts = getPaymentAmounts(order);
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
                      {paymentAmounts.refundedAmount > 0 && (
                        <span className="refund-info">
                          {refundInfo.refundPercentage}% refunded ({paymentAmounts.refundedAmount.toFixed(2)} NOK)
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
                          <span className="payment-label">Authorized Amount:</span>
                          <span className="payment-value">{paymentAmounts.authorizedAmount.toFixed(2)} NOK</span>
                        </div>
                        <div className="payment-detail-item">
                          <span className="payment-label">Captured Amount:</span>
                          <span className="payment-value captured">
                            {paymentAmounts.capturedAmount.toFixed(2)} NOK
                          </span>
                        </div>
                        <div className="payment-detail-item">
                          <span className="payment-label">Refunded Amount:</span>
                          <span className="payment-value refunded">
                            {paymentAmounts.refundedAmount.toFixed(2)} NOK
                          </span>
                        </div>
                        <div className="payment-detail-item">
                          <span className="payment-label">Available to Refund:</span>
                          <span className="payment-value available">
                            {paymentAmounts.availableToRefund.toFixed(2)} NOK
                          </span>
                        </div>
                        <div className="payment-detail-item">
                          <span className="payment-label">Net Amount:</span>
                          <span className="payment-value net">
                            {(paymentAmounts.capturedAmount - paymentAmounts.refundedAmount).toFixed(2)} NOK
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
                      
                      {/* Order Items Summary */}
                      <div className="order-items-summary">
                        <h5 style={{ margin: '16px 0 8px 0', color: '#555', fontSize: '14px', fontWeight: '600' }}>Order Items:</h5>
                        <div className="items-list">
                          {(order.items || order.products || []).map((item, i) => {
                            const key = `${order.orderReference}_${item.name}`;
                            const refundedQty = refundedItems[key] || 0;
                            const totalItemPrice = (item.price || 0) * (item.quantity || 1);
                            const refundedAmount = refundedQty * (item.price || 0);
                            
                            return (
                              <div key={i} className="summary-item" style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                padding: '8px 0',
                                borderBottom: '1px solid #f0f0f0',
                                fontSize: '14px'
                              }}>
                                <div className="item-details" style={{ flex: 1 }}>
                                  <div className="item-name" style={{ fontWeight: '600', marginBottom: '2px' }}>
                                    {item.quantity}x {item.name}
                                  </div>
                                  <div className="item-meta" style={{ fontSize: '12px', color: '#666' }}>
                                    {item.price} NOK each
                                    {item.category === "klippekort" && item.stampAmounts && (
                                      <span style={{ color: '#7a5af5', marginLeft: '8px' }}>
                                        ({item.stampAmounts} klipp)
                                      </span>
                                    )}
                                    {item.category && (
                                      <span style={{ marginLeft: '8px', textTransform: 'capitalize', background: '#f0f0f0', padding: '2px 6px', borderRadius: '3px' }}>
                                        {item.category}
                                      </span>
                                    )}
                                  </div>
                                  {refundedQty > 0 && (
                                    <div className="item-refunded" style={{ color: '#e74c3c', fontSize: '12px', marginTop: '2px' }}>
                                      ⚠️ Refunded: {refundedQty}x
                                    </div>
                                  )}
                                </div>
                                <div className="item-amounts" style={{ textAlign: 'right' }}>
                                  <div className="item-total" style={{ fontWeight: '600', fontSize: '14px' }}>
                                    {totalItemPrice.toFixed(2)} NOK
                                  </div>
                                  {refundedAmount > 0 && (
                                    <div className="item-refund" style={{ color: '#e74c3c', fontSize: '12px' }}>
                                      -{refundedAmount.toFixed(2)} NOK refunded
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <div className="items-total" style={{ 
                          marginTop: '12px', 
                          paddingTop: '8px', 
                          borderTop: '2px solid #ddd',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontWeight: '600',
                          fontSize: '14px'
                        }}>
                          <span>Items Total:</span>
                          <span>{((order.items || order.products || []).reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)).toFixed(2)} NOK</span>
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
                          {paymentAmounts.authorizedAmount.toFixed(2)} NOK
                        </span>
                      </div>
                      <div className="order-meta-item">
                        <span className="order-meta-label">Payment Status</span>
                        <span className={`capture-status ${order.captureStatus?.toLowerCase() || 'pending'}`}>
                          {paymentAmounts.capturedAmount > 0 ? 'CAPTURED' : (order.captureStatus || "AUTHORIZED")}
                          {order.capturedAt && (
                            <div className="capture-time">
                              Captured: {new Date(order.capturedAt).toLocaleString('no-NO')}
                            </div>
                          )}
                          {paymentAmounts.refundedAmount > 0 && (
                            <div className="refund-info">
                              Refunded: {paymentAmounts.refundedAmount.toFixed(2)} NOK
                            </div>
                          )}
                        </span>
                      </div>
                    </div>
                    {/* Products List */}
                    <div className="products-section">
                      <h4>Order Items (Refund Actions)</h4>
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
                                <span className="product-name" style={{ fontWeight: '600' }}>
                                  {item.quantity}x {item.name}
                                </span>
                                <div className="product-details" style={{ fontSize: '13px', color: '#666', marginTop: '2px' }}>
                                  {item.price} NOK each = {totalItemPrice} NOK total
                                  {item.category === "klippekort" && item.stampAmounts && (
                                    <span style={{ color: '#7a5af5', marginLeft: '8px' }}>
                                      ({item.stampAmounts} klipp)
                                    </span>
                                  )}
                                  {item.category && (
                                    <span style={{ marginLeft: '8px', textTransform: 'capitalize', background: '#f0f0f0', padding: '1px 4px', borderRadius: '3px', fontSize: '11px' }}>
                                      {item.category}
                                    </span>
                                  )}
                                </div>
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
                        disabled={isOrderCaptured(order) || paymentAmounts.capturedAmount > 0}
                      >
                        <FiCheckCircle />
                        {(isOrderCaptured(order) || paymentAmounts.capturedAmount > 0) ? "Payment Captured" : "Capture Payment"}
                      </button>
                      <button
                        className={
                          (refundedOrders[order.orderReference] || paymentAmounts.refundedAmount >= paymentAmounts.capturedAmount)
                            ? "refunded-order"
                            : "refund-btn"
                        }
                        onClick={() =>
                          handleRefund(order.orderReference, null, paymentAmounts.availableToRefund, 1)
                        }
                        disabled={refundedOrders[order.orderReference] || paymentAmounts.availableToRefund <= 0}
                      >
                        <FiXCircle />
                        {(refundedOrders[order.orderReference] || paymentAmounts.availableToRefund <= 0)
                          ? "Order Fully Refunded"
                          : `Refund Remaining (${paymentAmounts.availableToRefund.toFixed(2)} NOK)`}
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
  );
}
