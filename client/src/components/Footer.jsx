import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Phone, Mail, MapPin, Heart, ExternalLink } from 'lucide-react';

const Facebook = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const Twitter = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;
const Instagram = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>;
const Youtube = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>;

const footerLinks = {
  'Quick Links': [
    { label: 'Home', href: '/' },
    { label: 'Find Blood', href: '/search' },
    { label: 'Blood Banks', href: '/blood-banks' },
    { label: 'Donate Blood', href: '/donate' },
    { label: 'About Us', href: '/about' },
  ],
  'For Donors': [
    { label: 'Register as Donor', href: '/register?role=donor' },
    { label: 'Eligibility Check', href: '/donor/eligibility' },
    { label: 'Donation Process', href: '/about#process' },
    { label: 'Donor Benefits', href: '/about#benefits' },
    { label: 'Certificates', href: '/donor/certificates' },
  ],
  'For Patients': [
    { label: 'Request Blood', href: '/register?role=patient' },
    { label: 'Emergency Request', href: '/emergency' },
    { label: 'Track Request', href: '/patient/track' },
    { label: 'Blood Banks Near Me', href: '/blood-banks' },
    { label: 'FAQs', href: '/#faq' },
  ],
  'Blood Banks': [
    { label: 'Register Blood Bank', href: '/register?role=admin' },
    { label: 'Admin Login', href: '/login?role=admin' },
    { label: 'Manage Inventory', href: '/admin' },
    { label: 'Government Registry', href: '#' },
    { label: 'API Integration', href: '#' },
  ],
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 dark:bg-black text-gray-400" role="contentinfo">
      {/* Emergency Banner */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-600 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">24/7 Emergency Blood Helpline</p>
              <p className="text-white/80 text-xs">Available round the clock for blood emergencies</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:1800-180-0099" className="text-white font-bold text-xl tracking-wide hover:text-yellow-300 transition-colors">
              1800-180-0099
            </a>
            <Link to="/emergency" className="bg-white text-primary-600 font-semibold px-4 py-2 rounded-lg text-sm hover:bg-yellow-300 transition-colors">
              Emergency Request
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-glow-red">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-white">
                Blood<span className="text-primary-400">Bridge</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              India's most advanced Blood Bank Management System. Connecting blood banks, donors, and patients to save lives every day.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <span>1800-180-0099 (Toll Free)</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-primary-500 flex-shrink-0" />
                <a href="mailto:info@bloodbridge.in" className="hover:text-primary-400 transition-colors">info@bloodbridge.in</a>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <MapPin className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                <span>National Blood Transfusion Council, New Delhi, India</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
                >
                  <Icon className="w-4 h-4 text-gray-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-white font-semibold text-sm mb-4">{heading}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-primary-400 text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Blood Group Search */}
        <div className="mt-12 p-6 bg-gray-900 rounded-2xl border border-gray-800">
          <h3 className="text-white font-semibold text-sm mb-4 text-center">Quick Blood Group Search</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {BLOOD_GROUPS.map((group) => (
              <Link
                key={group}
                to={`/search?bloodGroup=${group}`}
                className="w-14 h-14 rounded-xl bg-gray-800 hover:bg-primary-600 flex items-center justify-center text-primary-400 hover:text-white font-bold text-sm transition-all duration-300 hover:scale-110 border border-gray-700 hover:border-primary-500"
              >
                {group}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm text-center sm:text-left">
            © {currentYear} BloodBridge. Made with <Heart className="w-4 h-4 text-primary-500 inline mx-1 animate-heartbeat" /> to save lives across India.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Terms of Service</Link>
            <Link to="/accessibility" className="text-gray-500 hover:text-gray-300 text-xs transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
