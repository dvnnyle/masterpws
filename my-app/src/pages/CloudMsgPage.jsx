import React from 'react';
import CloudMsg from '../tools/cloudMsg';

const CloudMsgPage = () => {
  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24 }}>
      <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Cloud Messaging Demo</h2>
      <CloudMsg />
    </div>
  );
};

export default CloudMsgPage;
