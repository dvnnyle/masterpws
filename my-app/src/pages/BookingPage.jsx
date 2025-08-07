import React from 'react';

const BookingPage = () => {
  const bookingFormUrl = "https://playworld.no/bursdagsfeiring-barnebursdag-lekeland/";

  return (
    <div>
      <div className="global-rectangle">
        <h1 className="global-title">VÅRE PARKER</h1>
      </div>

      <div style={{ padding: '0px' }}>
        <iframe
          src={bookingFormUrl}
          style={{ width: '100%', height: '800px', border: 'none' }}
          title="Funbutler Booking Form"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default BookingPage;
