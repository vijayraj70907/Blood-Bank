import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import {
  Droplets, TrendingUp, TrendingDown, Users, FileText, Calendar,
  Bell, AlertTriangle, CheckCircle, Clock, Plus, Download,
  BarChart3, Package, ArrowRight, Activity, ChevronRight,
  RefreshCcw, Filter, Search, Heart
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';

/* ─── Mock Data ─── */
const monthlyData = [
  { month: 'Jan', donations: 120, requests: 95, issued: 88 },
  { month: 'Feb', donations: 150, requests: 110, issued: 102 },
  { month: 'Mar', donations: 180, requests: 145, issued: 138 },
  { month: 'Apr', donations: 140, requests: 120, issued: 115 },
  { month: 'May', donations: 200, requests: 160, issued: 155 },
  { month: 'Jun', donations: 230, requests: 185, issued: 178 },
  { month: 'Jul', donations: 210, requests: 170, issued: 165 },
];

const bloodStockData = [
  { group: 'A+', units: 245, capacity: 300 },
  { group: 'A-', units: 82, capacity: 150 },
  { group: 'B+', units: 310, capacity: 350 },
  { group: 'B-', units: 58, capacity: 150 },
  { group: 'AB+', units: 94, capacity: 200 },
  { group: 'AB-', units: 21, capacity: 100 },
  { group: 'O+', units: 420, capacity: 450 },
  { group: 'O-', units: 118, capacity: 200 },
];

const recentRequests = [
  { id: 'REQ001', patient: 'Arjun Mehta', group: 'O+', units: 2, hospital: 'Apollo Hospital', doctor: 'Dr. Sharma', level: 'Critical', status: 'pending' },
  { id: 'REQ002', patient: 'Priya Singh', group: 'A-', units: 1, hospital: 'AIIMS', doctor: 'Dr. Patel', level: 'High', status: 'approved' },
  { id: 'REQ003', patient: 'Ravi Kumar', group: 'B+', units: 3, hospital: 'Max Hospital', doctor: 'Dr. Gupta', level: 'Medium', status: 'completed' },
  { id: 'REQ004', patient: 'Sita Devi', group: 'AB+', units: 2, hospital: 'Fortis', doctor: 'Dr. Reddy', level: 'Low', status: 'pending' },
  { id: 'REQ005', patient: 'Mohan Lal', group: 'O-', units: 4, hospital: 'NIMHANS', doctor: 'Dr. Rao', level: 'Critical', status: 'approved' },
];

const recentDonors = [
  { id: 'D001', name: 'Suresh Babu', group: 'O+', phone: '9876543210', lastDonation: '2026-04-10', donations: 8, status: 'eligible' },
  { id: 'D002', name: 'Anitha Roy', group: 'A+', phone: '9123456780', lastDonation: '2026-05-22', donations: 3, status: 'pending' },
  { id: 'D003', name: 'Vijay Sharma', group: 'B-', phone: '9234567801', lastDonation: '2026-06-15', donations: 12, status: 'eligible' },
  { id: 'D004', name: 'Kavya Reddy', group: 'AB+', phone: '9345678012', lastDonation: '2026-07-01', donations: 1, status: 'ineligible' },
];

const notifications = [
  { id: 1, type: 'emergency', message: 'Emergency O- request from Apollo Hospital', time: '2 min ago', read: false },
  { id: 2, type: 'stock', message: 'AB- stock critically low (21 units)', time: '15 min ago', read: false },
  { id: 3, type: 'donor', message: 'New donor registered: Ramesh Kumar', time: '1 hr ago', read: true },
  { id: 4, type: 'expiry', message: '5 units of A+ expire in 3 days', time: '3 hr ago', read: true },
];

/* ─── Stat Card ─── */
function StatCard({ title, value, change, icon: Icon, color, subtitle }) {
  const isPositive = change >= 0;
  return (
    <div className="dash-card group hover:scale-105 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
      </div>
      <p className="text-3xl font-display font-black text-gray-900 dark:text-white mb-1">{value.toLocaleString()}</p>
      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
}

/* ─── Main Dashboard ─── */
function AdminDashboard() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Blood Bank Overview — {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary text-sm py-2 px-4" onClick={() => toast.success('Data refreshed!')}>
            <RefreshCcw className="w-4 h-4" /> Refresh
          </button>
          <button className="btn-primary text-sm py-2 px-4">
            <Plus className="w-4 h-4" /> Add Blood
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Blood Units" value={1348} change={8.2} icon={Droplets} color="from-primary-500 to-primary-700" subtitle="Across all groups" />
        <StatCard title="Total Requests" value={89} change={12.5} icon={FileText} color="from-blue-500 to-blue-700" subtitle="This month" />
        <StatCard title="Pending Requests" value={14} change={-3.1} icon={Clock} color="from-yellow-500 to-yellow-700" subtitle="Needs attention" />
        <StatCard title="Today's Donations" value={23} change={15.0} icon={Heart} color="from-green-500 to-green-700" subtitle="Great progress!" />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Monthly Trend */}
        <div className="lg:col-span-2 dash-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-gray-900 dark:text-white">Monthly Donations & Requests</h2>
            <select className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 focus:outline-none">
              <option>2026</option><option>2025</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="donGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d63031" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#d63031" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="rgba(128,128,128,0.5)" />
              <YAxis tick={{ fontSize: 12 }} stroke="rgba(128,128,128,0.5)" />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }} />
              <Legend />
              <Area type="monotone" dataKey="donations" stroke="#d63031" strokeWidth={2} fill="url(#donGrad)" name="Donations" />
              <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} fill="url(#reqGrad)" name="Requests" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Blood Stock Pie */}
        <div className="dash-card">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Blood Stock Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={bloodStockData} dataKey="units" nameKey="group" cx="50%" cy="50%" outerRadius={80} label={({ group }) => group}>
                {bloodStockData.map((entry) => (
                  <Cell key={entry.group} fill={BLOOD_GROUP_COLORS[entry.group]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-4 gap-1 mt-2">
            {bloodStockData.map(b => (
              <div key={b.group} className="text-center">
                <div className="w-3 h-3 rounded-full mx-auto mb-0.5" style={{ background: BLOOD_GROUP_COLORS[b.group] }} />
                <p className="text-[10px] text-gray-500">{b.group}</p>
                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{b.units}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Blood Stock Bar Chart */}
      <div className="dash-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Blood Inventory by Group</h2>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary-500 inline-block" />Available</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200 dark:bg-gray-700 inline-block" />Capacity</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={bloodStockData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
            <XAxis dataKey="group" tick={{ fontSize: 12 }} stroke="rgba(128,128,128,0.5)" />
            <YAxis tick={{ fontSize: 12 }} stroke="rgba(128,128,128,0.5)" />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
            <Bar dataKey="capacity" fill="rgba(128,128,128,0.15)" radius={[4, 4, 0, 0]} name="Capacity" />
            <Bar dataKey="units" radius={[4, 4, 0, 0]} name="Available">
              {bloodStockData.map((entry) => (
                <Cell key={entry.group} fill={BLOOD_GROUP_COLORS[entry.group]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Requests & Notifications */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Requests */}
        <div className="lg:col-span-2 dash-card overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Recent Blood Requests</h2>
            <Link to="/admin/requests" className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="overflow-x-auto -mx-6">
            <table className="data-table">
              <thead><tr>
                <th>Patient</th><th>Group</th><th>Units</th><th>Level</th><th>Status</th><th>Action</th>
              </tr></thead>
              <tbody>
                {recentRequests.slice(0, 4).map(req => (
                  <tr key={req.id}>
                    <td>
                      <p className="font-medium text-gray-900 dark:text-white">{req.patient}</p>
                      <p className="text-xs text-gray-400">{req.hospital}</p>
                    </td>
                    <td><span className="blood-badge text-xs py-0.5">{req.group}</span></td>
                    <td className="text-center font-semibold">{req.units}</td>
                    <td>
                      <span className={`badge-${req.level === 'Critical' ? 'urgent' : req.level === 'High' ? 'rejected' : 'pending'}`}>
                        {req.level}
                      </span>
                    </td>
                    <td><span className={`badge-${req.status}`}>{req.status}</span></td>
                    <td>
                      {req.status === 'pending' && (
                        <div className="flex gap-1">
                          <button onClick={() => toast.success('Approved!')} className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 transition-colors">✓</button>
                          <button onClick={() => toast.error('Rejected')} className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors">✗</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications */}
        <div className="dash-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Notifications</h2>
            <span className="badge-rejected">{notifications.filter(n => !n.read).length} new</span>
          </div>
          <div className="space-y-3">
            {notifications.map(notif => (
              <div key={notif.id} className={`flex gap-3 p-3 rounded-xl transition-colors ${notif.read ? 'bg-gray-50 dark:bg-gray-800/30' : 'bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${notif.type === 'emergency' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                    notif.type === 'stock' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' :
                      notif.type === 'donor' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                        'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                  }`}>
                  {notif.type === 'emergency' ? <AlertTriangle className="w-4 h-4" /> :
                    notif.type === 'stock' ? <Package className="w-4 h-4" /> :
                      notif.type === 'donor' ? <Users className="w-4 h-4" /> :
                        <Bell className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-snug">{notif.message}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{notif.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Blood Inventory ─── */
function BloodInventory() {
  const [search, setSearch] = useState('');
  const [inventory, setInventory] = useState([
    { group: 'A+', units: 245, expiry: '2026-09-15', collected: '2026-07-01', location: 'Fridge A1', status: 'available', lastUpdated: '2 hrs ago' },
    { group: 'A-', units: 82, expiry: '2026-09-10', collected: '2026-07-03', location: 'Fridge A2', status: 'available', lastUpdated: '4 hrs ago' },
    { group: 'B+', units: 310, expiry: '2026-09-20', collected: '2026-07-04', location: 'Fridge B1', status: 'available', lastUpdated: '1 hr ago' },
    { group: 'B-', units: 58, expiry: '2026-09-08', collected: '2026-06-30', location: 'Fridge B2', status: 'low', lastUpdated: '6 hrs ago' },
    { group: 'AB+', units: 94, expiry: '2026-09-18', collected: '2026-07-02', location: 'Fridge C1', status: 'available', lastUpdated: '3 hrs ago' },
    { group: 'AB-', units: 21, expiry: '2026-09-05', collected: '2026-06-28', location: 'Fridge C2', status: 'critical', lastUpdated: '8 hrs ago' },
    { group: 'O+', units: 420, expiry: '2026-09-25', collected: '2026-07-05', location: 'Fridge D1', status: 'available', lastUpdated: '30 min ago' },
    { group: 'O-', units: 118, expiry: '2026-09-12', collected: '2026-07-01', location: 'Fridge D2', status: 'available', lastUpdated: '2 hrs ago' },
  ]);

  const filtered = inventory.filter(i => i.group.toLowerCase().includes(search.toLowerCase()));

  const exportData = () => {
    const csv = ['Group,Units,Expiry,Location,Status', ...filtered.map(i => `${i.group},${i.units},${i.expiry},${i.location},${i.status}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'blood-inventory.csv'; a.click();
    toast.success('CSV exported!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Blood Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">Manage all blood groups and stock levels</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportData} className="btn-secondary text-sm py-2 px-4"><Download className="w-4 h-4" />Export CSV</button>
          <button onClick={() => toast.success('Add blood dialog would open here')} className="btn-primary text-sm py-2 px-4"><Plus className="w-4 h-4" />Add Blood</button>
        </div>
      </div>

      {/* Alerts */}
      {inventory.some(i => i.status === 'critical') && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">
            <strong>Critical Alert:</strong> {inventory.filter(i => i.status === 'critical').map(i => i.group).join(', ')} stock is critically low. Immediate action required!
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="search" placeholder="Search blood group..." value={search} onChange={e => setSearch(e.target.value)}
          className="input-field pl-9 text-sm" />
      </div>

      {/* Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map(item => {
          const pct = Math.min(100, (item.units / 500) * 100);
          const statusColor = item.status === 'critical' ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : item.status === 'low' ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900';
          return (
            <div key={item.group} className={`rounded-2xl border p-5 transition-all hover:scale-105 ${statusColor}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: BLOOD_GROUP_COLORS[item.group] }}>
                  {item.group}
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${item.status === 'critical' ? 'bg-red-100 text-red-700' : item.status === 'low' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                  {item.status}
                </span>
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{item.units}</p>
              <p className="text-xs text-gray-500 mb-3">units available</p>
              <div className="progress-bar mb-3">
                <div className="progress-fill" style={{ width: `${pct}%`, background: BLOOD_GROUP_COLORS[item.group] }} />
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                <p>📍 {item.location}</p>
                <p>⏱ Expires: {item.expiry}</p>
                <p>🔄 Updated: {item.lastUpdated}</p>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => toast.success(`${item.group} updated!`)} className="flex-1 text-xs py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">Update</button>
                <button onClick={() => toast.error(`Removing expired ${item.group}...`)} className="flex-1 text-xs py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">Remove</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Donor Management ─── */
function DonorManagement() {
  const [search, setSearch] = useState('');
  const donors = recentDonors;
  const filtered = donors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.group.includes(search));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Donor Management</h1>
          <p className="text-gray-500 text-sm mt-1">{donors.length} registered donors</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary text-sm py-2 px-4"><Download className="w-4 h-4" />Export</button>
          <button className="btn-primary text-sm py-2 px-4"><Filter className="w-4 h-4" />Filter</button>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="search" placeholder="Search donors..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
      </div>

      <div className="dash-card overflow-x-auto">
        <table className="data-table">
          <thead><tr>
            <th>Donor</th><th>Blood Group</th><th>Phone</th><th>Last Donation</th><th>Donations</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.map(donor => (
              <tr key={donor.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-sm">{donor.name.charAt(0)}</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{donor.name}</p>
                      <p className="text-xs text-gray-400">#{donor.id}</p>
                    </div>
                  </div>
                </td>
                <td><span className="blood-badge text-xs">{donor.group}</span></td>
                <td className="text-gray-600 dark:text-gray-400">{donor.phone}</td>
                <td className="text-gray-600 dark:text-gray-400">{donor.lastDonation}</td>
                <td className="text-center font-bold text-gray-900 dark:text-white">{donor.donations}</td>
                <td>
                  <span className={`badge-${donor.status === 'eligible' ? 'approved' : donor.status === 'ineligible' ? 'rejected' : 'pending'}`}>
                    {donor.status}
                  </span>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button onClick={() => toast.success(`Contacting ${donor.name}...`)} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg">Contact</button>
                    <button onClick={() => toast.success('Details downloaded!')} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg">Download</button>
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

/* ─── Blood Requests ─── */
function BloodRequests() {
  const [reqs, setReqs] = useState(recentRequests);

  const updateStatus = (id, status) => {
    setReqs(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    toast.success(`Request ${status}!`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Blood Requests</h1>
          <p className="text-gray-500 text-sm mt-1">{reqs.filter(r => r.status === 'pending').length} pending requests</p>
        </div>
        <button className="btn-secondary text-sm py-2 px-4"><Download className="w-4 h-4" />Export</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: reqs.filter(r => r.status === 'pending').length, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30' },
          { label: 'Approved', count: reqs.filter(r => r.status === 'approved').length, color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
          { label: 'Completed', count: reqs.filter(r => r.status === 'completed').length, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl p-4 ${color}`}>
            <p className="text-2xl font-black font-display">{count}</p>
            <p className="text-sm font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {reqs.map(req => (
          <div key={req.id} className="dash-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: BLOOD_GROUP_COLORS[req.group] || '#d63031' }}>
                  {req.group}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-gray-900 dark:text-white">{req.patient}</h3>
                    <span className={`badge-${req.level === 'Critical' ? 'urgent' : req.level === 'High' ? 'rejected' : 'pending'}`}>{req.level}</span>
                    <span className={`badge-${req.status}`}>{req.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{req.hospital} • Dr. {req.doctor}</p>
                  <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-1">{req.units} units of {req.group} needed</p>
                </div>
              </div>
              {req.status === 'pending' && (
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => updateStatus(req.id, 'approved')} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors">Approve</button>
                  <button onClick={() => updateStatus(req.id, 'rejected')} className="px-4 py-2 bg-red-100 dark:bg-red-950/30 hover:bg-red-200 text-red-700 dark:text-red-400 text-sm font-semibold rounded-xl transition-colors">Reject</button>
                </div>
              )}
              {req.status === 'approved' && (
                <button onClick={() => updateStatus(req.id, 'completed')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0">
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Reports ─── */
function Reports() {
  const handleExport = (type) => toast.success(`${type} report generated and downloading...`);
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Reports</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Daily Donations', desc: 'Today\'s donation summary', icon: Activity, color: 'from-primary-500 to-primary-700' },
          { title: 'Monthly Donations', desc: 'This month\'s detailed report', icon: BarChart3, color: 'from-blue-500 to-blue-700' },
          { title: 'Blood Usage Report', desc: 'How blood was utilized', icon: Droplets, color: 'from-green-500 to-green-700' },
          { title: 'Expiry Report', desc: 'Expired and near-expiry blood', icon: AlertTriangle, color: 'from-orange-500 to-orange-700' },
          { title: 'Inventory Report', desc: 'Full stock snapshot', icon: Package, color: 'from-purple-500 to-purple-700' },
          { title: 'Donor Report', desc: 'All donor statistics', icon: Users, color: 'from-indigo-500 to-indigo-700' },
        ].map(({ title, desc, icon: Icon, color }) => (
          <div key={title} className="dash-card">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-500 mb-4">{desc}</p>
            <div className="flex gap-2">
              <button onClick={() => handleExport('PDF')} className="flex-1 btn-primary text-xs py-2 px-3">PDF</button>
              <button onClick={() => handleExport('Excel')} className="flex-1 btn-secondary text-xs py-2 px-3">Excel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Appointments ─── */
function Appointments() {
  const appointments = [
    { id: 'APT001', donor: 'Suresh Babu', group: 'O+', date: '2026-07-08', time: '10:00 AM', status: 'confirmed' },
    { id: 'APT002', donor: 'Anitha Roy', group: 'A+', date: '2026-07-08', time: '11:30 AM', status: 'pending' },
    { id: 'APT003', donor: 'Vijay Sharma', group: 'B-', date: '2026-07-09', time: '09:00 AM', status: 'confirmed' },
    { id: 'APT004', donor: 'Kavya Reddy', group: 'AB+', date: '2026-07-10', time: '02:00 PM', status: 'pending' },
  ];
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Appointments</h1>
      <div className="dash-card overflow-x-auto">
        <table className="data-table">
          <thead><tr>
            <th>ID</th><th>Donor</th><th>Blood Group</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th>
          </tr></thead>
          <tbody>
            {appointments.map(apt => (
              <tr key={apt.id}>
                <td className="text-gray-400 font-mono text-xs">{apt.id}</td>
                <td className="font-medium text-gray-900 dark:text-white">{apt.donor}</td>
                <td><span className="blood-badge text-xs">{apt.group}</span></td>
                <td className="text-gray-600 dark:text-gray-400">{apt.date}</td>
                <td className="text-gray-600 dark:text-gray-400">{apt.time}</td>
                <td><span className={`badge-${apt.status === 'confirmed' ? 'approved' : 'pending'}`}>{apt.status}</span></td>
                <td>
                  <div className="flex gap-1">
                    {apt.status === 'pending' && <button onClick={() => toast.success('Appointment confirmed!')} className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 rounded-lg">Confirm</button>}
                    <button onClick={() => toast.success('Appointment rescheduled!')} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 rounded-lg">Reschedule</button>
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

/* ─── Notifications Page ─── */
function NotificationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Notifications</h1>
      <div className="space-y-3 max-w-2xl">
        {[...notifications, ...notifications.map((n, i) => ({ ...n, id: n.id + 10, read: true, time: `${i + 1} day ago` }))].map(notif => (
          <div key={notif.id} className={`dash-card flex items-start gap-4 ${!notif.read ? 'border-l-4 border-primary-500' : ''}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${notif.type === 'emergency' ? 'bg-red-100 text-red-600' :
                notif.type === 'stock' ? 'bg-yellow-100 text-yellow-600' :
                  notif.type === 'donor' ? 'bg-green-100 text-green-600' :
                    'bg-orange-100 text-orange-600'}`}>
              {notif.type === 'emergency' ? <AlertTriangle className="w-5 h-5" /> : notif.type === 'stock' ? <Package className="w-5 h-5" /> : notif.type === 'donor' ? <Users className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 dark:text-gray-200">{notif.message}</p>
              <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
            </div>
            {!notif.read && <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Settings ─── */
function Settings() {
  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Settings</h1>
      <div className="dash-card space-y-6">
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Blood Bank Profile</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { label: 'Blood Bank Name', placeholder: 'City Blood Bank', id: 'set-name' },
              { label: 'License Number', placeholder: 'NBTC-2024-XXXX', id: 'set-license' },
              { label: 'Contact Phone', placeholder: '+91 9876543210', id: 'set-phone' },
              { label: 'Email', placeholder: 'info@bloodbank.in', id: 'set-email' },
            ].map(f => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
                <input id={f.id} type="text" placeholder={f.placeholder} className="input-field text-sm" />
              </div>
            ))}
          </div>
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Notification Preferences</h2>
          {['Low stock alerts', 'Emergency requests', 'New donor registrations', 'Blood expiry alerts', 'Appointment reminders'].map(pref => (
            <label key={pref} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <span className="text-sm text-gray-700 dark:text-gray-300">{pref}</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 accent-primary-600" />
            </label>
          ))}
        </div>
        <button className="btn-primary" onClick={() => toast.success('Settings saved!')}>Save Changes</button>
      </div>
    </div>
  );
}

/* ─── Admin Router ─── */
export default function AdminPortal() {
  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="inventory" element={<BloodInventory />} />
      <Route path="donors" element={<DonorManagement />} />
      <Route path="requests" element={<BloodRequests />} />
      <Route path="appointments" element={<Appointments />} />
      <Route path="reports" element={<Reports />} />
      <Route path="notifications" element={<NotificationsPage />} />
      <Route path="settings" element={<Settings />} />
    </Routes>
  );
}
