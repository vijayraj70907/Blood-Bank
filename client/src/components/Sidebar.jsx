import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Droplets, Users, FileText, Calendar,
  BarChart3, Bell, Settings, LogOut, ChevronLeft,
  ChevronRight, Heart, Activity, Package, AlertTriangle,
  UserCheck, X, Search, ShieldCheck, ClipboardList
} from 'lucide-react';

const menusByRole = {
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Droplets, label: 'Blood Inventory', path: '/admin/inventory' },
    { icon: Users, label: 'Donor Management', path: '/admin/donors' },
    { icon: FileText, label: 'Blood Requests', path: '/admin/requests' },
    { icon: Calendar, label: 'Appointments', path: '/admin/appointments' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ],
  donor: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/donor' },
    { icon: UserCheck, label: 'My Profile', path: '/donor/profile' },
    { icon: Activity, label: 'Eligibility', path: '/donor/eligibility' },
    { icon: Calendar, label: 'Book Donation', path: '/donor/book' },
    { icon: ClipboardList, label: 'Donation History', path: '/donor/history' },
    { icon: Heart, label: 'Rewards', path: '/donor/rewards' },
    { icon: Bell, label: 'Notifications', path: '/donor/notifications' },
  ],
  patient: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/patient' },
    { icon: Search, label: 'Search Blood', path: '/patient/search' },
    { icon: FileText, label: 'Request Blood', path: '/patient/request' },
    { icon: AlertTriangle, label: 'Emergency', path: '/patient/emergency' },
    { icon: ClipboardList, label: 'My Requests', path: '/patient/history' },
    { icon: Bell, label: 'Notifications', path: '/patient/notifications' },
  ],
  superadmin: [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/superadmin' },
    { icon: Package, label: 'Blood Banks', path: '/superadmin/bloodbanks' },
    { icon: Users, label: 'All Users', path: '/superadmin/users' },
    { icon: Droplets, label: 'Donors', path: '/superadmin/donors' },
    { icon: Heart, label: 'Patients', path: '/superadmin/patients' },
    { icon: FileText, label: 'Requests', path: '/superadmin/requests' },
    { icon: BarChart3, label: 'Reports', path: '/superadmin/reports' },
    { icon: ShieldCheck, label: 'Permissions', path: '/superadmin/permissions' },
    { icon: Settings, label: 'Settings', path: '/superadmin/settings' },
  ],
};

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const role = user?.role || 'admin';
  const menus = menusByRole[role] || menusByRole.admin;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleLabel = {
    admin: 'Blood Bank Owner',
    donor: 'Blood Donor',
    patient: 'Patient',
    superadmin: 'Super Admin',
  }[role] || 'User';

  const roleColor = {
    admin: 'from-blue-500 to-blue-700',
    donor: 'from-primary-500 to-primary-700',
    patient: 'from-purple-500 to-purple-700',
    superadmin: 'from-yellow-500 to-orange-600',
  }[role] || 'from-primary-500 to-primary-700';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800
          flex flex-col z-50 transition-all duration-300 shadow-2xl
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        role="navigation"
        aria-label="Dashboard navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-gray-100 dark:border-gray-800">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center shadow-glow-red`}>
                <Droplets className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-display font-bold text-sm text-gray-900 dark:text-white">BloodBridge</p>
                <p className="text-[10px] text-gray-400">{roleLabel}</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center mx-auto shadow-glow-red`}>
              <Droplets className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="flex items-center gap-1">
            {mobileOpen && (
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="w-4 h-4 text-gray-500" /> : <ChevronLeft className="w-4 h-4 text-gray-500" />}
            </button>
          </div>
        </div>

        {/* User Info */}
        {!collapsed && (
          <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${roleColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menus.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin' || item.path === '/donor' || item.path === '/patient' || item.path === '/superadmin'}
              onClick={() => { if (mobileOpen) onClose(); }}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200
                ${collapsed ? 'justify-center' : ''}
                ${isActive
                  ? `bg-gradient-to-r ${roleColor} text-white shadow-sm`
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'
                }
              `}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
