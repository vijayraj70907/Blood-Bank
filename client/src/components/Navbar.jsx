import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { t } from '../utils/translations';
import {
  Heart, Menu, X, Sun, Moon, Globe, Bell, User,
  ChevronDown, Droplets, LogOut, LayoutDashboard
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳' },
];

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme, language, setLanguage } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const getDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'superadmin': return '/superadmin';
      case 'admin': return '/admin';
      case 'donor': return '/donor';
      case 'patient': return '/patient';
      default: return '/';
    }
  };

  const navLinks = [
    { label: t('home', language), href: '/' },
    { label: t('bloodBanks', language), href: '/register?role=admin' },
    { label: t('donate', language), href: '/register?role=donor' },
    { label: t('about', language), href: '/#how-it-works' },
    { label: t('contact', language), href: '/#contact' },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl shadow-lg border-b border-gray-200 dark:border-gray-800'
          : 'bg-transparent'
          }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group" aria-label="BloodBridge Home">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow-red group-hover:scale-110 transition-transform">
                <Droplets className="w-6 h-6 text-white animate-heartbeat" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-display font-bold text-gray-900 dark:text-white">
                  Blood<span className="text-primary-600">Bridge</span>
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">Save Lives</p>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`nav-link text-sm font-medium pb-1 ${location.pathname === link.href
                    ? 'text-primary-600 dark:text-primary-400'
                    : scrolled
                      ? 'text-gray-700 dark:text-gray-300'
                      : 'text-gray-800 dark:text-white/90 hover:text-primary-600 dark:hover:text-white'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Language Switcher - Hidden on mobile, available in mobile drawer */}
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setLangOpen(!langOpen)}
                  className={`flex items-center gap-1 p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-gray-700 dark:text-white/80 hover:text-primary-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                  aria-label="Change language"
                  aria-expanded={langOpen}
                >
                  <Globe className="w-5 h-5" />
                  <span className="hidden sm:block text-xs font-medium">{LANGUAGES.find(l => l.code === language)?.label}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${langOpen ? 'rotate-180' : ''}`} />
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${language === lang.code ? 'text-primary-600 bg-primary-50 dark:bg-primary-950' : 'text-gray-700 dark:text-gray-300'
                          }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle - Hidden on mobile, available in mobile drawer */}
              <button
                onClick={toggleTheme}
                className={`hidden sm:flex p-2 rounded-lg transition-all duration-300 ${scrolled ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-gray-700 dark:text-white/80 hover:text-primary-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                  }`}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {isAuthenticated ? (
                <>
                  {/* Notification Bell */}
                  <Link
                    to={getDashboardPath() + '/notifications'}
                    className={`relative p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800' : 'text-gray-700 dark:text-white/80 hover:text-primary-600 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10'
                      }`}
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full notification-dot"></span>
                  </Link>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserOpen(!userOpen)}
                      className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-expanded={userOpen}
                      aria-label="User menu"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-500 hidden sm:block transition-transform ${userOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {userOpen && (
                      <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-xs font-medium capitalize">{user?.role}</span>
                        </div>
                        <Link
                          to={getDashboardPath()}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setUserOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          to={getDashboardPath() + '/profile'}
                          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          onClick={() => setUserOpen(false)}
                        >
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        <button
                          onClick={() => { logout(); navigate('/'); setUserOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors border-t border-gray-100 dark:border-gray-800"
                        >
                          <LogOut className="w-4 h-4" />
                          {t('logout', language)}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/login" className="btn-ghost text-sm py-2 px-4 text-gray-700 dark:text-gray-200">
                    {t('login', language)}
                  </Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">
                    {t('register', language)}
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={`lg:hidden p-2 rounded-lg ${scrolled ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-white'
                  }`}
                aria-label="Toggle mobile menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-80 bg-white dark:bg-gray-950 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Droplets className="w-6 h-6 text-primary-600" />
                <span className="font-display font-bold text-lg text-gray-900 dark:text-white">BloodBridge</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`block px-4 py-3 rounded-xl font-medium text-sm transition-colors ${location.pathname === link.href
                    ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link to={getDashboardPath()} className="btn-primary w-full justify-center">
                    Dashboard
                  </Link>
                  <button onClick={() => { logout(); navigate('/'); }} className="btn-secondary w-full justify-center text-sm">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary w-full justify-center">
                    {t('login', language)}
                  </Link>
                  <Link to="/register" className="btn-primary w-full justify-center">
                    {t('register', language)}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(langOpen || userOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setLangOpen(false); setUserOpen(false); }} />
      )}
    </>
  );
}
