// Utility functions for the admin dashboard

/**
 * Format a timestamp from Firestore into a human-readable date/time
 * @param {Object} timestamp - Firestore timestamp object
 * @param {Object} options - Formatting options
 * @returns {String} Formatted date string
 */
export const formatTimestamp = (timestamp, options = {}) => {
  if (!timestamp) return 'N/A';
  
  try {
    // Convert to JavaScript Date
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    // Default options
    const defaultOptions = {
      dateStyle: 'medium',
      timeStyle: 'short'
    };
    
    // Merge with provided options
    const formattingOptions = { ...defaultOptions, ...options };
    
    return new Intl.DateTimeFormat('en-IN', formattingOptions).format(date);
  } catch (error) {
    console.error('Error formatting timestamp:', error);
    return 'Invalid date';
  }
};

/**
 * Format currency values (₹)
 * @param {Number} amount - Amount to format
 * @returns {String} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Get user status based on last login
 * @param {Object} lastLogin - Firestore timestamp for last login
 * @param {Number} daysThreshold - Days to consider a user active
 * @returns {Object} Status object with label and className
 */
export const getUserStatus = (lastLogin, daysThreshold = 30) => {
  if (!lastLogin) {
    return { label: 'Inactive', className: 'inactive' };
  }
  
  const lastLoginDate = lastLogin.toDate ? lastLogin.toDate() : new Date(lastLogin);
  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);
  
  if (lastLoginDate > thresholdDate) {
    return { label: 'Active', className: 'active' };
  } else {
    return { label: 'Inactive', className: 'inactive' };
  }
};

/**
 * Format booking status with proper capitalization and class name
 * @param {String} status - Booking status string
 * @returns {Object} Formatted status with label and className
 */
export const formatBookingStatus = (status) => {
  if (!status) return { label: 'Unknown', className: '' };
  
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return { label, className: status.toLowerCase() };
};

/**
 * Generate a random vehicle number for testing
 * @returns {String} Random vehicle number in format KA-01-AB-1234
 */
export const generateRandomVehicleNumber = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  let vehicleNumber = '';
  
  // Format: KA-01-AB-1234
  vehicleNumber += chars.charAt(Math.floor(Math.random() * chars.length));
  vehicleNumber += chars.charAt(Math.floor(Math.random() * chars.length));
  vehicleNumber += '-';
  vehicleNumber += numbers.charAt(Math.floor(Math.random() * numbers.length));
  vehicleNumber += numbers.charAt(Math.floor(Math.random() * numbers.length));
  vehicleNumber += '-';
  vehicleNumber += chars.charAt(Math.floor(Math.random() * chars.length));
  vehicleNumber += chars.charAt(Math.floor(Math.random() * chars.length));
  vehicleNumber += '-';
  vehicleNumber += numbers.charAt(Math.floor(Math.random() * numbers.length));
  vehicleNumber += numbers.charAt(Math.floor(Math.random() * numbers.length));
  vehicleNumber += numbers.charAt(Math.floor(Math.random() * numbers.length));
  vehicleNumber += numbers.charAt(Math.floor(Math.random() * numbers.length));
  
  return vehicleNumber;
};

/**
 * Filter and sort bookings by status
 * @param {Array} bookings - List of booking objects
 * @param {String} filterType - Filter type ('recent', 'active', 'completed', etc.)
 * @param {Number} limit - Maximum number of bookings to return
 * @returns {Array} Filtered and sorted booking list
 */
export const filterBookings = (bookings, filterType = 'recent', limit = 5) => {
  if (!bookings || !Array.isArray(bookings)) return [];
  
  let filtered = [...bookings];
  
  // Apply filters
  switch (filterType) {
    case 'recent':
      // No filter, just sort by date
      break;
    case 'active':
      filtered = filtered.filter(booking => booking.status === 'active');
      break;
    case 'completed':
      filtered = filtered.filter(booking => booking.status === 'completed');
      break;
    case 'cancelled':
      filtered = filtered.filter(booking => booking.status === 'cancelled');
      break;
    default:
      // No filter for unknown types
  }
  
  // Sort by booking time (most recent first)
  filtered.sort((a, b) => {
    const dateA = a.bookingTime?.toDate ? a.bookingTime.toDate() : new Date(a.bookingTime);
    const dateB = b.bookingTime?.toDate ? b.bookingTime.toDate() : new Date(b.bookingTime);
    return dateB - dateA;
  });
  
  // Apply limit if provided
  if (limit && limit > 0) {
    filtered = filtered.slice(0, limit);
  }
  
  return filtered;
};