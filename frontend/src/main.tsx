import React from 'react';
import ReactDOM from 'react-dom/client';
import './assets/styles/index.css';
import App from './App';

// Add global error handler
window.onerror = function(message, source, lineno, colno, error) {
  console.error("Caught a global error:", { message, source, lineno, colno, error });
  // You might want to send this error to a logging service in a real app
  return true; // Prevent default browser error handling
};
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
      <App />
  </React.StrictMode>
);