import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Droplets, Eye, EyeOff, AlertCircle, Building2, Heart, UserCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ROLES = [
  { id: 'admin', label: 'Blood Bank Owner', icon: Building2, color: 'from-blue-500 to-blue-700', desc: 'Manage your blood bank' },
  { id: 'donor', label: 'Blood Donor', icon: Heart, color: 'from-primary-500 to-primary-700', desc: 'Donate and save lives' },
  { id: 'patient', label: 'Patient / Requester', icon: UserCircle, color: 'from-purple-500 to-purple-700', desc: 'Request blood' },
];

export function LoginPage() {
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') || 'donor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const doLogin = async (emailVal, passwordVal) => {
    // Send only email + password — role is determined by the server from DB
    const response = await api.post('/auth/login', { email: emailVal, password: passwordVal });
    login(response.data.user, response.data.token);
    toast.success(`Welcome back, ${response.data.user.name}! 🎉`);
    const paths = { admin: '/admin', donor: '/donor', patient: '/patient', superadmin: '/superadmin' };
    navigate(paths[response.data.user.role] || '/');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await doLogin(email, password);
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const MOCK_DEMO_USERS = {
    'admin@bloodbridge.in': { name: 'Blood Bank Admin', email: 'admin@bloodbridge.in', role: 'admin', _id: 'demo-admin-id' },
    'donor@bloodbridge.in': { name: 'John Donor', email: 'donor@bloodbridge.in', role: 'donor', _id: 'demo-donor-id' },
    'patient@bloodbridge.in': { name: 'Jane Patient', email: 'patient@bloodbridge.in', role: 'patient', _id: 'demo-patient-id' },
    'super@bloodbridge.in': { name: 'Super Admin', email: 'super@bloodbridge.in', role: 'superadmin', _id: 'demo-super-id' },
  };

  const handleDemoLogin = async (demo) => {
    setDemoLoading(demo.email);
    try {
      await doLogin(demo.email, demo.password);
    } catch (err) {
      // Offline / Vercel fallback for demo accounts if server API call fails
      const mockUser = MOCK_DEMO_USERS[demo.email];
      if (mockUser) {
        login(mockUser, 'mock-demo-token-12345');
        toast.success(`Welcome back, ${mockUser.name}! (Demo Mode) 🎉`);
        const paths = { admin: '/admin', donor: '/donor', patient: '/patient', superadmin: '/superadmin' };
        navigate(paths[mockUser.role] || '/');
      } else {
        const msg = err.response?.data?.error || 'Demo login failed. Please try again.';
        toast.error(msg);
      }
    } finally {
      setDemoLoading(null);
    }
  };

  const demoLogins = [
    { email: 'admin@bloodbridge.in', password: 'admin123', role: 'admin', label: 'Blood Bank Owner' },
    { email: 'donor@bloodbridge.in', password: 'donor123', role: 'donor', label: 'Donor' },
    { email: 'patient@bloodbridge.in', password: 'patient123', role: 'patient', label: 'Patient' },
    { email: 'super@bloodbridge.in', password: 'super123', role: 'superadmin', label: 'Super Admin' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow-red">
              <Droplets className="w-7 h-7 text-white animate-heartbeat" />
            </div>
            <span className="text-2xl font-display font-bold text-gray-900 dark:text-white">Blood<span className="text-primary-600 dark:text-primary-400">Bridge</span></span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {ROLES.map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setRole(id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                role === id
                  ? `bg-gradient-to-br ${color} border-transparent text-white shadow-lg`
                  : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'
              }`}
            >
              <Icon className="w-5 h-5 mx-auto mb-1" />
              <p className="text-xs font-medium leading-tight">{label}</p>
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-glass">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <input
                id="login-email"
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <input type="checkbox" className="rounded border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                Forgot Password?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
              {loading ? <span className="spinner w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors">Sign Up</Link>
            </p>
          </div>
        </div>

        {/* Demo Accounts — clicking directly logs in */}
        <div className="mt-4 bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-3 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Demo Accounts (click to login instantly):
          </p>
          <div className="grid grid-cols-2 gap-2">
            {demoLogins.map(demo => (
              <button
                key={demo.email}
                onClick={() => handleDemoLogin(demo)}
                disabled={demoLoading !== null}
                className="text-left p-2.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 border border-transparent hover:border-primary-200 dark:hover:border-primary-900 transition-all disabled:opacity-50"
              >
                {demoLoading === demo.email ? (
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 border border-primary-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-primary-500">Logging in...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-primary-600 dark:text-primary-400">{demo.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{demo.email}</p>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(params.get('role') || 'donor');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    dob: '',
    gender: '',
    address: '',
    bankName: '',
    licenseNo: '',
    governmentRegistrationNumber: '',
    ownerName: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const updateForm = (field, val) => setForm(p => ({ ...p, [field]: val }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match!'); return; }
    if ((role === 'donor' || role === 'patient') && !form.bloodGroup) { toast.error('Please select your blood group.'); return; }
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
        role,
        bloodGroup: form.bloodGroup || undefined,
        dob: form.dob || undefined,
        gender: form.gender || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        pincode: form.pincode || undefined,
        bankName: form.bankName || undefined,
        licenseNumber: form.licenseNo || undefined,
        governmentRegistrationNumber: form.governmentRegistrationNumber || undefined,
        ownerName: form.ownerName || undefined,
      };

      const response = await api.post('/auth/register', payload);
      login(response.data.user, response.data.token);
      toast.success('🎉 Account created successfully! Welcome to BloodBridge!');
      const paths = { admin: '/admin', donor: '/donor', patient: '/patient', superadmin: '/superadmin' };
      navigate(paths[role] || '/');
    } catch (err) {
      // Show all validation errors if available, otherwise show specific error
      if (err.response?.data?.errors?.length) {
        err.response.data.errors.forEach(e => toast.error(e.msg));
      } else {
        toast.error(err.response?.data?.error || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gray-900 dark:text-white">Blood<span className="text-primary-600 dark:text-primary-400">Bridge</span></span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Create Account</h1>
        </div>

        {/* Role Selection */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {ROLES.map(({ id, label, icon: Icon, color, desc }) => (
            <button key={id} onClick={() => setRole(id)}
              className={`p-4 rounded-xl border text-center transition-all ${role === id ? `bg-gradient-to-br ${color} border-transparent text-white shadow-lg` : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-700'}`}>
              <Icon className="w-6 h-6 mx-auto mb-2" />
              <p className="text-xs font-semibold">{label}</p>
              <p className="text-[10px] opacity-70 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-glass">
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name *</label>
                <input type="text" required placeholder="Your full name" value={form.name}
                  onChange={e => updateForm('name', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email *</label>
                <input type="email" required placeholder="your@email.com" value={form.email}
                  onChange={e => updateForm('email', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone *</label>
                <input type="tel" required placeholder="+91 9876543210" value={form.phone}
                  onChange={e => updateForm('phone', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
              </div>
              {(role === 'donor' || role === 'patient') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Blood Group *</label>
                  <select required value={form.bloodGroup} onChange={e => updateForm('bloodGroup', e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm">
                    <option value="" className="bg-white dark:bg-gray-900">Select blood group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                      <option key={g} value={g} className="bg-white dark:bg-gray-900">{g}</option>
                    ))}
                  </select>
                </div>
              )}
              {role === 'admin' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Blood Bank Name *</label>
                    <input type="text" required placeholder="Your blood bank name" value={form.bankName}
                      onChange={e => updateForm('bankName', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">License Number *</label>
                    <input type="text" required placeholder="License Number" value={form.licenseNo}
                      onChange={e => updateForm('licenseNo', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Govt. Registration Number *</label>
                    <input type="text" required placeholder="Govt Registration Number" value={form.governmentRegistrationNumber}
                      onChange={e => updateForm('governmentRegistrationNumber', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Owner Name *</label>
                    <input type="text" required placeholder="Owner's Name" value={form.ownerName}
                      onChange={e => updateForm('ownerName', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Address *</label>
                    <input type="text" required placeholder="Street Address" value={form.address}
                      onChange={e => updateForm('address', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">City *</label>
                    <input type="text" required placeholder="City" value={form.city}
                      onChange={e => updateForm('city', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">State *</label>
                    <input type="text" required placeholder="State" value={form.state}
                      onChange={e => updateForm('state', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Pincode *</label>
                    <input type="text" required placeholder="Pincode" value={form.pincode}
                      onChange={e => updateForm('pincode', e.target.value)}
                      className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Password *</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required placeholder="Create password" value={form.password}
                    onChange={e => updateForm('password', e.target.value)} minLength={6}
                    className="w-full px-4 py-2.5 pr-10 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm Password *</label>
                <input type="password" required placeholder="Confirm password" value={form.confirmPassword}
                  onChange={e => updateForm('confirmPassword', e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
              </div>
            </div>

            <label className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer">
              <input type="checkbox" required className="mt-0.5 rounded border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 accent-primary-600" />
              <span>I agree to the <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link></span>
            </label>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-gray-900 dark:text-white">Blood<span className="text-primary-600 dark:text-primary-400">Bridge</span></span>
          </Link>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Reset Password</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">We'll send you a reset link</p>
        </div>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-glass">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-green-450" />
              </div>
              <h2 className="text-gray-900 dark:text-white font-bold text-lg mb-2">Email Sent!</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Check {email} for the password reset link.</p>
              <Link to="/login" className="btn-primary">Back to Login</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
                <input type="email" required placeholder="your@email.com" value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
              <Link to="/login" className="block text-center text-sm text-gray-555 dark:text-gray-450 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Back to Login
              </Link>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
