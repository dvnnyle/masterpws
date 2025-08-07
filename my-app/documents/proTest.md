change server.jsx: here u change test url to production

change vipps.js: here u change the base backend url


 // Use environment variable for base URL with localhost fallback for development
  const baseUrl = process.env.REACT_APP_BASE_URL || "http://localhost:3000";


  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://playworldapp.onrender.com';

