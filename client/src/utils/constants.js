// Blood Bank Management System - Constants

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const BLOOD_COMPATIBILITY = {
  'A+':  { canDonateTo: ['A+', 'AB+'], canReceiveFrom: ['A+', 'A-', 'O+', 'O-'] },
  'A-':  { canDonateTo: ['A+', 'A-', 'AB+', 'AB-'], canReceiveFrom: ['A-', 'O-'] },
  'B+':  { canDonateTo: ['B+', 'AB+'], canReceiveFrom: ['B+', 'B-', 'O+', 'O-'] },
  'B-':  { canDonateTo: ['B+', 'B-', 'AB+', 'AB-'], canReceiveFrom: ['B-', 'O-'] },
  'AB+': { canDonateTo: ['AB+'], canReceiveFrom: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  'AB-': { canDonateTo: ['AB+', 'AB-'], canReceiveFrom: ['A-', 'B-', 'AB-', 'O-'] },
  'O+':  { canDonateTo: ['A+', 'B+', 'AB+', 'O+'], canReceiveFrom: ['O+', 'O-'] },
  'O-':  { canDonateTo: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], canReceiveFrom: ['O-'] },
};

export const EMERGENCY_LEVELS = ['Critical', 'High', 'Medium', 'Low'];

export const USER_ROLES = {
  SUPER_ADMIN: 'superadmin',
  ADMIN: 'admin',
  DONOR: 'donor',
  PATIENT: 'patient',
};

export const REQUEST_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
};

export const DONATION_INTERVAL_DAYS = 90;
export const MIN_DONATION_AGE = 18;
export const MAX_DONATION_AGE = 65;
export const MIN_DONATION_WEIGHT = 50;

export const REWARD_TIERS = [
  { name: 'Bronze', minDonations: 1, color: '#cd7f32', icon: '🥉' },
  { name: 'Silver', minDonations: 5, color: '#adb5bd', icon: '🥈' },
  { name: 'Gold', minDonations: 10, color: '#f4c430', icon: '🥇' },
  { name: 'Platinum', minDonations: 20, color: '#e5e4e2', icon: '💎' },
];

export const STATS = {
  totalBloodBanks: 2847,
  totalDonors: 156432,
  bloodUnitsAvailable: 89234,
  livesSaved: 312789,
};

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Puducherry', 'Chandigarh',
];

export const BLOOD_GROUP_COLORS = {
  'A+': '#ef4444',
  'A-': '#f97316',
  'B+': '#eab308',
  'B-': '#22c55e',
  'AB+': '#3b82f6',
  'AB-': '#8b5cf6',
  'O+': '#ec4899',
  'O-': '#14b8a6',
};

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
