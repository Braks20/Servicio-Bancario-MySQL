import React from 'react';
import { Outlet } from 'react-router-dom';
import FromSidebar from './FromSidebar';
import FromNavbar from './FromNavbar';
import '../styles/FromLayout.css';

const FromLayout = () => {
  return (
    <div className="layout-container">
      <FromSidebar />
      <div className="layout-main">
        <FromNavbar />
        <main className="layout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FromLayout;
