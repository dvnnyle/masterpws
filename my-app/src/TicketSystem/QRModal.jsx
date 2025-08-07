import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './QRModal.css';

const QRModal = ({ isOpen, onClose, ticket, isActive }) => {
  if (!isOpen) return null;

  // Generate QR code data with ticket information
  const qrData = JSON.stringify({
    ticketId: ticket.id,
    orderReference: ticket.orderReference,
    name: ticket.name,
    customerName: ticket.customerName, // Add customer name to QR data
    duration: ticket.duration,
    datePurchased: ticket.datePurchased,
    isActive: isActive
  });

  return (
    <div className="qr-modal-overlay" onClick={onClose}>
      <div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="qr-modal-header">
          <h3>Billett QR Kode</h3>
          <button className="qr-modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="qr-modal-body">
          <div className="qr-modal-info">
            <h4>{ticket.name}</h4>
            <p>Ordre-ID: {ticket.orderReference}</p>
          </div>
          
          <div className="qr-modal-qr">
            <QRCodeCanvas
              value={qrData}
              size={350}
              level="M"
              includeMargin={true}
              bgColor={isActive ? "#ffffff" : "#f5f5f5"}
              fgColor={isActive ? "#000000" : "#888888"}
            />
          </div>
          
          <div className="qr-modal-instructions">
            <p>Vis denne QR-koden til personalet for å aktivere billetten din.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRModal;