import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Suppress third-party Chrome Extension errors from triggering CRA error overlay
if (typeof window !== 'undefined') {
  const origOnError = window.onerror;
  window.onerror = function (msg, url, line, col, error) {
    if (
      (typeof url === 'string' && url.includes('chrome-extension')) ||
      (typeof msg === 'string' && (msg.includes('M_ID') || msg.includes('Cannot read properties of undefined'))) ||
      (error && error.stack && error.stack.includes('chrome-extension'))
    ) {
      return true;
    }
    if (origOnError) return origOnError.apply(this, arguments);
    return false;
  };

  window.addEventListener('error', (event) => {
    if (
      event.filename?.includes('chrome-extension') ||
      event.message?.includes('M_ID') ||
      (event.error && event.error.stack && event.error.stack.includes('chrome-extension'))
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (event.reason.message?.includes('M_ID') || event.reason.stack?.includes('chrome-extension'))
    ) {
      event.stopImmediatePropagation();
      event.preventDefault();
    }
  }, true);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
