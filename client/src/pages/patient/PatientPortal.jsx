import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import {
  Search, MapPin, Phone, Clock, CheckCircle, AlertTriangle,
  FileText, Upload, ChevronRight, Heart, Zap, Download,
  Building2, Filter, Navigation
} from 'lucide-react';
import { BLOOD_GROUPS, BLOOD_GROUP_COLORS, INDIAN_STATES } from '../../utils/constants';
import toast from 'react-hot-toast';
import api from '../../utils/api';

/* ─── Patient Dashboard ─── */
function PatientDashboard() {
  const [requests, setRequests] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      try {
        const [reqRes, bankRes] = await Promise.all([
          api.get('/patient/requests'),
          api.get('/patient/search')
        ]);
        if (active) {
          setRequests(reqRes.data.requests || []);
          setBanks(bankRes.data.results || []);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadData();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="spinner w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">Patient Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">Find blood, track requests, and manage your health needs</p>
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: Search, title: 'Search Blood', desc: 'Find blood by group and location', href: '/patient/search', color: 'from-blue-500 to-blue-700' },
          { icon: FileText, title: 'Request Blood', desc: 'Submit a new blood request', href: '/patient/request', color: 'from-primary-500 to-primary-700' },
          { icon: Zap, title: 'Emergency', desc: 'One-click SOS blood request', href: '/patient/emergency', color: 'from-red-500 to-red-700', pulse: true },
        ].map(({ icon: Icon, title, desc, href, color, pulse }) => (
          <Link key={title} to={href}
            className={`relative overflow-hidden rounded-2xl p-5 text-white cursor-pointer hover:scale-105 transition-all duration-300 bg-gradient-to-br ${color} ${pulse ? 'animate-pulse-slow' : ''}`}>
            <Icon className="w-8 h-8 mb-3" />
            <h3 className="font-bold text-lg">{title}</h3>
            <p className="text-white/80 text-sm mt-1">{desc}</p>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/40" />
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Requests', value: requests.length, color: 'text-blue-600' },
          { label: 'Approved', value: requests.filter(r => ['approved', 'completed', 'blood arranged'].includes(r.status)).length, color: 'text-green-600' },
          { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, color: 'text-yellow-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className="dash-card text-center">
            <p className={`text-3xl font-display font-black ${color}`}>{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Requests */}
      <div className="dash-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Requests</h2>
          <Link to="/patient/history" className="text-sm text-primary-600 flex items-center gap-1">View all <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="space-y-3">
          {requests.slice(0, 3).map(req => (
            <div key={req._id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: BLOOD_GROUP_COLORS[req.bloodGroup] || '#d63031' }}>
                {req.bloodGroup}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{req.units} unit(s) of {req.bloodGroup}</p>
                <p className="text-xs text-gray-500 truncate">{req.hospital} • {new Date(req.createdAt).toLocaleDateString()}</p>
              </div>
              <span className={`badge-${req.status === 'blood arranged' ? 'approved' : req.status} flex-shrink-0`}>{req.status}</span>
            </div>
          ))}
          {requests.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No recent blood requests</p>
          )}
        </div>
      </div>

      {/* Nearby Banks Preview */}
      <div className="dash-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Nearby Blood Banks</h2>
          <Link to="/patient/search" className="text-sm text-primary-600 flex items-center gap-1">Search all <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {banks.slice(0, 2).map(bank => (
            <div key={bank.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{bank.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bank.isOpen24x7 || bank.openNow ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {bank.isOpen24x7 || bank.openNow ? 'Open' : 'Closed'}
                </span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{bank.address}, {bank.city}</p>
              <p className="text-xs text-primary-600 mt-1">{bank.phone}</p>
            </div>
          ))}
          {banks.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">No nearby blood banks found</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Search Blood ─── */
function SearchBlood() {
  const [filters, setFilters] = useState({ group: '', city: '', openOnly: false });
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get('/patient/search', {
        params: {
          group: filters.group,
          city: filters.city,
        }
      });
      const mapped = (response.data.results || []).map(bank => {
        const stockMap = {};
        if (Array.isArray(bank.stock)) {
          bank.stock.forEach(item => {
            stockMap[item.group] = item.units;
          });
        } else if (bank.stock && bank.stock.group) {
          stockMap[bank.stock.group] = bank.stock.units;
        }
        return {
          id: bank.id,
          name: bank.name,
          address: bank.address,
          city: bank.city,
          state: bank.state,
          phone: bank.phone,
          openNow: bank.isOpen24x7 || true,
          distance: 'Nearby',
          stock: stockMap
        };
      });
      setResults(mapped);
      setSearched(true);
      toast.success(`Found ${mapped.length} blood banks`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to search blood banks');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Search Blood</h1>
        <p className="text-gray-500 text-sm mt-1">Find blood availability at nearby banks</p>
      </div>

      <form onSubmit={handleSearch} className="dash-card space-y-4">
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Blood Group</label>
            <select value={filters.group} onChange={e => setFilters(p => ({ ...p, group: e.target.value }))} className="input-field">
              <option value="">All Groups</option>
              {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City / Location</label>
            <input type="text" placeholder="Enter city or pincode" className="input-field"
              onChange={e => setFilters(p => ({ ...p, city: e.target.value }))} />
          </div>
          <div className="flex items-end gap-3">
            <label className="flex items-center gap-2 mb-3 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={filters.openOnly} onChange={e => setFilters(p => ({ ...p, openOnly: e.target.checked }))} className="accent-primary-600" />
              Open now only
            </label>
          </div>
        </div>
        <button type="submit" className="btn-primary gap-2"><Search className="w-5 h-5" />Search Blood Banks</button>
      </form>

      {/* Results */}
      {searched && (
        <div className="space-y-4 animate-slide-up">
          <p className="text-sm text-gray-500">{results.length} blood bank(s) found</p>
          {results.length === 0 ? (
            <div className="dash-card text-center py-12">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-semibold">No blood banks found with {filters.group} available</p>
              <p className="text-sm text-gray-400 mt-1">Try a different blood group or location</p>
            </div>
          ) : (
            results.map(bank => (
              <div key={bank.id} className="dash-card">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{bank.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${bank.openNow ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                        {bank.openNow ? '● Open Now' : '○ Closed'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-4 h-4 text-primary-500" />{bank.address}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5"><Phone className="w-4 h-4 text-primary-500" />{bank.phone}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm text-primary-600 dark:text-primary-400 font-semibold">{bank.distance}</span>
                    <button className="btn-secondary text-sm py-2 px-3" onClick={() => toast.success('Opening maps...')}>
                      <Navigation className="w-4 h-4" />Navigate
                    </button>
                  </div>
                </div>

                {/* Blood Stock Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {BLOOD_GROUPS.map(group => {
                    const units = bank.stock[group] || 0;
                    const status = units === 0 ? 'empty' : units < 30 ? 'low' : 'good';
                    return (
                      <div key={group} className={`text-center p-2 rounded-xl ${status === 'empty' ? 'bg-gray-100 dark:bg-gray-800' : status === 'low' ? 'bg-yellow-50 dark:bg-yellow-950/30' : 'bg-green-50 dark:bg-green-950/30'}`}>
                        <div className="w-8 h-8 rounded-lg mx-auto flex items-center justify-center text-white text-xs font-bold mb-1" style={{ background: BLOOD_GROUP_COLORS[group] || '#d63031' }}>
                          {group}
                        </div>
                        <p className={`text-xs font-bold ${status === 'empty' ? 'text-gray-400' : status === 'low' ? 'text-yellow-700 dark:text-yellow-400' : 'text-green-700 dark:text-green-400'}`}>
                          {units === 0 ? '—' : units}
                        </p>
                        <p className="text-[9px] text-gray-400">{units === 0 ? 'N/A' : 'units'}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex gap-3">
                  <a href="/patient/request" className="btn-primary text-sm py-2.5 px-5 flex-1 justify-center">
                    <FileText className="w-4 h-4" />Request Blood
                  </a>
                  <a href={`tel:${bank.phone}`} className="btn-secondary text-sm py-2.5 px-4">
                    <Phone className="w-4 h-4" />Call
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {!searched && (
        <div className="dash-card text-center py-12">
          <Search className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-gray-400">Search for blood banks to see availability</p>
          <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">Filter by blood group, city, or distance</p>
        </div>
      )}
    </div>
  );
}

/* ─── Blood Request Form ─── */
function BloodRequest() {
  const [form, setForm] = useState({ patientName: '', group: '', units: 1, hospital: '', doctor: '', contact: '', emergency: false, notes: '' });
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('patientName', form.patientName);
      formData.append('doctorName', form.doctor);
      formData.append('hospital', form.hospital);
      formData.append('contactPhone', form.contact);
      formData.append('bloodGroup', form.group);
      formData.append('units', form.units);
      formData.append('notes', form.notes);
      formData.append('isEmergency', form.emergency);
      if (file) {
        formData.append('prescription', file);
      }

      await api.post('/patient/request', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSubmitted(true);
      toast.success('Blood request submitted! Nearby blood banks have been notified.');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to submit blood request');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 animate-fade-in max-w-lg">
        <div className="dash-card text-center py-10">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Submitted!</h2>
          <p className="text-gray-500 mb-4">Your blood request has been sent to nearby blood banks. You'll receive a response within 2 hours.</p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 text-left space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Request ID:</span><span className="font-mono font-bold">REQ-{Date.now().toString().slice(-6)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Blood Group:</span><span className="font-semibold">{form.group}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Units:</span><span className="font-semibold">{form.units}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Hospital:</span><span className="font-semibold">{form.hospital}</span></div>
          </div>
          <div className="flex gap-3 justify-center">
            <a href="/patient/history" className="btn-primary text-sm py-2.5 px-5">Track Request</a>
            <button onClick={() => setSubmitted(false)} className="btn-ghost text-sm py-2.5">New Request</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Request Blood</h1>
        <p className="text-gray-500 text-sm mt-1">Fill in the details and nearby blood banks will respond</p>
      </div>

      <form onSubmit={handleSubmit} className="dash-card space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Patient Name *', key: 'patientName', type: 'text', placeholder: 'Patient full name' },
            { label: 'Doctor Name *', key: 'doctor', type: 'text', placeholder: 'Attending doctor' },
            { label: 'Hospital / Clinic *', key: 'hospital', type: 'text', placeholder: 'Hospital name & address' },
            { label: 'Contact Number *', key: 'contact', type: 'tel', placeholder: '+91 9876543210' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
              <input type={type} required placeholder={placeholder} value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className="input-field" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Blood Group Required *</label>
            <select required value={form.group} onChange={e => setForm(p => ({ ...p, group: e.target.value }))} className="input-field">
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Units Required *</label>
            <input type="number" required min="1" max="20" value={form.units}
              onChange={e => setForm(p => ({ ...p, units: parseInt(e.target.value) }))} className="input-field" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Additional Notes</label>
          <textarea rows={3} placeholder="Any additional medical information..." value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className="input-field resize-none" />
        </div>

        {/* Prescription Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Upload Prescription (Optional)</label>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center hover:border-primary-400 transition-colors cursor-pointer"
            onClick={() => document.getElementById('prescription-upload').click()}>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">{file ? file.name : 'Click to upload prescription'}</p>
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG up to 5MB</p>
            <input id="prescription-upload" type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png"
              onChange={e => setFile(e.target.files[0])} />
          </div>
        </div>

        {/* Emergency Toggle */}
        <label className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl cursor-pointer border-2 border-red-100 dark:border-red-900 hover:border-red-300 transition-colors">
          <input type="checkbox" checked={form.emergency} onChange={e => setForm(p => ({ ...p, emergency: e.target.checked }))}
            className="w-4 h-4 accent-red-600" />
          <div>
            <p className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" />Mark as Emergency</p>
            <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">This will immediately notify all nearby blood banks and donors</p>
          </div>
        </label>

        <button type="submit" disabled={loading} className={`w-full justify-center py-3.5 ${form.emergency ? 'bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 transition-colors' : 'btn-primary'}`}>
          {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FileText className="w-5 h-5" />{form.emergency ? '🚨 Submit Emergency Request' : 'Submit Blood Request'}</>}
        </button>
      </form>
    </div>
  );
}

/* ─── Emergency Request ─── */
function EmergencyRequest() {
  const [form, setForm] = useState({
    patientName: '',
    bloodGroup: '',
    units: 1,
    hospital: '',
    hospitalAddress: '',
    city: '',
    contactPhone: '',
    attenderName: '',
    requiredBefore: '',
    emergencyLevel: 'Critical'
  });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifiedStats, setNotifiedStats] = useState({ bloodBanks: 0, donors: 0 });

  const handleSOS = async (e) => {
    e.preventDefault();
    if (!form.bloodGroup) { toast.error('Please select blood group'); return; }
    setLoading(true);
    try {
      const response = await api.post('/patient/emergency', form);
      setNotifiedStats({
        bloodBanks: response.data.notified.bloodBanks,
        donors: response.data.notified.donors
      });
      setSent(true);
      toast.success(response.data.message);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'SOS Request failed');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="space-y-6 animate-fade-in max-w-lg mx-auto">
        <div className="dash-card text-center py-12 border-2 border-red-400">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">SOS Sent!</h2>
          <p className="text-gray-500 mb-4">Emergency alert sent to {notifiedStats.bloodBanks} nearby blood banks and {notifiedStats.donors} donors with {form.bloodGroup} blood.</p>
          <p className="text-sm text-gray-500 mt-4">Average response time: <strong>15-30 minutes</strong></p>
          <div className="flex gap-3 justify-center mt-6">
            <a href="tel:1800-180-0099" className="btn-primary gap-2"><Phone className="w-4 h-4" />Call Helpline</a>
            <button onClick={() => setSent(false)} className="btn-ghost text-sm">New SOS</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Emergency Blood Request</h1>
        <p className="text-gray-500 text-sm mt-1">Submit SOS to notify all nearby blood banks and donors instantly</p>
      </div>

      <form onSubmit={handleSOS} className="bg-red-50 dark:bg-red-950/20 border-2 border-red-300 dark:border-red-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-3 justify-center text-center pb-2 border-b border-red-200 dark:border-red-900">
          <AlertTriangle className="w-8 h-8 text-red-600 animate-pulse" />
          <div>
            <h2 className="text-xl font-bold text-red-700 dark:text-red-400">Emergency SOS</h2>
            <p className="text-xs text-red-650 dark:text-red-450">Alerts nearby blood banks and donors in your city instantly</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 col-span-2">
          <div>
            <label className="block text-sm font-medium text-red-700 dark:text-red-355 mb-1.5">Patient Name *</label>
            <input type="text" required placeholder="Patient's Full Name" value={form.patientName}
              onChange={e => setForm(p => ({ ...p, patientName: e.target.value }))} className="input-field border-red-300 focus:ring-red-500 text-gray-900 dark:text-white dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-red-700 dark:text-red-355 mb-1.5">Attender Name *</label>
            <input type="text" required placeholder="Attender's Full Name" value={form.attenderName}
              onChange={e => setForm(p => ({ ...p, attenderName: e.target.value }))} className="input-field border-red-300 focus:ring-red-500 text-gray-900 dark:text-white dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-red-700 dark:text-red-355 mb-1.5">Hospital Name *</label>
            <input type="text" required placeholder="Hospital Name" value={form.hospital}
              onChange={e => setForm(p => ({ ...p, hospital: e.target.value }))} className="input-field border-red-300 focus:ring-red-500 text-gray-900 dark:text-white dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-red-700 dark:text-red-355 mb-1.5">Hospital Address *</label>
            <input type="text" required placeholder="Hospital Street Address" value={form.hospitalAddress}
              onChange={e => setForm(p => ({ ...p, hospitalAddress: e.target.value }))} className="input-field border-red-300 focus:ring-red-500 text-gray-900 dark:text-white dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-red-700 dark:text-red-355 mb-1.5">City *</label>
            <input type="text" required placeholder="City" value={form.city}
              onChange={e => setForm(p => ({ ...p, city: e.target.value }))} className="input-field border-red-300 focus:ring-red-500 text-gray-900 dark:text-white dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-red-700 dark:text-red-355 mb-1.5">Contact Number *</label>
            <input type="tel" required placeholder="Emergency Contact" value={form.contactPhone}
              onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))} className="input-field border-red-300 focus:ring-red-500 text-gray-900 dark:text-white dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-red-700 dark:text-red-355 mb-1.5">Units Required *</label>
            <input type="number" required min="1" max="20" value={form.units}
              onChange={e => setForm(p => ({ ...p, units: parseInt(e.target.value) }))} className="input-field border-red-300 focus:ring-red-500 text-gray-900 dark:text-white dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-red-700 dark:text-red-355 mb-1.5">Required Before *</label>
            <input type="datetime-local" required value={form.requiredBefore}
              onChange={e => setForm(p => ({ ...p, requiredBefore: e.target.value }))} className="input-field border-red-300 focus:ring-red-500 text-gray-900 dark:text-white dark:bg-gray-900" />
          </div>
          <div>
            <label className="block text-sm font-medium text-red-700 dark:text-red-355 mb-1.5">Emergency Level *</label>
            <select required value={form.emergencyLevel} onChange={e => setForm(p => ({ ...p, emergencyLevel: e.target.value }))} className="input-field border-red-300 focus:ring-red-500 text-gray-900 dark:text-white dark:bg-gray-900">
              <option value="Critical">Critical (ASAP)</option>
              <option value="High">High (Within 12 hours)</option>
              <option value="Normal">Normal (Within 24 hours)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-red-700 dark:text-red-355 mb-1.5">Blood Group Required *</label>
            <select required value={form.bloodGroup} onChange={e => setForm(p => ({ ...p, bloodGroup: e.target.value }))} className="input-field border-red-300 focus:ring-red-500 text-gray-900 dark:text-white dark:bg-gray-900">
              <option value="">Select blood group</option>
              {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="emergency-ring relative w-full py-4 bg-red-650 hover:bg-red-700 text-white font-black text-xl rounded-2xl transition-all hover:scale-105 shadow-glow-red-lg disabled:opacity-50"
        >
          {loading ? 'Sending SOS...' : '🚨 SEND SOS NOW'}
        </button>
      </form>

      <div className="dash-card">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Or Call Directly</h2>
        <div className="space-y-3">
          {nearbyBanks.slice(0, 3).map(bank => (
            <div key={bank._id || bank.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{bank.name}</p>
                <p className="text-xs text-gray-500">{bank.city}</p>
              </div>
              <div className="flex items-center gap-2">
                <a href={`tel:${bank.phone}`} className="btn-primary text-sm py-1.5 px-3">
                  <Phone className="w-4 h-4" />Call
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-4 bg-primary-50 dark:bg-primary-950/30 rounded-xl text-center">
          <p className="text-sm font-semibold text-primary-700 dark:text-primary-400">24/7 Emergency Helpline</p>
          <a href="tel:1800-180-0099" className="text-2xl font-black text-primary-600 dark:text-primary-400 hover:text-primary-500 transition-colors">1800-180-0099</a>
          <p className="text-xs text-gray-500 mt-0.5">Toll-free • Available 24/7</p>
        </div>
      </div>
    </div>
  );
}

/* ─── Request History ─── */
function RequestHistory() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/patient/requests');
        setRequests(response.data.requests || []);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load request history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="spinner w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">My Blood Requests</h1>
      <div className="space-y-4">
        {requests.map(req => (
          <div key={req._id} className="dash-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: BLOOD_GROUP_COLORS[req.bloodGroup] || '#d63031' }}>
                  {req.bloodGroup}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-gray-900 dark:text-white">{req.units} unit(s) of {req.bloodGroup}</h3>
                    <span className={`badge-${req.status === 'blood arranged' ? 'approved' : req.status}`}>{req.status}</span>
                  </div>
                  <p className="text-sm text-gray-500">{req.hospital}</p>
                  <p className="text-xs text-gray-400">#{req._id.slice(-6).toUpperCase()} • {new Date(req.createdAt).toLocaleString()}</p>
                  {req.bloodBank && <p className="text-xs text-primary-600 dark:text-primary-400 mt-0.5">Fulfilled by: {req.bloodBank.name}</p>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {req.status === 'completed' && (
                  <button onClick={() => toast.success('Receipt downloading...')} className="btn-secondary text-sm py-2 px-4">
                    <Download className="w-4 h-4" />Receipt
                  </button>
                )}
                {req.status === 'approved' && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium px-4 py-2 bg-green-50 dark:bg-green-950/30 rounded-xl">
                    <CheckCircle className="w-4 h-4" />Approved
                  </span>
                )}
              </div>
            </div>

            {/* Status Tracker */}
            <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
              {['Submitted', 'Under Review', 'Approved', 'Completed'].map((stage, i) => {
                const stages = { submitted: 0, pending: 1, approved: 2, completed: 3, rejected: 0, 'blood arranged': 2 };
                const current = stages[req.status] || 0;
                const done = i <= current;
                return (
                  <React.Fragment key={stage}>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? 'bg-primary-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}>
                        {done ? '✓' : i + 1}
                      </div>
                      <p className={`text-[10px] mt-1 ${done ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`}>{stage}</p>
                    </div>
                    {i < 3 && <div className={`flex-1 h-0.5 min-w-[20px] ${i < current ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
        {requests.length === 0 && (
          <p className="text-gray-500 text-center py-8">You haven't made any requests yet.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Patient Notifications ─── */
function PatientNotifications() {
  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Notifications</h1>
      <div className="space-y-3">
        {[
          { icon: '✅', title: 'Request Approved!', desc: 'Your O+ blood request has been approved by City Blood Bank.', time: '30 min ago', unread: true },
          { icon: '📋', title: 'Request Under Review', desc: 'Blood bank is reviewing your request REQ-001.', time: '2 hrs ago', unread: false },
          { icon: '📞', title: 'Blood Bank Contacted You', desc: 'City Blood Bank tried to call you. Call back: 040-23456789', time: '3 hrs ago', unread: false },
        ].map((n, i) => (
          <div key={i} className={`dash-card flex items-start gap-4 ${n.unread ? 'border-l-4 border-primary-500' : ''}`}>
            <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-lg flex-shrink-0">{n.icon}</div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white text-sm">{n.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{n.desc}</p>
              <p className="text-xs text-gray-400 mt-1">{n.time}</p>
            </div>
            {n.unread && <span className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1.5" />}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Patient Router ─── */
export default function PatientPortal() {
  return (
    <Routes>
      <Route index element={<PatientDashboard />} />
      <Route path="search" element={<SearchBlood />} />
      <Route path="request" element={<BloodRequest />} />
      <Route path="emergency" element={<EmergencyRequest />} />
      <Route path="history" element={<RequestHistory />} />
      <Route path="notifications" element={<PatientNotifications />} />
    </Routes>
  );
}
