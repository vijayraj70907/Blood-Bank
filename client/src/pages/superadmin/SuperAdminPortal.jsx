import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Droplets, FileText,
  BarChart3, Settings, ShieldCheck, TrendingUp, Activity,
  Globe, CheckCircle, AlertTriangle, ChevronRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { BLOOD_GROUP_COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';

const globalStats = {
  bloodBanks: 2847,
  donors: 156432,
  patients: 89234,
  requests: 312789,
  livesSaved: 938367,
  unitsStock: 89234,
};

const bankList = [
  { id: 'BB001', name: 'City Blood Bank', city: 'Hyderabad', state: 'Telangana', donors: 1240, stock: 1348, status: 'active' },
  { id: 'BB002', name: 'Apollo Blood Center', city: 'Chennai', state: 'Tamil Nadu', donors: 892, stock: 987, status: 'active' },
  { id: 'BB003', name: 'AIIMS Blood Bank', city: 'New Delhi', state: 'Delhi', donors: 2100, stock: 2456, status: 'active' },
  { id: 'BB004', name: 'Max Blood Bank', city: 'Mumbai', state: 'Maharashtra', donors: 765, stock: 834, status: 'pending' },
  { id: 'BB005', name: 'Fortis Blood Center', city: 'Bangalore', state: 'Karnataka', donors: 1050, stock: 1120, status: 'active' },
];

const monthlyTrend = [
  { month: 'Jan', donations: 1200, requests: 950 },
  { month: 'Feb', donations: 1500, requests: 1100 },
  { month: 'Mar', donations: 1800, requests: 1450 },
  { month: 'Apr', donations: 1400, requests: 1200 },
  { month: 'May', donations: 2000, requests: 1600 },
  { month: 'Jun', donations: 2300, requests: 1850 },
  { month: 'Jul', donations: 2100, requests: 1700 },
];

function SuperDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Super Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">BloodBridge — National Overview</p>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>System Online
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: 'Blood Banks', value: globalStats.bloodBanks, icon: Building2, color: 'from-blue-500 to-blue-700' },
          { label: 'Total Donors', value: globalStats.donors, icon: Users, color: 'from-primary-500 to-primary-700' },
          { label: 'Total Patients', value: globalStats.patients, icon: Users, color: 'from-purple-500 to-purple-700' },
          { label: 'Total Requests', value: globalStats.requests, icon: FileText, color: 'from-indigo-500 to-indigo-700' },
          { label: 'Blood Units', value: globalStats.unitsStock, icon: Droplets, color: 'from-red-500 to-red-700' },
          { label: 'Lives Saved', value: globalStats.livesSaved, icon: Activity, color: 'from-green-500 to-green-700' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="dash-card text-center hover:scale-105 transition-all">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xl font-display font-black text-gray-900 dark:text-white">{value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* National Trend */}
      <div className="dash-card">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">National Donation Trends</h2>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyTrend}>
            <defs>
              <linearGradient id="superDonGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d63031" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#d63031" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
            <Area type="monotone" dataKey="donations" stroke="#d63031" strokeWidth={2} fill="url(#superDonGrad)" name="Donations" />
            <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} name="Requests" fill="none" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Blood Banks Table */}
      <div className="dash-card overflow-x-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Registered Blood Banks</h2>
          <button className="btn-primary text-sm py-2 px-4" onClick={() => toast.success('Add blood bank dialog...')}>
            + Add Bank
          </button>
        </div>
        <table className="data-table">
          <thead><tr>
            <th>Blood Bank</th><th>City</th><th>State</th><th>Donors</th><th>Stock</th><th>Status</th><th>Action</th>
          </tr></thead>
          <tbody>
            {bankList.map(bank => (
              <tr key={bank.id}>
                <td>
                  <p className="font-semibold text-gray-900 dark:text-white">{bank.name}</p>
                  <p className="text-xs text-gray-400 font-mono">#{bank.id}</p>
                </td>
                <td className="text-gray-600 dark:text-gray-400">{bank.city}</td>
                <td className="text-gray-600 dark:text-gray-400">{bank.state}</td>
                <td className="font-semibold">{bank.donors.toLocaleString()}</td>
                <td className="font-semibold">{bank.stock.toLocaleString()} units</td>
                <td>
                  <span className={`badge-${bank.status === 'active' ? 'approved' : 'pending'}`}>{bank.status}</span>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => toast.success(`Viewing ${bank.name}...`)} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg">View</button>
                    {bank.status === 'pending' && (
                      <button onClick={() => toast.success('Bank approved!')} className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">Approve</button>
                    )}
                    <button onClick={() => toast.error('Bank suspended!')} className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">Suspend</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ManageBloodBanks() {
  return <SuperDashboard />;
}

function ManageUsers() {
  const users = [
    { name: 'Ravi Kumar', email: 'ravi@email.com', role: 'donor', status: 'active', joined: '2025-03-12' },
    { name: 'Anjali Reddy', email: 'anjali@email.com', role: 'patient', status: 'active', joined: '2025-05-20' },
    { name: 'Dr. Rajesh Kumar', email: 'rajesh@email.com', role: 'admin', status: 'active', joined: '2025-01-08' },
    { name: 'Suresh Babu', email: 'suresh@email.com', role: 'donor', status: 'suspended', joined: '2025-07-01' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">All Users</h1>
      <div className="dash-card overflow-x-auto">
        <table className="data-table">
          <thead><tr>
            <th>User</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-sm">{u.name.charAt(0)}</div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td><span className="badge-completed capitalize">{u.role}</span></td>
                <td><span className={`badge-${u.status === 'active' ? 'approved' : 'rejected'}`}>{u.status}</span></td>
                <td className="text-gray-500 text-sm">{u.joined}</td>
                <td>
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 rounded-lg" onClick={() => toast.success('View user...')}>View</button>
                    <button className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 rounded-lg" onClick={() => toast.error('User action taken')}>Suspend</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SuperSettings() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">System Settings</h1>
      <div className="dash-card space-y-5">
        {[
          { label: 'Site Name', placeholder: 'BloodBridge' },
          { label: 'Support Email', placeholder: 'info@bloodbridge.in' },
          { label: 'Emergency Helpline', placeholder: '1800-180-0099' },
          { label: 'Max Blood Banks per State', placeholder: '500' },
        ].map(f => (
          <div key={f.label}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
            <input type="text" placeholder={f.placeholder} className="input-field" />
          </div>
        ))}
        <button className="btn-primary" onClick={() => toast.success('Settings saved!')}>Save Settings</button>
      </div>
    </div>
  );
}

export default function SuperAdminPortal() {
  return (
    <Routes>
      <Route index element={<SuperDashboard />} />
      <Route path="bloodbanks" element={<ManageBloodBanks />} />
      <Route path="users" element={<ManageUsers />} />
      <Route path="donors" element={<ManageUsers />} />
      <Route path="patients" element={<ManageUsers />} />
      <Route path="requests" element={<ManageUsers />} />
      <Route path="reports" element={<SuperDashboard />} />
      <Route path="settings" element={<SuperSettings />} />
    </Routes>
  );
}
