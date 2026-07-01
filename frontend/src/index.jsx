import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // ملف التصميم الخاص باللونين الأسود والأحمر
import App from './App'; // ملف التطبيق الرئيسي

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);