import React from 'react';
import AppLayout from './AppLayout';
import App from './App';

// NOTE: To use routing, install react-router-dom:
// npm install react-router-dom

const AppRouter: React.FC = () => {
  return (
    <AppLayout>
      <App />
      {/* Add routes here after installing react-router-dom */}
    </AppLayout>
  );
};

export default AppRouter;
