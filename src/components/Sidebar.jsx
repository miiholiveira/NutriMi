import React from 'react';
import { NavLink } from 'react-router-dom';
import { getTituloNutricionista } from '../lib/db';

export default function Sidebar({ session, nutricionista, onLogout }) {
  const titulo = getTituloNutricionista(nutricionista);
  const rawName = nutricionista?.nome || session?.user?.name || session?.name || 'Nutricionista';
  const userName = rawName.startsWith('Dr.') || rawName.startsWith('Dra.') ? rawName : `${titulo} ${rawName}`;
  const userEmail = session?.user?.email || '';

  const menuItems = [
    { path: '/dashboard', label: 'Início', icon: '🏠', end: true },
    { path: '/dashboard/pacientes', label: 'Pacientes', icon: '👥' },
    { path: '/dashboard/planos', label: 'Dietas', icon: '🥗' },
    { path: '/dashboard/consultas', label: 'Consultas', icon: '📅' },
    { path: '/dashboard/relatorios', label: 'Relatórios', icon: '📊' },
  ];

  return (
    <>
      {/* Barra de Topo Exclusiva para Mobile */}
      <header className="mobile-top-header no-print">
        <div className="mobile-brand">
          <img src="/logo.png" alt="NutriMi" className="mobile-logo-img" />
          <span className="mobile-logo-text">NutriMi</span>
        </div>
        <div className="mobile-user-actions">
          <span className="mobile-user-greeting">{userName.split(' ')[0]}</span>
          <button
            className="mobile-btn-logout"
            onClick={onLogout}
            title="Sair da Conta"
            aria-label="Sair"
          >
            🚪 Sair
          </button>
        </div>
      </header>

      {/* Sidebar para Desktop & Bottom Bar para Mobile */}
      <aside className="sidebar no-print">
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
              <span className="sidebar-item-icon">{item.icon}</span>
              <span className="sidebar-item-label">{item.label}</span>
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
    </>
  );
}
