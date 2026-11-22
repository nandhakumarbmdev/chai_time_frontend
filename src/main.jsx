import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource-variable/nunito';
import App from './App.jsx';
const AdminDev = lazy(() => import('./components/AdminDev.jsx'));
import './index.css';

// No router in this app: /admin/dev is the only extra page
const isAdminDev = window.location.pathname.replace(/\/+$/, '') === '/admin/dev';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {isAdminDev ? (
      <Suspense fallback={null}>
        <AdminDev />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>
);

