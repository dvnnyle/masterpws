import React from 'react';
import './QRCodeComponent.css';

const QRCodeComponent = ({ ticket, isActive, onShowQR }) => {
  const isTicketActivated = isActive || false;
  
  return (
    <div className="qr-code-container">
      <button 
        className={`qr-code-button ${!isTicketActivated ? 'locked' : ''}`}
        onClick={isTicketActivated ? onShowQR : undefined}
        disabled={!isTicketActivated}
      >
        <div className="qr-icon">
          {!isTicketActivated ? (
            // Lock icon when not activated
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
            </svg>
          ) : (
            // QR icon when activated
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4z"/>
              <rect x="13" y="13" width="2" height="2"/>
              <rect x="15" y="15" width="2" height="2"/>
              <rect x="13" y="17" width="2" height="2"/>
              <rect x="15" y="19" width="2" height="2"/>
              <rect x="17" y="13" width="2" height="2"/>
              <rect x="19" y="15" width="2" height="2"/>
              <rect x="17" y="17" width="2" height="2"/>
              <rect x="19" y="19" width="2" height="2"/>
              <rect x="17" y="19" width="2" height="2"/>
              <rect x="19" y="17" width="2" height="2"/>
              <rect x="21" y="19" width="2" height="2"/>
            </svg>
          )}
        </div>
        <span id="qr-button-text">
          {!isTicketActivated ? 'QR Låst' : 'Vis QR Kode'}
        </span>
      </button>
    </div>
  );
};

export default QRCodeComponent;