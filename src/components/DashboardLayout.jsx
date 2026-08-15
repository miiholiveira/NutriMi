import React from 'react';
import Sidebar from './Sidebar';

export default function DashboardLayout({ session, nutricionista, onLogout, children }) {
  return (
    <div className="app-container">
      <Sidebar session={session} nutricionista={nutricionista} onLogout={onLogout} />
      <main className="main-content">
        <div className="main-content-scroll">
          {children}
        </div>
      </main>
    </div>
  );
}
