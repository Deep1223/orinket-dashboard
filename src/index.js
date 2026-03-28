import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import store from './store/store';
import { injectStore } from './utils/StorageService';
import Config from './config/config';

// StorageService ko Redux store access do
injectStore(store);

// Kill ResizeObserver overlay
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    document.querySelectorAll('iframe').forEach((f) => {
      try {
        const txt = f.contentDocument?.body?.innerText || '';
        if (txt.includes('ResizeObserver')) f.remove();
      } catch {}
    });
    document.querySelectorAll('div').forEach((d) => {
      if (d.textContent?.includes('ResizeObserver loop') && d.style?.position === 'fixed') {
        d.remove();
      }
    });
  }, 50);
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <GoogleOAuthProvider clientId={Config.googleClientId}>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </GoogleOAuthProvider>
);

reportWebVitals();