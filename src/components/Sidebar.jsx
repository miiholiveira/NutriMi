import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Sidebar({ session, onLogout }) {
  const userName = session?.user?.name || session?.name || 'Nutricionista';
  const userEmail = session?.user?.email || '';

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠', end: true },
    { path: '/dashboard/pacientes', label: 'Pacientes', icon: '👥' },
    { path: '/dashboard/planos', label: 'Dietas', icon: '🥗' },
    { path: '/dashboard/consultas', label: 'Consultas', icon: '📅' },
    { path: '/dashboard/relatorios', label: 'Relatórios', icon: '📊' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.png" alt="NutriMi" className="sidebar-logo-img" />
        <span className="sidebar-logo-text">NutriMi</span>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `sidebar-menu-item${isActive ? ' active' : ''}`
            }
          >
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <span className="sidebar-user-name">{userName}</span>
          <span className="sidebar-user-email" title={userEmail}>
            {userEmail}
          </span>
        </div>
        <button className="btn-sidebar-logout" onClick={onLogout}>
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}
