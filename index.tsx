
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("LinkSense AI: Root element not found.");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("LinkSense AI: Failed to render app", error);
    rootElement.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">Failed to load LinkSense AI. Please refresh the page.</div>`;
  }
}
