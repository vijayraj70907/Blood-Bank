import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Droplets, FileText,
  BarChart3, Settings, ShieldCheck, TrendingUp, Activity,
  Globe, CheckCircle, AlertTriangle, ChevronRight, Heart,
  Download, Search, Filter, UserCheck, Clock, Zap,
  Shield, Eye, Edit, Trash2, ToggleLeft, ToggleRight,
  PieChart, Calendar, Phone, MapPin
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS } from '../../utils/constants';
import toast from 'react-hot-toast';
import api from '../../utils/api';

/* ─── SuperAdmin Dashboard ─── */
function SuperDashboard() {
  const [stats, setStats] = useState({
    bloodBanks: 0, donors: 0, patients: 0, requests: 0, donations: 0, unitsStock: 0
  });
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/superadmin/dashboard');
        setStats({
          bloodBanks: res.data.stats.totalBloodBanks || 0,
          donors: res.data.stats.totalDonors || 0,
          patients: res.data.stats.totalPatients || 0,
          requests: res.data.stats.totalRequests || 0,
          donations: res.data.stats.totalDonations || 0,
          unitsStock: res.data.stats.pendingBanks || 0,
        });
        setBanks(res.data.banks || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const monthlyTrend = [
    { month: 'Jan', donations: 1200, requests: 950 },
    { month: 'Feb', donations: 1500, requests: 1100 },
    { month: 'Mar', donations: 1800, requests: 1450 },
    { month: 'Apr', donations: 1400, requests: 1200 },
    { month: 'May', donations: 2000, requests: 1600 },
    { month: 'Jun', donations: 2300, requests: 1850 },
    { month: 'Jul', donations: 2100, requests: 1700 },
  ];

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
          { label: 'Blood Banks', value: stats.bloodBanks, icon: Building2, color: 'from-blue-500 to-blue-700' },
          { label: 'Total Donors', value: stats.donors, icon: Users, color: 'from-primary-500 to-primary-700' },
          { label: 'Total Patients', value: stats.patients, icon: Heart, color: 'from-purple-500 to-purple-700' },
          { label: 'Total Requests', value: stats.requests, icon: FileText, color: 'from-indigo-500 to-indigo-700' },
          { label: 'Donations', value: stats.donations, icon: Droplets, color: 'from-red-500 to-red-700' },
          { label: 'Pending Banks', value: stats.unitsStock, icon: Clock, color: 'from-yellow-500 to-yellow-700' },
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
        {loading ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : banks.length > 0 ? (
          <table className="data-table">
            <thead><tr>
              <th>Blood Bank</th><th>City</th><th>State</th><th>Status</th><th>Action</th>
            </tr></thead>
            <tbody>
              {banks.map(bank => (
                <tr key={bank._id}>
                  <td>
                    <p className="font-semibold text-gray-900 dark:text-white">{bank.name}</p>
                  </td>
                  <td className="text-gray-600 dark:text-gray-400">{bank.city}</td>
                  <td className="text-gray-600 dark:text-gray-400">{bank.state}</td>
                  <td>
                    <span className={`badge-${bank.isVerified ? 'approved' : 'pending'}`}>{bank.isVerified ? 'Verified' : 'Pending'}</span>
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => toast.success(`Viewing ${bank.name}...`)} className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg">View</button>
                      {!bank.isVerified && (
                        <button onClick={() => toast.success('Bank approved!')} className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg">Approve</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-8">No blood banks registered yet</p>
        )}
      </div>
    </div>
  );
}

/* ─── Manage Blood Banks ─── */
function ManageBloodBanks() {
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/superadmin/bloodbanks');
        setBanks(res.data.banks || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load blood banks');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = banks.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || (b.city || '').toLowerCase().includes(search.toLowerCase()));

  const handleVerify = async (id) => {
    try {
      await api.put(`/superadmin/bloodbank/${id}`, { isVerified: true, isActive: true });
      setBanks(prev => prev.map(b => b._id === id ? { ...b, isVerified: true, isActive: true } : b));
      toast.success('Blood bank verified!');
    } catch (err) {
      toast.error('Failed to verify');
    }
  };

  const handleSuspend = async (id) => {
    try {
      await api.put(`/superadmin/bloodbank/${id}`, { isActive: false });
      setBanks(prev => prev.map(b => b._id === id ? { ...b, isActive: false } : b));
      toast.success('Blood bank suspended');
    } catch (err) {
      toast.error('Failed to suspend');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Blood Banks</h1>
          <p className="text-gray-500 text-sm mt-1">{banks.length} registered blood banks nationwide</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="search" placeholder="Search by name or city..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="dash-card overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>Blood Bank</th><th>Owner</th><th>City</th><th>State</th><th>Verified</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(bank => (
                <tr key={bank._id}>
                  <td>
                    <p className="font-semibold text-gray-900 dark:text-white">{bank.name}</p>
                    <p className="text-xs text-gray-400">{bank.address}</p>
                  </td>
                  <td className="text-gray-600 dark:text-gray-400 text-sm">{bank.owner?.name || '—'}</td>
                  <td className="text-gray-600 dark:text-gray-400">{bank.city}</td>
                  <td className="text-gray-600 dark:text-gray-400">{bank.state}</td>
                  <td><span className={`badge-${bank.isVerified ? 'approved' : 'pending'}`}>{bank.isVerified ? 'Verified' : 'Pending'}</span></td>
                  <td>
                    <div className="flex gap-1">
                      {!bank.isVerified && (
                        <button onClick={() => handleVerify(bank._id)} className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 transition-colors">Verify</button>
                      )}
                      <button onClick={() => handleSuspend(bank._id)} className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors">Suspend</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-gray-500 py-8">No blood banks found</p>}
        </div>
      )}
    </div>
  );
}

/* ─── Manage All Users ─── */
function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/superadmin/users');
        setUsers(res.data.users || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSuspend = async (id, isActive) => {
    try {
      await api.put(`/superadmin/user/${id}`, { isActive: !isActive });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: !isActive } : u));
      toast.success(isActive ? 'User suspended' : 'User activated');
    } catch (err) {
      toast.error('Failed to update user');
    }
  };

  const roleColor = { admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', donor: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400', patient: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', superadmin: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">All Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} registered users across all roles</p>
        </div>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Admins', count: users.filter(u => u.role === 'admin').length, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30', icon: Shield },
          { label: 'Donors', count: users.filter(u => u.role === 'donor').length, color: 'text-primary-600 bg-primary-50 dark:bg-primary-950/30', icon: Heart },
          { label: 'Patients', count: users.filter(u => u.role === 'patient').length, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30', icon: UserCheck },
          { label: 'Super Admins', count: users.filter(u => u.role === 'superadmin').length, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30', icon: ShieldCheck },
        ].map(({ label, count, color, icon: Icon }) => (
          <div key={label} className={`rounded-xl p-4 ${color}`}>
            <Icon className="w-5 h-5 mb-2" />
            <p className="text-2xl font-black font-display">{count}</p>
            <p className="text-sm font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="search" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="dash-card overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>User</th><th>Role</th><th>Phone</th><th>Status</th><th>Joined</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-sm">{u.name.charAt(0)}</div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${roleColor[u.role] || ''}`}>{u.role}</span></td>
                  <td className="text-gray-500 text-sm">{u.phone || '—'}</td>
                  <td><span className={`badge-${u.isActive ? 'approved' : 'rejected'}`}>{u.isActive ? 'Active' : 'Suspended'}</span></td>
                  <td className="text-gray-500 text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 rounded-lg" onClick={() => toast.success(`Viewing ${u.name}...`)}>View</button>
                      <button className={`px-2 py-1 text-xs rounded-lg ${u.isActive ? 'bg-red-100 dark:bg-red-900/30 text-red-700' : 'bg-green-100 dark:bg-green-900/30 text-green-700'}`} onClick={() => handleSuspend(u._id, u.isActive)}>{u.isActive ? 'Suspend' : 'Activate'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-gray-500 py-8">No users found</p>}
        </div>
      )}
    </div>
  );
}

/* ─── Manage Donors (Unique Page) ─── */
function ManageDonors() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/superadmin/users?role=donor');
        setDonors(res.data.users || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load donors');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = donors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) || (d.bloodGroup || '').includes(search.toUpperCase()) || (d.city || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleActive = async (id, isActive) => {
    try {
      await api.put(`/superadmin/user/${id}`, { isActive: !isActive });
      setDonors(prev => prev.map(d => d._id === id ? { ...d, isActive: !isActive } : d));
      toast.success(isActive ? 'Donor suspended' : 'Donor activated');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  // Blood group distribution
  const groupCounts = {};
  BLOOD_GROUPS.forEach(g => { groupCounts[g] = 0; });
  donors.forEach(d => { if (d.bloodGroup) groupCounts[d.bloodGroup]++; });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Donor Management</h1>
          <p className="text-gray-500 text-sm mt-1">{donors.length} registered blood donors</p>
        </div>
        <button className="btn-secondary text-sm py-2 px-4" onClick={() => {
          const csv = ['Name,Email,Phone,Blood Group,City,State,Status', ...donors.map(d => `${d.name},${d.email},${d.phone},${d.bloodGroup || 'N/A'},${d.city || ''},${d.state || ''},${d.isActive ? 'Active' : 'Suspended'}`)].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'donors.csv'; a.click();
          toast.success('Donors exported!');
        }}><Download className="w-4 h-4" />Export CSV</button>
      </div>

      {/* Blood Group Distribution */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
        {BLOOD_GROUPS.map(group => (
          <div key={group} className="dash-card text-center p-3 hover:scale-105 transition-all">
            <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-sm mb-2" style={{ background: BLOOD_GROUP_COLORS[group] }}>
              {group}
            </div>
            <p className="text-lg font-black text-gray-900 dark:text-white">{groupCounts[group]}</p>
            <p className="text-[10px] text-gray-500">donors</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="search" placeholder="Search by name, blood group, city..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="dash-card overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>Donor</th><th>Blood Group</th><th>Phone</th><th>City</th><th>Availability</th><th>Status</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-sm">{d.name.charAt(0)}</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{d.name}</p>
                        <p className="text-xs text-gray-400">{d.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {d.bloodGroup ? (
                      <span className="blood-badge text-xs">{d.bloodGroup}</span>
                    ) : (
                      <span className="text-xs text-gray-400">Not set</span>
                    )}
                  </td>
                  <td className="text-gray-600 dark:text-gray-400 text-sm">{d.phone || '—'}</td>
                  <td className="text-gray-600 dark:text-gray-400 text-sm">{d.city || '—'}</td>
                  <td>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${d.isAvailable ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {d.isAvailable ? '● Available' : '○ Unavailable'}
                    </span>
                  </td>
                  <td><span className={`badge-${d.isActive ? 'approved' : 'rejected'}`}>{d.isActive ? 'Active' : 'Suspended'}</span></td>
                  <td>
                    <div className="flex gap-1">
                      <button className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 rounded-lg" onClick={() => toast.success(`Viewing donor ${d.name}`)}>View</button>
                      <button className={`px-2 py-1 text-xs rounded-lg ${d.isActive ? 'bg-red-100 dark:bg-red-900/30 text-red-700' : 'bg-green-100 dark:bg-green-900/30 text-green-700'}`}
                        onClick={() => handleToggleActive(d._id, d.isActive)}>{d.isActive ? 'Suspend' : 'Activate'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-gray-500 py-8">No donors found</p>}
        </div>
      )}
    </div>
  );
}

/* ─── Manage Patients (Unique Page) ─── */
function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/superadmin/users?role=patient');
        setPatients(res.data.users || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase()) || (p.city || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleActive = async (id, isActive) => {
    try {
      await api.put(`/superadmin/user/${id}`, { isActive: !isActive });
      setPatients(prev => prev.map(p => p._id === id ? { ...p, isActive: !isActive } : p));
      toast.success(isActive ? 'Patient suspended' : 'Patient activated');
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Patient Records</h1>
          <p className="text-gray-500 text-sm mt-1">{patients.length} registered patients</p>
        </div>
        <button className="btn-secondary text-sm py-2 px-4" onClick={() => {
          const csv = ['Name,Email,Phone,City,State,Status,Joined', ...patients.map(p => `${p.name},${p.email},${p.phone},${p.city || ''},${p.state || ''},${p.isActive ? 'Active' : 'Suspended'},${new Date(p.createdAt).toLocaleDateString()}`)].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'patients.csv'; a.click();
          toast.success('Patients exported!');
        }}><Download className="w-4 h-4" />Export CSV</button>
      </div>

      {/* Patient Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Patients', count: patients.length, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30', icon: Users },
          { label: 'Active', count: patients.filter(p => p.isActive).length, color: 'text-green-600 bg-green-50 dark:bg-green-950/30', icon: CheckCircle },
          { label: 'Suspended', count: patients.filter(p => !p.isActive).length, color: 'text-red-600 bg-red-50 dark:bg-red-950/30', icon: AlertTriangle },
        ].map(({ label, count, color, icon: Icon }) => (
          <div key={label} className={`rounded-xl p-4 ${color}`}>
            <Icon className="w-5 h-5 mb-2" />
            <p className="text-2xl font-black font-display">{count}</p>
            <p className="text-sm font-medium">{label}</p>
          </div>
        ))}
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="search" placeholder="Search by name, email, city..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="dash-card overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>Patient</th><th>Phone</th><th>City</th><th>State</th><th>Verified</th><th>Status</th><th>Joined</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 font-bold text-sm">{p.name.charAt(0)}</div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-gray-600 dark:text-gray-400 text-sm">{p.phone || '—'}</td>
                  <td className="text-gray-600 dark:text-gray-400 text-sm">{p.city || '—'}</td>
                  <td className="text-gray-600 dark:text-gray-400 text-sm">{p.state || '—'}</td>
                  <td>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.isVerified ? '✓ Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td><span className={`badge-${p.isActive ? 'approved' : 'rejected'}`}>{p.isActive ? 'Active' : 'Suspended'}</span></td>
                  <td className="text-gray-500 text-sm">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-1">
                      <button className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 rounded-lg" onClick={() => toast.success(`Viewing ${p.name}`)}>View</button>
                      <button className={`px-2 py-1 text-xs rounded-lg ${p.isActive ? 'bg-red-100 dark:bg-red-900/30 text-red-700' : 'bg-green-100 dark:bg-green-900/30 text-green-700'}`}
                        onClick={() => handleToggleActive(p._id, p.isActive)}>{p.isActive ? 'Suspend' : 'Activate'}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center text-gray-500 py-8">No patients found</p>}
        </div>
      )}
    </div>
  );
}

/* ─── Manage Requests (Unique Page) ─── */
function ManageRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/superadmin/requests');
        setRequests(res.data.requests || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load requests');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);
  const emergencyCount = requests.filter(r => r.isEmergency).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Blood Requests</h1>
          <p className="text-gray-500 text-sm mt-1">{requests.length} total requests • {emergencyCount} emergencies</p>
        </div>
        <button className="btn-secondary text-sm py-2 px-4" onClick={() => {
          const csv = ['Patient,Blood Group,Units,Hospital,Emergency,Status,Date', ...requests.map(r => `${r.patientName},${r.bloodGroup},${r.units},${r.hospital},${r.isEmergency ? 'Yes' : 'No'},${r.status},${new Date(r.createdAt).toLocaleDateString()}`)].join('\n');
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'blood-requests.csv'; a.click();
          toast.success('Requests exported!');
        }}><Download className="w-4 h-4" />Export CSV</button>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'All', count: requests.length, color: 'text-gray-600 bg-gray-50 dark:bg-gray-800', key: 'all' },
          { label: 'Pending', count: requests.filter(r => r.status === 'pending').length, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30', key: 'pending' },
          { label: 'Approved', count: requests.filter(r => r.status === 'approved').length, color: 'text-green-600 bg-green-50 dark:bg-green-950/30', key: 'approved' },
          { label: 'Completed', count: requests.filter(r => r.status === 'completed').length, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30', key: 'completed' },
          { label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length, color: 'text-red-600 bg-red-50 dark:bg-red-950/30', key: 'rejected' },
        ].map(({ label, count, color, key }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`rounded-xl p-4 text-left transition-all ${color} ${filter === key ? 'ring-2 ring-primary-500 scale-105' : 'hover:scale-105'}`}>
            <p className="text-2xl font-black font-display">{count}</p>
            <p className="text-sm font-medium">{label}</p>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>
      ) : (
        <div className="space-y-4">
          {filtered.map(req => (
            <div key={req._id} className={`dash-card ${req.isEmergency ? 'border-l-4 border-red-500' : ''}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: BLOOD_GROUP_COLORS[req.bloodGroup] || '#d63031' }}>
                    {req.bloodGroup}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 dark:text-white">{req.patientName}</h3>
                      {req.isEmergency && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">
                          <Zap className="w-3 h-3" />EMERGENCY
                        </span>
                      )}
                      <span className={`badge-${req.status === 'blood arranged' ? 'approved' : req.status}`}>{req.status}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{req.hospital} • {req.units} unit(s)</p>
                    <p className="text-xs text-gray-400">By: {req.patient?.name || 'Unknown'} • {new Date(req.createdAt).toLocaleString()}</p>
                    {req.bloodBank && <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">Fulfilled by: {req.bloodBank.name}</p>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${req.emergencyLevel === 'Critical' ? 'bg-red-100 text-red-700' : req.emergencyLevel === 'High' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                    {req.emergencyLevel || 'Normal'}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="dash-card text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No {filter === 'all' ? '' : filter} requests found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Super Reports (Unique Page) ─── */
function SuperReports() {
  const handleExport = (type, report) => toast.success(`${report} ${type} report generated and downloading...`);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">National Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Generate and download comprehensive reports</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'National Blood Stock', desc: 'Current inventory across all blood banks', icon: Droplets, color: 'from-primary-500 to-primary-700' },
          { title: 'Donor Demographics', desc: 'Age, gender, blood group distribution', icon: Users, color: 'from-blue-500 to-blue-700' },
          { title: 'Request Analytics', desc: 'Request trends, approval rates, turnaround times', icon: BarChart3, color: 'from-indigo-500 to-indigo-700' },
          { title: 'Emergency Report', desc: 'SOS requests, response times, outcomes', icon: AlertTriangle, color: 'from-red-500 to-red-700' },
          { title: 'Blood Bank Performance', desc: 'Fulfillment rate, stock management', icon: Building2, color: 'from-green-500 to-green-700' },
          { title: 'Patient Report', desc: 'Patient registration trends, request patterns', icon: Heart, color: 'from-purple-500 to-purple-700' },
          { title: 'Donation Campaigns', desc: 'Camp-wise collection data and impact', icon: Calendar, color: 'from-orange-500 to-orange-700' },
          { title: 'Compliance Report', desc: 'Licensing, expiry tracking, regulatory compliance', icon: ShieldCheck, color: 'from-yellow-500 to-yellow-700' },
          { title: 'Regional Summary', desc: 'State-wise and city-wise breakdown', icon: Globe, color: 'from-teal-500 to-teal-700' },
        ].map(({ title, desc, icon: Icon, color }) => (
          <div key={title} className="dash-card group hover:scale-105 transition-all">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-gray-500 mb-4">{desc}</p>
            <div className="flex gap-2">
              <button onClick={() => handleExport('PDF', title)} className="flex-1 btn-primary text-xs py-2 px-3">PDF</button>
              <button onClick={() => handleExport('Excel', title)} className="flex-1 btn-secondary text-xs py-2 px-3">Excel</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Manage Permissions (New Page) ─── */
function ManagePermissions() {
  const [permissions, setPermissions] = useState({
    admin: {
      'Manage Blood Inventory': true,
      'View All Donors': true,
      'Approve Blood Requests': true,
      'Reject Blood Requests': true,
      'Manage Appointments': true,
      'Generate Reports': true,
      'View Emergency Alerts': true,
      'Respond to Emergencies': true,
      'Edit Blood Bank Profile': true,
      'Export Data': true,
      'Manage Notifications': true,
      'View Patient Info': true,
    },
    donor: {
      'Manage Blood Inventory': false,
      'View All Donors': false,
      'Approve Blood Requests': false,
      'Reject Blood Requests': false,
      'Manage Appointments': false,
      'Generate Reports': false,
      'View Emergency Alerts': true,
      'Respond to Emergencies': true,
      'Edit Blood Bank Profile': false,
      'Export Data': false,
      'Manage Notifications': false,
      'View Patient Info': false,
    },
    patient: {
      'Manage Blood Inventory': false,
      'View All Donors': false,
      'Approve Blood Requests': false,
      'Reject Blood Requests': false,
      'Manage Appointments': false,
      'Generate Reports': false,
      'View Emergency Alerts': true,
      'Respond to Emergencies': false,
      'Edit Blood Bank Profile': false,
      'Export Data': false,
      'Manage Notifications': false,
      'View Patient Info': false,
    },
  });

  const togglePerm = (role, perm) => {
    setPermissions(prev => ({
      ...prev,
      [role]: { ...prev[role], [perm]: !prev[role][perm] }
    }));
  };

  const allPerms = Object.keys(permissions.admin);

  const roleConfig = {
    admin: { label: 'Blood Bank Admin', icon: Shield, color: 'from-blue-500 to-blue-700', textColor: 'text-blue-600' },
    donor: { label: 'Blood Donor', icon: Heart, color: 'from-primary-500 to-primary-700', textColor: 'text-primary-600' },
    patient: { label: 'Patient', icon: UserCheck, color: 'from-purple-500 to-purple-700', textColor: 'text-purple-600' },
  };

  const permIcons = {
    'Manage Blood Inventory': Droplets,
    'View All Donors': Users,
    'Approve Blood Requests': CheckCircle,
    'Reject Blood Requests': AlertTriangle,
    'Manage Appointments': Calendar,
    'Generate Reports': BarChart3,
    'View Emergency Alerts': Zap,
    'Respond to Emergencies': Phone,
    'Edit Blood Bank Profile': Edit,
    'Export Data': Download,
    'Manage Notifications': Activity,
    'View Patient Info': Eye,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Role Permissions</h1>
          <p className="text-gray-500 text-sm mt-1">Control what each role can access and do in the system</p>
        </div>
        <button className="btn-primary text-sm py-2 px-4" onClick={() => toast.success('Permissions saved successfully!')}>
          <ShieldCheck className="w-4 h-4" />Save Permissions
        </button>
      </div>

      {/* Role overview cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {Object.entries(roleConfig).map(([role, config]) => {
          const enabledCount = Object.values(permissions[role]).filter(Boolean).length;
          return (
            <div key={role} className="dash-card">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                  <config.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white">{config.label}</h3>
                  <p className="text-xs text-gray-500">{enabledCount}/{allPerms.length} permissions enabled</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div className={`h-2 rounded-full bg-gradient-to-r ${config.color} transition-all duration-500`} style={{ width: `${(enabledCount / allPerms.length) * 100}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Matrix */}
      <div className="dash-card overflow-x-auto">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Access Control Matrix</h2>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 min-w-[240px]">Permission</th>
              {Object.entries(roleConfig).map(([role, config]) => (
                <th key={role} className="text-center py-3 px-6">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.color} flex items-center justify-center`}>
                      <config.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{config.label}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allPerms.map((perm, idx) => {
              const PermIcon = permIcons[perm] || Shield;
              return (
                <tr key={perm} className={`border-b border-gray-100 dark:border-gray-800 ${idx % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/20' : ''} hover:bg-gray-100/50 dark:hover:bg-gray-800/40 transition-colors`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <PermIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{perm}</span>
                    </div>
                  </td>
                  {['admin', 'donor', 'patient'].map(role => (
                    <td key={role} className="text-center py-3 px-6">
                      <button
                        onClick={() => togglePerm(role, perm)}
                        className={`transition-all duration-300 ${permissions[role][perm] ? 'text-green-500 hover:text-green-600' : 'text-gray-300 dark:text-gray-600 hover:text-gray-400'}`}
                        aria-label={`${permissions[role][perm] ? 'Disable' : 'Enable'} ${perm} for ${role}`}
                      >
                        {permissions[role][perm] ? (
                          <ToggleRight className="w-8 h-8 mx-auto" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 mx-auto" />
                        )}
                      </button>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Quick Actions */}
      <div className="dash-card">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {Object.entries(roleConfig).map(([role, config]) => (
            <div key={role} className="flex gap-2">
              <button onClick={() => {
                setPermissions(prev => ({
                  ...prev,
                  [role]: Object.fromEntries(allPerms.map(p => [p, true]))
                }));
                toast.success(`All permissions enabled for ${config.label}`);
              }} className="flex-1 text-xs py-2 px-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 transition-colors font-medium">
                Enable All — {config.label}
              </button>
              <button onClick={() => {
                setPermissions(prev => ({
                  ...prev,
                  [role]: Object.fromEntries(allPerms.map(p => [p, false]))
                }));
                toast.success(`All permissions disabled for ${config.label}`);
              }} className="flex-1 text-xs py-2 px-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 transition-colors font-medium">
                Disable All — {config.label}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Super Settings ─── */
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

/* ─── SuperAdmin Router ─── */
export default function SuperAdminPortal() {
  return (
    <Routes>
      <Route index element={<SuperDashboard />} />
      <Route path="bloodbanks" element={<ManageBloodBanks />} />
      <Route path="users" element={<ManageUsers />} />
      <Route path="donors" element={<ManageDonors />} />
      <Route path="patients" element={<ManagePatients />} />
      <Route path="requests" element={<ManageRequests />} />
      <Route path="reports" element={<SuperReports />} />
      <Route path="permissions" element={<ManagePermissions />} />
      <Route path="settings" element={<SuperSettings />} />
    </Routes>
  );
}
