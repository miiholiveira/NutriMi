import React from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ session, onLogout, children }) {
  return (
    <div className="app-container">
      <Sidebar session={session} onLogout={onLogout} />
      <main className="main-content">
        <div className="main-content-scroll">
          {children}
        </div>
      </main>
    </div>
  );
}
