import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Droplets, Search, ChevronDown, Phone, MapPin, Heart, Activity,
  Shield, Clock, Star, ChevronRight, Plus, AlertCircle, Award,
  Users, Building2, Zap, ArrowRight, CheckCircle, Calendar,
  Quote, ChevronUp, Mail, Send
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { t } from '../../utils/translations';
import { BLOOD_GROUPS, BLOOD_COMPATIBILITY, STATS, INDIAN_STATES } from '../../utils/constants';

/* ─── Animated Counter ─── */
function Counter({ end, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = end / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= end) { setCount(end); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─── Blood Drop SVG ─── */
function BloodDrop({ size = 40, animated = false }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={animated ? 'blood-drop' : ''}>
      <path d="M20 2C20 2 4 20 4 30C4 39.4 11.2 46 20 46C28.8 46 36 39.4 36 30C36 20 20 2 20 2Z"
        fill="url(#bloodGrad)" />
      <path d="M26 35C26 38.3 23.3 41 20 41" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
      <defs>
        <linearGradient id="bloodGrad" x1="20" y1="2" x2="20" y2="46" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff6b6b" />
          <stop offset="1" stopColor="#c0392b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── FAQ Item ─── */
function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
        aria-expanded={open}
      >
        <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{q}</span>
        {open ? <ChevronUp className="w-5 h-5 text-primary-600 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-5 text-gray-600 dark:text-gray-400 text-sm leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
          {a}
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const { language } = useTheme();
  const navigate = useNavigate();
  const [searchGroup, setSearchGroup] = useState('');
  const [searchCity, setSearchCity] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('A+');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?group=${searchGroup}&city=${searchCity}`);
  };

  const stats = [
    { label: t('totalBloodBanks', language), value: STATS.totalBloodBanks, icon: Building2, color: 'from-blue-500 to-blue-600', suffix: '+' },
    { label: t('totalDonors', language), value: STATS.totalDonors, icon: Users, color: 'from-green-500 to-green-600', suffix: '+' },
    { label: t('bloodUnitsAvailable', language), value: STATS.bloodUnitsAvailable, icon: Droplets, color: 'from-primary-500 to-primary-600', suffix: '+' },
    { label: t('livesSaved', language), value: STATS.livesSaved, icon: Heart, color: 'from-purple-500 to-purple-600', suffix: '+' },
  ];

  const howItWorks = [
    { step: '01', icon: Users, title: 'Register', desc: 'Sign up as a donor, patient, or blood bank owner in minutes.', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
    { step: '02', icon: Search, title: 'Search', desc: 'Find available blood by group, location, or blood bank.', color: 'text-primary-600 bg-primary-50 dark:bg-primary-950/30' },
    { step: '03', icon: Calendar, title: 'Connect', desc: 'Book appointments or submit blood requests instantly.', color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
    { step: '04', icon: Heart, title: 'Save Lives', desc: 'Complete the donation or receive blood — track everything live.', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
  ];

  const testimonials = [
    {
      name: 'Dr. Priya Sharma',
      role: 'Cardiologist, Apollo Hospital',
      avatar: 'P',
      color: 'from-pink-500 to-rose-600',
      text: 'BloodBridge has transformed how we manage blood requirements. Emergency requests are fulfilled in record time. It\'s a life-saving platform.',
      rating: 5,
    },
    {
      name: 'Ravi Kumar',
      role: 'Regular Blood Donor',
      avatar: 'R',
      color: 'from-blue-500 to-indigo-600',
      text: 'I\'ve donated 12 times through BloodBridge. The eligibility checker, appointment system, and digital certificates make it effortless. Proud to be a Gold Donor!',
      rating: 5,
    },
    {
      name: 'Anjali Reddy',
      role: 'Patient\'s Family Member',
      avatar: 'A',
      color: 'from-green-500 to-emerald-600',
      text: 'When my father needed O- blood urgently, BloodBridge found donors near our hospital within 30 minutes. This platform saved his life.',
      rating: 5,
    },
    {
      name: 'Suresh Babu',
      role: 'Blood Bank Manager, Hyderabad',
      avatar: 'S',
      color: 'from-orange-500 to-amber-600',
      text: 'The inventory management system is outstanding. We\'ve reduced expired blood waste by 70% and manage 500+ donors seamlessly.',
      rating: 5,
    },
  ];

  const faqs = [
    { q: 'Who can donate blood?', a: 'Anyone aged 18–65, weighing above 50 kg, in good health, with no recent illness or chronic diseases can donate blood. Our eligibility checker will assess your specific situation.' },
    { q: 'How often can I donate blood?', a: 'Whole blood can be donated every 90 days (3 months). Platelets can be donated every 2 weeks, and plasma every 28 days.' },
    { q: 'Is blood donation safe?', a: 'Yes, blood donation is completely safe. Sterile, disposable needles are used for each donor. The donation process is handled by trained medical professionals.' },
    { q: 'How do I request emergency blood?', a: 'Click the Emergency Request button on the homepage or call 1800-180-0099. Register as a patient and submit an emergency request — nearby blood banks are notified instantly.' },
    { q: 'How do blood banks join BloodBridge?', a: 'Blood bank owners can register by clicking "Register Blood Bank". After verification, you\'ll get access to the full management dashboard to manage inventory, donors, and requests.' },
    { q: 'Is my data secure?', a: 'Absolutely. We use enterprise-grade JWT authentication, bcrypt password hashing, and encrypted data storage. Your medical information is never shared without your consent.' },
    { q: 'Can I track my blood request?', a: 'Yes! After submitting a blood request, you can track its status in real-time from your Patient Dashboard — from Pending to Approved to Completed.' },
    { q: 'Do donors get any benefits?', a: 'Yes! Donors earn points and unlock tiers: Bronze (1+), Silver (5+), Gold (10+), Platinum (20+ donations). You also get digital certificates and a QR-coded donor ID card.' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ══════════════════════════════
          HERO SECTION
      ══════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden transition-colors duration-300"
        style={{ background: 'var(--hero-bg)' }}
        aria-label="Hero section"
      >
        {/* Animated particles */}
        {[...Array(12)].map((_, i) => (
          <div key={i} className="hero-particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${4 + Math.random() * 8}px`,
            height: `${4 + Math.random() * 8}px`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
          }} />
        ))}

        {/* Large decorative drop */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 pointer-events-none hidden lg:block">
          <svg viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full animate-float">
            <path d="M200 20C200 20 40 200 40 300C40 394 111 460 200 460C289 460 360 394 360 300C360 200 200 20 200 20Z" fill="currentColor" className="text-primary-500/20" />
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-gray-900 dark:text-white animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-200/50 dark:bg-white/10 border border-gray-300/50 dark:border-white/20 text-sm mb-6 backdrop-blur-sm">
                <Activity className="w-4 h-4 text-primary-600 dark:text-primary-300 animate-pulse" />
                <span className="text-gray-700 dark:text-white/90">India's #1 Blood Bank Network</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-black leading-tight mb-6">
                {t('heroTitle', language).split(' ').map((word, i) =>
                  ['Lives', 'Blood', 'জীবন', 'జీవితాలు', 'जीवन'].includes(word)
                    ? <span key={i} className="text-primary-600 dark:text-primary-300"> {word} </span>
                    : <span key={i}> {word} </span>
                )}
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 dark:text-white/80 mb-8 max-w-lg leading-relaxed">
                {t('heroSubtitle', language)}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 mb-10">
                <Link
                  to="/register?role=donor"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-white dark:bg-gray-900 text-primary-700 dark:text-primary-400 border border-gray-200 dark:border-gray-800 font-bold rounded-xl hover:bg-primary-50 dark:hover:bg-gray-800 transition-all hover:scale-105 shadow-lg"
                >
                  <Heart className="w-5 h-5 text-primary-550 dark:text-primary-400 animate-heartbeat" />
                  {t('becomeDonor', language)}
                </Link>
                <Link
                  to="/register?role=admin"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white border border-gray-300 dark:border-white/30 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition-all hover:scale-105 backdrop-blur-sm"
                >
                  <Building2 className="w-5 h-5" />
                  {t('registerBloodBank', language)}
                </Link>
                <Link
                  to="/emergency"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-red-650 hover:bg-red-600 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg animate-pulse"
                >
                  <AlertCircle className="w-5 h-5" />
                  {t('emergencyRequest', language)}
                </Link>
              </div>

              {/* Quick trust indicators */}
              <div className="flex flex-wrap gap-6 text-sm text-gray-500 dark:text-white/70">
                {[
                  { icon: Shield, label: '100% Secure' },
                  { icon: Clock, label: '24/7 Available' },
                  { icon: CheckCircle, label: 'Govt. Verified Banks' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-primary-600 dark:text-primary-300" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Blood Group Display */}
            <div className="hidden lg:flex flex-col items-center gap-6 animate-fade-in animation-delay-400">
              <div className="relative">
                <BloodDrop size={80} animated />
                <div className="absolute -right-4 top-4 w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-bold text-lg animate-float animation-delay-200">O-</div>
                <div className="absolute -left-6 bottom-4 w-14 h-14 rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-bold animate-float animation-delay-600">A+</div>
              </div>

              {/* Blood Stock Mini Widget */}
              <div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold text-sm">Live Blood Stock</h3>
                  <span className="flex items-center gap-1.5 text-xs text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    Live
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { group: 'A+', units: 245, pct: 80 },
                    { group: 'A-', units: 82, pct: 35 },
                    { group: 'B+', units: 310, pct: 90 },
                    { group: 'B-', units: 58, pct: 25 },
                    { group: 'AB+', units: 94, pct: 45 },
                    { group: 'AB-', units: 21, pct: 15 },
                    { group: 'O+', units: 420, pct: 95 },
                    { group: 'O-', units: 118, pct: 55 },
                  ].map(({ group, units, pct }) => (
                    <div key={group} className="text-center">
                      <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-white/10 mb-1.5 flex flex-col justify-end">
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-500 to-primary-400 transition-all"
                          style={{ height: `${pct}%` }}
                        />
                        <span className="relative text-white font-bold text-xs z-10 mb-1">{group}</span>
                      </div>
                      <p className="text-white/60 text-[10px]">{units}u</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/50 animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* ══════════════════════════════
          SEARCH BLOOD SECTION
      ══════════════════════════════ */}
      <section className="bg-white dark:bg-gray-900 py-12 border-b border-gray-100 dark:border-gray-800" id="search" aria-label="Search blood availability">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">
              {t('searchBlood', language)}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Find blood availability at nearby banks in seconds</p>
          </div>
          <form onSubmit={handleSearch} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="blood-group-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Blood Group</label>
                <select
                  id="blood-group-search"
                  value={searchGroup}
                  onChange={(e) => setSearchGroup(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="city-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City / Location</label>
                <input
                  id="city-search"
                  type="text"
                  placeholder="Enter city or pincode"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full justify-center gap-2 py-3.5">
                  <Search className="w-5 h-5" />
                  Search Now
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">Quick:</span>
              {BLOOD_GROUPS.map(g => (
                <button
                  key={g}
                  type="button"
                  onClick={() => { setSearchGroup(g); }}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    searchGroup === g
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-gray-900 text-primary-600 border-primary-200 dark:border-primary-800 hover:border-primary-400'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* ══════════════════════════════
          STATISTICS
      ══════════════════════════════ */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 py-20" aria-label="Statistics">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ label, value, icon: Icon, color, suffix }) => (
              <div key={label} className="text-center text-white">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-4xl sm:text-5xl font-display font-black mb-2">
                  <Counter end={value} suffix={suffix} />
                </div>
                <p className="text-white/80 text-sm font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          HOW IT WORKS
      ══════════════════════════════ */}
      <section className="section-container" aria-label="How it works" id="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Four simple steps to connect donors, patients, and blood banks</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 relative">
          {/* Connector line */}
          <div className="absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-primary-200 to-purple-200 dark:from-blue-900 dark:via-primary-900 dark:to-purple-900 hidden lg:block" />
          {howItWorks.map(({ step, icon: Icon, title, desc, color }, i) => (
            <div key={step} className={`text-center animate-fade-in`} style={{ animationDelay: `${i * 150}ms` }}>
              <div className={`relative w-16 h-16 rounded-2xl ${color} flex items-center justify-center mx-auto mb-4 z-10`}>
                <Icon className="w-7 h-7" />
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-white dark:bg-gray-900 border-2 border-current rounded-full text-xs font-bold flex items-center justify-center text-gray-700 dark:text-gray-300">{i+1}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          BLOOD COMPATIBILITY CHART
      ══════════════════════════════ */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16 lg:py-24" id="compatibility" aria-label="Blood compatibility chart">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title">Blood Compatibility Chart</h2>
          <p className="section-subtitle">Select your blood group to see compatibility details</p>

          {/* Group Selector */}
          <div className="flex flex-wrap justify-center gap-3 mt-8 mb-8">
            {BLOOD_GROUPS.map(group => (
              <button
                key={group}
                onClick={() => setSelectedGroup(group)}
                className={`w-14 h-14 rounded-xl font-bold text-sm border-2 transition-all duration-300 hover:scale-110 ${
                  selectedGroup === group
                    ? 'bg-primary-600 text-white border-primary-600 shadow-glow-red'
                    : 'bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800 hover:border-primary-400'
                }`}
              >
                {group}
              </button>
            ))}
          </div>

          {/* Compatibility Display */}
          {selectedGroup && BLOOD_COMPATIBILITY[selectedGroup] && (
            <div className="grid sm:grid-cols-2 gap-6 animate-slide-up">
              <div className="dash-card">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-green-500" />
                  Can Donate To
                </h3>
                <div className="flex flex-wrap gap-2">
                  {BLOOD_COMPATIBILITY[selectedGroup].canDonateTo.map(g => (
                    <span key={g} className="blood-badge bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">{g}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">{selectedGroup} blood can be donated to these blood groups.</p>
              </div>
              <div className="dash-card">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-blue-500" />
                  Can Receive From
                </h3>
                <div className="flex flex-wrap gap-2">
                  {BLOOD_COMPATIBILITY[selectedGroup].canReceiveFrom.map(g => (
                    <span key={g} className="blood-badge bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">{g}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">{selectedGroup} can receive from these blood groups.</p>
              </div>
            </div>
          )}

          {/* Full Chart Table */}
          <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="bg-primary-600 text-white">
                  <th className="px-4 py-3 font-semibold text-left">Blood Group</th>
                  {BLOOD_GROUPS.map(g => <th key={g} className="px-3 py-3 font-semibold text-center">{g}</th>)}
                </tr>
              </thead>
              <tbody>
                {BLOOD_GROUPS.map((donor, ri) => (
                  <tr key={donor} className={ri % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}>
                    <td className="px-4 py-3 font-bold text-primary-600 dark:text-primary-400">{donor}</td>
                    {BLOOD_GROUPS.map(recipient => {
                      const compatible = BLOOD_COMPATIBILITY[donor]?.canDonateTo.includes(recipient);
                      return (
                        <td key={recipient} className="px-3 py-3 text-center">
                          {compatible
                            ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                            : <span className="text-gray-300 dark:text-gray-600 text-lg">–</span>
                          }
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FEATURES / WHY BLOODBRIDGE
      ══════════════════════════════ */}
      <section className="section-container" id="features" aria-label="Features">
        <h2 className="section-title">Why Choose BloodBridge?</h2>
        <p className="section-subtitle">A complete ecosystem for blood donation and management</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {[
            { icon: Zap, title: 'Real-time Inventory', desc: 'Live blood stock updates across all registered blood banks — always know what\'s available.', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30' },
            { icon: AlertCircle, title: 'Emergency Alerts', desc: 'One-click emergency requests that instantly notify nearby blood banks and donors.', color: 'text-red-600 bg-red-50 dark:bg-red-950/30' },
            { icon: Shield, title: 'Secure & Verified', desc: 'Government-verified blood banks, JWT authentication, and encrypted data storage.', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
            { icon: Award, title: 'Donor Rewards', desc: 'Earn points and unlock Bronze, Silver, Gold, and Platinum badges for every donation.', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
            { icon: Activity, title: 'AI Assistant', desc: 'Intelligent chatbot for blood availability, donor eligibility, and emergency guidance.', color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
            { icon: MapPin, title: 'Map Integration', desc: 'Locate blood banks near you with interactive maps, directions, and distance info.', color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30' },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="dash-card hover:scale-105 transition-all duration-300 cursor-default">
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════
          TESTIMONIALS
      ══════════════════════════════ */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16 lg:py-24" id="testimonials" aria-label="Testimonials">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title">What People Say</h2>
          <p className="section-subtitle">Real stories from blood banks, donors, and patients across India</p>

          <div className="mt-12">
            {/* Active testimonial */}
            <div className="max-w-3xl mx-auto dash-card text-center p-8 animate-slide-up">
              <Quote className="w-10 h-10 text-primary-200 dark:text-primary-800 mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6 italic">
                "{testimonials[activeTestimonial].text}"
              </p>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <div className="flex items-center justify-center gap-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${testimonials[activeTestimonial].color} flex items-center justify-center text-white font-bold`}>
                  {testimonials[activeTestimonial].avatar}
                </div>
                <div className="text-left">
                  <p className="font-bold text-gray-900 dark:text-white">{testimonials[activeTestimonial].name}</p>
                  <p className="text-sm text-gray-500">{testimonials[activeTestimonial].role}</p>
                </div>
              </div>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`rounded-full transition-all ${i === activeTestimonial ? 'w-8 h-2.5 bg-primary-600' : 'w-2.5 h-2.5 bg-gray-300 dark:bg-gray-700 hover:bg-primary-300'}`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>

            {/* All testimonials mini cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {testimonials.map((t, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`text-left p-4 rounded-xl border transition-all ${i === activeTestimonial ? 'border-primary-400 bg-primary-50 dark:bg-primary-950/30' : 'border-gray-200 dark:border-gray-700 hover:border-primary-200 bg-white dark:bg-gray-900'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-xs`}>
                      {t.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900 dark:text-white">{t.name}</p>
                      <p className="text-[10px] text-gray-400">{t.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{t.text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          FAQ
      ══════════════════════════════ */}
      <section className="section-container" id="faq" aria-label="Frequently asked questions">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle">Everything you need to know about blood donation and our platform</p>
        <div className="max-w-3xl mx-auto mt-10 space-y-3">
          {faqs.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
        </div>
      </section>

      {/* ══════════════════════════════
          CONTACT
      ══════════════════════════════ */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16 lg:py-24" id="contact" aria-label="Contact us">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title">Contact Us</h2>
          <p className="section-subtitle">Have a question? We're here to help 24/7</p>

          <div className="grid lg:grid-cols-2 gap-12 mt-12">
            {/* Contact Info */}
            <div className="space-y-6">
              {[
                { icon: Phone, title: '24/7 Helpline', info: '1800-180-0099', sub: 'Toll-free, available round the clock', color: 'text-green-600 bg-green-50 dark:bg-green-950/30' },
                { icon: Mail, title: 'Email Support', info: 'info@bloodbridge.in', sub: 'We respond within 2 hours', color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
                { icon: MapPin, title: 'Head Office', info: 'National Blood Transfusion Council', sub: 'New Delhi, India – 110001', color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30' },
              ].map(({ icon: Icon, title, info, sub, color }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                    <p className="text-primary-600 dark:text-primary-400 font-medium">{info}</p>
                    <p className="text-sm text-gray-500">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Form */}
            <form
              onSubmit={(e) => { e.preventDefault(); alert('Message sent! We\'ll respond within 2 hours.'); setContactForm({ name: '', email: '', message: '' }); }}
              className="dash-card space-y-4"
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Your Name</label>
                  <input id="contact-name" type="text" required placeholder="Full name" value={contactForm.name}
                    onChange={e => setContactForm(p => ({ ...p, name: e.target.value }))}
                    className="input-field" />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                  <input id="contact-email" type="email" required placeholder="your@email.com" value={contactForm.email}
                    onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                    className="input-field" />
                </div>
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
                <textarea id="contact-message" rows={4} required placeholder="How can we help you?" value={contactForm.message}
                  onChange={e => setContactForm(p => ({ ...p, message: e.target.value }))}
                  className="input-field resize-none" />
              </div>
              <button type="submit" className="btn-primary w-full justify-center gap-2">
                <Send className="w-4 h-4" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          CTA BANNER
      ══════════════════════════════ */}
      <section className="bg-gradient-to-r from-primary-700 to-primary-900 py-20" aria-label="Call to action">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <BloodDrop size={60} animated />
          <h2 className="text-3xl sm:text-4xl font-display font-black mt-6 mb-4">
            Ready to Save Lives?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Join 156,000+ donors who have already made a difference. One donation can save up to 3 lives.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register?role=donor" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 font-bold rounded-xl hover:bg-primary-50 transition-all hover:scale-105 shadow-lg">
              <Heart className="w-5 h-5 animate-heartbeat" />
              Become a Donor Today
            </Link>
            <Link to="/search" className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white border border-white/30 font-bold rounded-xl hover:bg-white/20 transition-all hover:scale-105">
              <Search className="w-5 h-5" />
              Find Blood Near Me
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


