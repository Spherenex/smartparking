// Configuration settings for the admin dashboard

// Firebase configuration - Hardcoded values with no environment variable dependency
export const firebaseConfig = {
  apiKey: "AIzaSyAFsaILmmuOOdvNywnNnBGMmnOkeFW0aEo",
  authDomain: "npk-values-4a297.firebaseapp.com",
  databaseURL: "https://npk-values-4a297-default-rtdb.firebaseio.com",
  projectId: "npk-values-4a297",
  storageBucket: "npk-values-4a297.firebasestorage.app",
  messagingSenderId: "767366753983",
  appId: "1:767366753983:web:8754c232555ee786d6a00a",
  measurementId: "G-50PHBHYNFR"
};

// Admin settings
export const adminSettings = {
  defaultAdminEmail: "admin@parksmart.com",
  defaultAdminPassword: "admin123", // Change in production!
  sessionTimeout: 60 * 60 * 1000, // 1 hour in milliseconds
  inactivityLogout: 30 * 60 * 1000, // 30 minutes in milliseconds
};

// Application settings
export const appSettings = {
  appName: "Park Smart Admin",
  appVersion: "1.0.0",
  copyrightYear: new Date().getFullYear(),
  supportEmail: "support@parksmart.com",
  maxHistoryItems: 50,
  autoRefreshInterval: 60 * 1000, // 1 minute in milliseconds
  vehicleScannerEnabled: true,
};

// User status settings
export const userStatusSettings = {
  activeThresholdDays: 30, // Consider users active if login within last 30 days
};

// Booking status settings
export const bookingStatusSettings = {
  statuses: {
    active: { label: "Active", color: "#2196f3" },
    completed: { label: "Completed", color: "#4caf50" },
    cancelled: { label: "Cancelled", color: "#f44336" },
  },
};