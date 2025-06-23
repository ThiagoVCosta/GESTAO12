/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import SGVAppFinal from './src/App'; // Ensured relative path
import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <SGVAppFinal />
    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. SGV App cannot be mounted.");
}