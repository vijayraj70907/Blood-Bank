import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Heart, Activity, Calendar, Award, Bell, Camera,
  CheckCircle, XCircle, Clock, Download, MapPin,
  Star, ChevronRight, AlertTriangle, Phone, Droplets
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { DONATION_INTERVAL_DAYS, MIN_DONATION_AGE, MAX_DONATION_AGE, MIN_DONATION_WEIGHT, REWARD_TIERS, BLOOD_GROUPS } from '../../utils/constants';
import api from '../../utils/api';

const donationHistory = [
  { id: 'DON001', date: '2026-04-10', bank: 'City Blood Bank', units: 1, certificate: 'CERT-001', points: 100 },
  { id: 'DON002', date: '2025-12-15', bank: 'Apollo Blood Center', units: 1, certificate: 'CERT-002', points: 100 },
  { id: 'DON003', date: '2025-09-08', bank: 'AIIMS Blood Bank', units: 1, certificate: 'CERT-003', points: 100 },
  { id: 'DON004', date: '2025-05-20', bank: 'City Blood Bank', units: 1, certificate: 'CERT-004', points: 100 },
  { id: 'DON005', date: '2025-02-14', bank: 'Max Blood Bank', units: 1, certificate: 'CERT-005', points: 100 },
];

const donorStats = [
  { month: 'Jan', points: 0 },
  { month: 'Feb', points: 100 },
  { month: 'Mar', points: 0 },
  { month: 'Apr', points: 0 },
  { month: 'May', points: 100 },
  { month: 'Jun', points: 0 },
  { month: 'Jul', points: 0 },
];

/* ─── Donor Dashboard Overview ─── */
function DonorDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(user?.isAvailable ?? true);
  const [emergencyRequests, setEmergencyRequests] = useState([]);

  useEffect(() => {
    let active = true;
    const fetchDashboard = async () => {
      try {
        const [profRes, reqRes] = await Promise.all([
          api.get('/donor/profile'),
          api.get('/donor/requests')
        ]);
        if (active) {
          setProfile(profRes.data);
          setIsAvailable(profRes.data.donor?.isAvailable ?? true);
          setEmergencyRequests(reqRes.data.requests || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchDashboard();
    return () => { active = false; };
  }, []);

  const handleToggleAvailability = async () => {
    try {
      const newVal = !isAvailable;
      await api.put('/donor/availability', { isAvailable: newVal });
      setIsAvailable(newVal);
      toast.success(newVal ? 'You are now marked as available for donations!' : 'You are now marked as unavailable.');
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await api.put(`/donor/request/${requestId}/accept`);
      toast.success('Thank you! You have accepted the emergency donation request.');
      const reqRes = await api.get('/donor/requests');
      setEmergencyRequests(reqRes.data.requests || []);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to accept request');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="spinner w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalDonations = profile?.totalDonations ?? 0;
  const totalPoints = profile?.totalPoints ?? 0;
  const tier = REWARD_TIERS.filter(t => totalDonations >= t.minDonations).pop() || REWARD_TIERS[0];
  const nextTier = REWARD_TIERS.find(t => t.minDonations > totalDonations);
// Eligibility calculation
const lastDonationDate = profile?.donor?.lastDonation ? new Date(profile.donor.lastDonation) : null;
const today = new Date();
const daysSinceLast = lastDonationDate ? Math.floor((today - lastDonationDate) / (1000 * 60 * 60 * 24)) : Infinity;
const eligible = daysSinceLast >= DONATION_INTERVAL_DAYS;
const nextEligible = new Date();
nextEligible.setDate(today.getDate() + (DONATION_INTERVAL_DAYS - daysSinceLast));
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-700 to-primary-500 p-6 sm:p-8 text-white">
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute -right-4 -bottom-12 w-36 h-36 rounded-full bg-white/5" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-white/80 text-sm mb-1">Welcome back,</p>
            <h1 className="text-2xl sm:text-3xl font-display font-black">{profile?.donor?.name || user?.name || 'Donor'} 🩸</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-2xl">{tier.icon}</span>
              <span className="font-semibold">{tier.name} Donor</span>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">{totalPoints} pts</span>
            </div>
            {/* Availability Toggle */}
            <div className="mt-4 flex items-center gap-3 bg-black/20 rounded-xl px-4 py-2 text-sm w-fit border border-white/15">
              <label htmlFor="avail-toggle" className="font-medium cursor-pointer">Available for Emergency Donation</label>
              <button
                id="avail-toggle"
                onClick={handleToggleAvailability}
                className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  isAvailable ? 'bg-green-500' : 'bg-gray-400'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    isAvailable ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
          <Link to="/donor/book" className="inline-flex items-center gap-2 px-5 py-3 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-all flex-shrink-0">
            <Heart className="w-5 h-5 animate-heartbeat animate-pulse" /> Book Appointment
          </Link>
        </div>
      </div>

      {/* Active Emergency Requests */}
      <div className="dash-card border-2 border-red-100 dark:border-red-950">
        <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
          Active Emergency Requests in Your City ({emergencyRequests.length})
        </h2>
        {emergencyRequests.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 py-2">No active local emergency requests matching your blood group currently.</p>
        ) : (
          <div className="space-y-4">
            {emergencyRequests.map(req => (
              <div key={req._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50/10 dark:bg-red-950/5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-red-650 text-white text-xs font-bold">{req.bloodGroup}</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{req.patientName} needs {req.units} unit(s)</h3>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5 text-primary-500" />{req.hospital} ({req.city})</p>
                  <p className="text-xs text-red-500 font-medium mt-1">⌛ Required before: {new Date(req.requiredBefore).toLocaleString()}</p>
                </div>
                <button onClick={() => handleAcceptRequest(req._id)} className="btn-primary text-xs py-2.5 px-4 whitespace-nowrap">
                  Accept Request
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Donations', value: totalDonations, icon: Droplets, color: 'from-primary-500 to-primary-700', suffix: '' },
          { label: 'Total Points', value: totalPoints, icon: Star, color: 'from-yellow-500 to-orange-600', suffix: '' },
          { label: 'Lives Impacted', value: totalDonations * 3, icon: Heart, color: 'from-green-500 to-green-700', suffix: '' },
          { label: 'Donor Since', value: new Date(profile?.donor?.createdAt || Date.now()).getFullYear(), icon: Award, color: 'from-purple-500 to-purple-700', suffix: '' },
        ].map(({ label, value, icon: Icon, color, suffix }) => (
          <div key={label} className="dash-card text-center">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-3`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <p className="text-2xl font-display font-black text-gray-900 dark:text-white">{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Donation History Chart */}
        <div className="lg:col-span-2 dash-card">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Points Earned This Year</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={donorStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.1)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="points" fill="#d63031" radius={[4, 4, 0, 0]} name="Points" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Eligibility Status */}
        <div className="dash-card">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Eligibility Status</h2>
          <div className={`rounded-2xl p-5 text-center ${eligible ? 'bg-green-50 dark:bg-green-950/30 border-2 border-green-400' : 'bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-400'}`}>
            {eligible
              ? <><CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" /><p className="text-green-700 dark:text-green-400 font-bold text-lg">You're Eligible!</p><p className="text-sm text-green-600 dark:text-green-500 mt-1">Ready to donate today</p></>
              : <><Clock className="w-12 h-12 text-yellow-500 mx-auto mb-2" /><p className="text-yellow-700 dark:text-yellow-400 font-bold">Not Yet Eligible</p><p className="text-sm text-yellow-600 mt-1">{DONATION_INTERVAL_DAYS - daysSinceLast} days to go</p></>
            }
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Last donation</span>
              <span className="font-medium">{donationHistory[0].date}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Days since last</span>
              <span className="font-medium">{daysSinceLast} days</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
              <span>Next eligible</span>
              <span className="font-medium">{nextEligible.toLocaleDateString()}</span>
            </div>
          </div>
          {eligible && <Link to="/donor/book" className="btn-primary w-full justify-center mt-4 text-sm py-2.5">Book Appointment</Link>}
        </div>
      </div>

      {/* Recent Donations */}
      <div className="dash-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900 dark:text-white">Recent Donations</h2>
          <Link to="/donor/history" className="text-sm text-primary-600 dark:text-primary-400 flex items-center gap-1">View all <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="space-y-3">
          {donationHistory.slice(0, 3).map(d => (
            <div key={d.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600"><Heart className="w-5 h-5" /></div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white text-sm">{d.bank}</p>
                <p className="text-xs text-gray-400">{d.date}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-green-600">+{d.points} pts</p>
                <button onClick={() => toast.success('Certificate downloading...')} className="text-xs text-primary-600 dark:text-primary-400 flex items-center gap-0.5">
                  <Download className="w-3 h-3" />Cert
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



/* ─── Eligibility Checker ─── */
function EligibilityChecker() {
  const [form, setForm] = useState({ age: '', weight: '', lastDonation: '', hemoglobin: '', chronic: false, surgery: false, medication: false });
  const [result, setResult] = useState(null);

  const check = (e) => {
    e.preventDefault();
    const age = parseInt(form.age);
    const weight = parseFloat(form.weight);
    const hb = parseFloat(form.hemoglobin);
    const daysSinceLast = form.lastDonation ? Math.floor((new Date() - new Date(form.lastDonation)) / (1000 * 60 * 60 * 24)) : 999;

    const checks = [
      { label: 'Age (18-65 years)', pass: age >= 18 && age <= 65, detail: `Your age: ${age} years` },
      { label: 'Weight (>50 kg)', pass: weight >= 50, detail: `Your weight: ${weight} kg` },
      { label: `Last donation (90+ days ago)`, pass: daysSinceLast >= 90, detail: daysSinceLast >= 90 ? `${daysSinceLast} days ago ✓` : `Only ${daysSinceLast} days ago` },
      { label: 'Hemoglobin (≥12.5 g/dL)', pass: !hb || hb >= 12.5, detail: hb ? `Your Hb: ${hb} g/dL` : 'Not provided (assumed OK)' },
      { label: 'No chronic diseases', pass: !form.chronic, detail: form.chronic ? 'Chronic condition detected' : 'Clear' },
      { label: 'No recent surgery', pass: !form.surgery, detail: form.surgery ? 'Recent surgery detected' : 'Clear' },
      { label: 'No medication restrictions', pass: !form.medication, detail: form.medication ? 'Review medication first' : 'Clear' },
    ];
    setResult({ eligible: checks.every(c => c.pass), checks });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Eligibility Checker</h1>
        <p className="text-gray-500 text-sm mt-1">Check if you're ready to donate blood today</p>
      </div>
      <div className="dash-card">
        <form onSubmit={check} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Age (years) *</label>
              <input type="number" required min="1" max="100" placeholder="e.g. 28" value={form.age}
                onChange={e => setForm(p => ({ ...p, age: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Weight (kg) *</label>
              <input type="number" required min="1" placeholder="e.g. 65" value={form.weight}
                onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Last Donation Date</label>
              <input type="date" value={form.lastDonation}
                onChange={e => setForm(p => ({ ...p, lastDonation: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Hemoglobin (g/dL)</label>
              <input type="number" step="0.1" placeholder="e.g. 14.5" value={form.hemoglobin}
                onChange={e => setForm(p => ({ ...p, hemoglobin: e.target.value }))} className="input-field" />
            </div>
          </div>
          <div className="space-y-2">
            {[
              { key: 'chronic', label: 'Do you have any chronic diseases (diabetes, heart disease, HIV, etc.)?' },
              { key: 'surgery', label: 'Have you had surgery or major illness in the past 6 months?' },
              { key: 'medication', label: 'Are you currently on antibiotics or blood thinners?' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <input type="checkbox" checked={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.checked }))}
                  className="mt-0.5 accent-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </label>
            ))}
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-3"><Activity className="w-5 h-5" />Check Eligibility</button>
        </form>
      </div>

      {result && (
        <div className={`dash-card border-2 animate-slide-up ${result.eligible ? 'border-green-400' : 'border-red-400'}`}>
          <div className="text-center mb-6">
            {result.eligible
              ? <><CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" /><h2 className="text-2xl font-bold text-green-700 dark:text-green-400">You're Eligible to Donate!</h2><p className="text-gray-500 text-sm mt-1">You can safely donate blood today.</p><Link to="/donor/book" className="btn-primary mt-4 inline-flex">Book Appointment</Link></>
              : <><XCircle className="w-16 h-16 text-red-500 mx-auto mb-3" /><h2 className="text-2xl font-bold text-red-700 dark:text-red-400">Not Eligible Right Now</h2><p className="text-gray-500 text-sm mt-1">Please review the failed checks and consult a doctor if needed.</p></>
            }
          </div>
          <div className="space-y-2">
            {result.checks.map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                {c.pass ? <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" /> : <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />}
                <div>
                  <p className={`text-sm font-medium ${c.pass ? 'text-gray-800 dark:text-gray-200' : 'text-red-700 dark:text-red-400'}`}>{c.label}</p>
                  <p className="text-xs text-gray-400">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Book Donation ─── */
function BookDonation() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ bank: '', date: '', time: '' });
  const [booked, setBooked] = useState(false);

  const banks = [
    { id: '1', name: 'City Blood Bank', address: 'MG Road, Hyderabad', distance: '2.3 km', available: true },
    { id: '2', name: 'Apollo Blood Center', address: 'Jubilee Hills, Hyderabad', distance: '4.1 km', available: true },
    { id: '3', name: 'AIIMS Blood Bank', address: 'Banjara Hills, Hyderabad', distance: '6.8 km', available: true },
  ];
  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'];

  const handleBook = (e) => {
    e.preventDefault();
    setBooked(true);
    toast.success('Appointment booked! Check your email for confirmation.');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Book Donation Appointment</h1>

      {booked ? (
        <div className="dash-card text-center py-10">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Appointment Confirmed!</h2>
          <p className="text-gray-500 mb-1">Blood Bank: <strong>{form.bank}</strong></p>
          <p className="text-gray-500 mb-1">Date: <strong>{form.date}</strong></p>
          <p className="text-gray-500 mb-6">Time: <strong>{form.time}</strong></p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => toast.success('Added to calendar!')} className="btn-secondary text-sm py-2 px-4"><Calendar className="w-4 h-4" />Add to Calendar</button>
            <button onClick={() => { setBooked(false); setForm({ bank: '', date: '', time: '' }); setStep(1); }} className="btn-ghost text-sm">Book Another</button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleBook} className="dash-card space-y-5">
          {/* Step 1: Select Bank */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">1. Select Blood Bank</h2>
            <div className="space-y-2">
              {banks.map(bank => (
                <label key={bank.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${form.bank === bank.name ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-primary-200'}`}>
                  <input type="radio" name="bank" value={bank.name} checked={form.bank === bank.name}
                    onChange={e => setForm(p => ({ ...p, bank: e.target.value }))} className="accent-primary-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">{bank.name}</p>
                    <p className="text-sm text-gray-500">{bank.address}</p>
                  </div>
                  <span className="text-xs text-primary-600 font-medium">{bank.distance}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Step 2: Date */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">2. Select Date</h2>
            <input type="date" required value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
              min={new Date().toISOString().split('T')[0]} className="input-field" />
          </div>

          {/* Step 3: Time */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">3. Select Time Slot</h2>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map(slot => (
                <button key={slot} type="button" onClick={() => setForm(p => ({ ...p, time: slot }))}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${form.time === slot ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-primary-300'}`}>
                  {slot}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={!form.bank || !form.date || !form.time} className="btn-primary w-full justify-center py-3.5">
            <Calendar className="w-5 h-5" />Confirm Appointment
          </button>
        </form>
      )}
    </div>
  );
}

/* ─── Donation History ─── */
function DonationHistory() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Donation History</h1>
      <div className="space-y-4">
        {donationHistory.map((d, i) => (
          <div key={d.id} className="dash-card flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
              {donationHistory.length - i}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white">{d.bank}</h3>
              <p className="text-sm text-gray-500">{d.date} • {d.units} unit donated</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-600 font-semibold text-sm">+{d.points} pts</span>
              <button onClick={() => toast.success(`Certificate ${d.certificate} downloading...`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-xl text-sm font-medium hover:bg-primary-100 transition-colors">
                <Download className="w-4 h-4" />Certificate
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Rewards ─── */
function Rewards() {
  const totalDonations = donationHistory.length;
  const totalPoints = totalDonations * 100;
  const currentTier = REWARD_TIERS.filter(t => totalDonations >= t.minDonations).pop() || REWARD_TIERS[0];
  const nextTier = REWARD_TIERS.find(t => t.minDonations > totalDonations);
  const pct = nextTier ? ((totalDonations - currentTier.minDonations) / (nextTier.minDonations - currentTier.minDonations)) * 100 : 100;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Rewards & Achievements</h1>

      {/* Current Tier */}
      <div className={`dash-card reward-${currentTier.name.toLowerCase()} text-white p-8 text-center`} style={{ background: `linear-gradient(135deg, ${currentTier.color}, ${currentTier.color}99)` }}>
        <p className="text-6xl mb-3">{currentTier.icon}</p>
        <h2 className="text-3xl font-display font-black">{currentTier.name} Donor</h2>
        <p className="text-white/80 mt-1">{totalPoints} total points • {totalDonations} donations</p>
        {nextTier && (
          <div className="mt-4">
            <p className="text-sm text-white/80 mb-2">{nextTier.minDonations - totalDonations} more donations to reach {nextTier.icon} {nextTier.name}</p>
            <div className="progress-bar max-w-xs mx-auto">
              <div className="progress-fill" style={{ width: `${pct}%`, background: 'white' }} />
            </div>
          </div>
        )}
      </div>

      {/* All Tiers */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {REWARD_TIERS.map(tier => {
          const unlocked = totalDonations >= tier.minDonations;
          return (
            <div key={tier.name} className={`dash-card text-center transition-all ${unlocked ? 'opacity-100' : 'opacity-50'}`}>
              <p className="text-4xl mb-2">{tier.icon}</p>
              <h3 className="font-bold text-gray-900 dark:text-white">{tier.name}</h3>
              <p className="text-sm text-gray-500">{tier.minDonations}+ donations</p>
              {unlocked ? (
                <span className="mt-2 inline-block px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">Unlocked!</span>
              ) : (
                <span className="mt-2 inline-block px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full text-xs">Locked</span>
              )}
            </div>
          );
        })}
      </div>

      {/* QR Donor Card */}
      <div className="qr-card rounded-3xl p-8 text-white">
        <h2 className="text-xl font-bold mb-6 text-center">Your Digital Donor ID Card</h2>
        <div className="flex flex-col sm:flex-row gap-8 items-center">
          <div className="bg-white p-3 rounded-2xl flex-shrink-0">
            <QRCodeSVG value="BLOODBRIDGE-DONOR-D001-RAVI-KUMAR-A+" size={120} />
          </div>
          <div className="space-y-2 text-sm">
            <p><span className="text-white/60">Name:</span> <span className="font-semibold">Ravi Kumar</span></p>
            <p><span className="text-white/60">Blood Group:</span> <span className="font-semibold text-primary-300">A+</span></p>
            <p><span className="text-white/60">Donor ID:</span> <span className="font-mono">BB-DON-2025-001</span></p>
            <p><span className="text-white/60">Donations:</span> <span className="font-semibold">{totalDonations}</span></p>
            <p><span className="text-white/60">Tier:</span> <span className="font-semibold">{currentTier.icon} {currentTier.name}</span></p>
            <p><span className="text-white/60">Valid until:</span> <span>December 2026</span></p>
          </div>
        </div>
        <button className="btn-primary w-full justify-center mt-6 text-sm py-2.5" onClick={() => toast.success('Donor ID card downloading...')}>
          <Download className="w-4 h-4" />Download Donor ID Card
        </button>
      </div>
    </div>
  );
}

/* ─── Donor Profile ─── */
function DonorProfile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '',
    bloodGroup: user?.bloodGroup || 'A+',
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : '1995-05-15',
    weight: user?.weight || 72,
    gender: user?.gender || 'Male',
    phone: user?.phone || '',
    address: user?.address || 'Hyderabad, Telangana',
  });
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await api.put('/auth/profile', form);
      updateUser(response.data.user);
      toast.success('Profile saved to database successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">My Profile</h1>
      <div className="dash-card">
        {/* Avatar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 mb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-3xl">
              {form.name.charAt(0)}
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-50 shadow-sm">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{form.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="blood-badge mt-2">{form.bloodGroup}</span>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { label: 'Full Name', key: 'name', type: 'text' },
            { label: 'Date of Birth', key: 'dob', type: 'date' },
            { label: 'Weight (kg)', key: 'weight', type: 'number' },
            { label: 'Phone', key: 'phone', type: 'tel' },
          ].map(({ label, key, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>
              <input type={type} value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                className="input-field" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Blood Group</label>
            <select value={form.bloodGroup} onChange={e => setForm(p => ({ ...p, bloodGroup: e.target.value }))} className="input-field">
              {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Gender</label>
            <select value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))} className="input-field">
              {['Male', 'Female', 'Other'].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address</label>
            <input type="text" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} className="input-field" />
          </div>
        </div>
        <button className="btn-primary mt-6" disabled={saving} onClick={handleSaveProfile}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

/* ─── Donor Notifications ─── */
function DonorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get('/notifications');
        setNotifications(response.data.notifications || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="spinner w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getNotifStyles = (type) => {
    const styles = {
      emergency: { icon: '🚨', color: 'bg-red-100 text-red-650 dark:bg-red-950/30 dark:text-red-400' },
      stock: { icon: '📊', color: 'bg-blue-100 text-blue-650 dark:bg-blue-950/30 dark:text-blue-400' },
      donor: { icon: '🤝', color: 'bg-purple-100 text-purple-650 dark:bg-purple-950/30 dark:text-purple-400' },
      appointment: { icon: '📅', color: 'bg-green-100 text-green-650 dark:bg-green-950/30 dark:text-green-400' },
    };
    return styles[type] || { icon: '🔔', color: 'bg-gray-100 text-gray-650 dark:bg-gray-800 dark:text-gray-400' };
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-xl">
      <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Notifications</h1>
      <div className="space-y-3">
        {notifications.map((n) => {
          const style = getNotifStyles(n.type);
          return (
            <div key={n.id || n._id} className={`dash-card flex items-start gap-4 ${!n.read ? 'border-l-4 border-primary-500' : ''}`}>
              <div className={`w-10 h-10 rounded-xl ${style.color} flex items-center justify-center text-lg flex-shrink-0`}>{style.icon}</div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.message || n.desc}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          );
        })}
        {notifications.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No notifications yet.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Donor Router ─── */
export default function DonorPortal() {
  return (
    <Routes>
      <Route index element={<DonorDashboard />} />
      <Route path="profile" element={<DonorProfile />} />
      <Route path="eligibility" element={<EligibilityChecker />} />
      <Route path="book" element={<BookDonation />} />
      <Route path="history" element={<DonationHistory />} />
      <Route path="rewards" element={<Rewards />} />
      <Route path="notifications" element={<DonorNotifications />} />
    </Routes>
  );
}


