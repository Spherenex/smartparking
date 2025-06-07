



// import { initializeApp } from 'firebase/app';
// import { 
//   getAuth, 
//   createUserWithEmailAndPassword,
//   signInWithEmailAndPassword,
//   sendPasswordResetEmail,
//   signOut as firebaseSignOut
// } from 'firebase/auth';
// import { 
//   getFirestore, 
//   doc, 
//   setDoc, 
//   updateDoc,
//   serverTimestamp,
//   collection,
//   addDoc,
//   Timestamp
// } from 'firebase/firestore';

// // Firebase configuration
//  const firebaseConfig = {
//   apiKey: "AIzaSyAFsaILmmuOOdvNywnNnBGMmnOkeFW0aEo",
//   authDomain: "npk-values-4a297.firebaseapp.com",
//   databaseURL: "https://npk-values-4a297-default-rtdb.firebaseio.com",
//   projectId: "npk-values-4a297",
//   storageBucket: "npk-values-4a297.firebasestorage.app",
//   messagingSenderId: "767366753983",
//   appId: "1:767366753983:web:8754c232555ee786d6a00a",
//   measurementId: "G-50PHBHYNFR"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);

// // User registration
// export const registerUser = async (userData, password) => {
//   try {
//     // Create user with email and password in Firebase Auth
//     const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
//     const user = userCredential.user;

//     // Store additional user data in Firestore
//     await setDoc(doc(db, 'users', user.uid), {
//       ...userData,
//       createdAt: serverTimestamp(),
//       updatedAt: serverTimestamp()
//     });

//     // Create initial collections for user
//     await setDoc(doc(db, 'users', user.uid, 'settings', 'preferences'), {
//       notifications: true,
//       theme: 'light',
//       updatedAt: serverTimestamp()
//     });

//     return { user };
//   } catch (error) {
//     return { error: error.message };
//   }
// };

// // User login
// export const loginUser = async (email, password) => {
//   try {
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;

//     // Update last login time
//     await updateDoc(doc(db, 'users', user.uid), {
//       lastLogin: serverTimestamp()
//     });

//     return { user };
//   } catch (error) {
//     return { error: error.message };
//   }
// };

// // Send OTP (simulated)
// export const sendOTP = async (phoneNumber, otp) => {
//   try {
//     // In a real application, this would integrate with Firebase Phone Auth
//     // or a third-party SMS provider to send the OTP
//     console.log(`Sending OTP ${otp} to ${phoneNumber}`);
    
//     // Log the OTP sending for demonstration
//     await addDoc(collection(db, 'otpLogs'), {
//       phoneNumber,
//       sentAt: serverTimestamp(),
//       // Do not store actual OTP in logs in a real app
//       // This is just for demonstration
//       success: true
//     });
    
//     return { success: true };
//   } catch (error) {
//     return { error: error.message };
//   }
// };

// // Verify OTP (simulated)
// export const verifyOTP = async (phoneNumber, otp) => {
//   try {
//     // In a real application, this would verify with Firebase Phone Auth
//     console.log(`Verifying OTP ${otp} for ${phoneNumber}`);
    
//     // For demo purposes, simulate verification success
//     // This would normally check against Firebase Auth or your backend
    
//     // Find user by phone number (in a real app, use phone auth directly)
//     // This is just a placeholder logic
    
//     return { success: true };
//   } catch (error) {
//     return { error: error.message };
//   }
// };

// // Sign out
// export const signOut = async () => {
//   try {
//     await firebaseSignOut(auth);
//     return { success: true };
//   } catch (error) {
//     return { error: error.message };
//   }
// };

// // Password reset
// export const resetPassword = async (email) => {
//   try {
//     await sendPasswordResetEmail(auth, email);
//     return { success: true };
//   } catch (error) {
//     return { error: error.message };
//   }
// };

// // Create a new parking booking
// export const createBooking = async (userId, bookingData) => {
//   try {
//     // Generate a booking ID
//     const bookingId = `PK-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    
//     // Prepare booking data
//     const booking = {
//       ...bookingData,
//       bookingId,
//       bookingTime: serverTimestamp(),
//       startTime: Timestamp.fromDate(new Date(bookingData.startTime)),
//       endTime: Timestamp.fromDate(new Date(bookingData.endTime)),
//       status: 'active',
//       createdAt: serverTimestamp()
//     };
    
//     // Add to user's bookings
//     const bookingRef = await addDoc(collection(db, 'users', userId, 'bookings'), booking);
    
//     // Create notification for booking
//     await addDoc(collection(db, 'users', userId, 'notifications'), {
//       type: 'booking',
//       message: `Booking confirmed for ${bookingData.parkingLotName}, Space #${bookingData.spaceId}`,
//       bookingId: bookingId,
//       read: false,
//       timestamp: serverTimestamp()
//     });
    
//     return { 
//       success: true, 
//       bookingId: bookingId,
//       id: bookingRef.id
//     };
//   } catch (error) {
//     console.error('Error creating booking:', error);
//     return { error: error.message };
//   }
// };

// // Update a parking space status
// export const updateParkingSpaceStatus = async (parkingLotId, spaceId, isOccupied) => {
//   try {
//     const spaceRef = doc(db, 'parkingLots', parkingLotId, 'spaces', spaceId);
//     await updateDoc(spaceRef, {
//       occupied: isOccupied,
//       lastUpdated: serverTimestamp()
//     });
    
//     return { success: true };
//   } catch (error) {
//     return { error: error.message };
//   }
// };

// // Add this to your firebase.js file
// // Firebase function to create a booking
// export const completeBooking = async (userId, bookingData) => {
//   const { selectedLot, selectedSpaceIndex, selectedDateTime, selectedDuration, amount, bookingId } = bookingData;
  
//   const selectedDurationHours = parseInt(selectedDuration.split(' ')[0]);
//   const startTime = new Date(selectedDateTime);
//   const endTime = new Date(startTime.getTime() + selectedDurationHours * 60 * 60 * 1000);
  
//   try {
//     // Create booking document in Firestore
//     const bookingRef = collection(db, 'users', userId, 'bookings');
//     await addDoc(bookingRef, {
//       bookingId: bookingId,
//       parkingLotName: selectedLot.name,
//       spaceId: selectedLot.id,
//       location: selectedLot.location,
//       startTime: Timestamp.fromDate(startTime),
//       endTime: Timestamp.fromDate(endTime),
//       duration: selectedDuration,
//       amount: amount,
//       status: 'active',
//       paymentMethod: 'card',
//       bookingTime: serverTimestamp(),
//       vehicleNumber: '', // This would come from user profile
//     });
    
//     // Add notification
//     const notificationRef = collection(db, 'users', userId, 'notifications');
//     await addDoc(notificationRef, {
//       type: 'booking',
//       message: `Your parking booking at ${selectedLot.name}, Space #${selectedLot.id} is confirmed.`,
//       read: false,
//       timestamp: serverTimestamp()
//     });
    
//     // Update parking space status in real-time
//     // In a real app, you'd have a collection for parking spaces
//     // For demo, we'll assume the data structure matches local storage
    
//     return { success: true };
//   } catch (error) {
//     console.error('Error completing booking in Firebase:', error);
//     return { error: error.message };
//   }
// };


// firebase.js - Updated with Realtime Database support
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  setDoc, 
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import {
  getDatabase,
  ref,
  set,
  onValue,
  update,
  get,
  push,
  child
} from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAFsaILmmuOOdvNywnNnBGMmnOkeFW0aEo",
  authDomain: "npk-values-4a297.firebaseapp.com",
  databaseURL: "https://npk-values-4a297-default-rtdb.firebaseio.com",
  projectId: "npk-values-4a297",
  storageBucket: "npk-values-4a297.firebasestorage.app",
  messagingSenderId: "767366753983",
  appId: "1:767366753983:web:8754c232555ee786d6a00a",
  measurementId: "G-50PHBHYNFR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app); // Adding Realtime Database export

// User registration
export const registerUser = async (userData, password) => {
  try {
    // Create user with email and password in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, password);
    const user = userCredential.user;

    // Store additional user data in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Create initial collections for user
    await setDoc(doc(db, 'users', user.uid, 'settings', 'preferences'), {
      notifications: true,
      theme: 'light',
      updatedAt: serverTimestamp()
    });

    return { user };
  } catch (error) {
    return { error: error.message };
  }
};

// User login
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update last login time
    await updateDoc(doc(db, 'users', user.uid), {
      lastLogin: serverTimestamp()
    });

    return { user };
  } catch (error) {
    return { error: error.message };
  }
};

// Send OTP (simulated)
export const sendOTP = async (phoneNumber, otp) => {
  try {
    // In a real application, this would integrate with Firebase Phone Auth
    // or a third-party SMS provider to send the OTP
    console.log(`Sending OTP ${otp} to ${phoneNumber}`);
    
    // Log the OTP sending for demonstration
    await addDoc(collection(db, 'otpLogs'), {
      phoneNumber,
      sentAt: serverTimestamp(),
      // Do not store actual OTP in logs in a real app
      // This is just for demonstration
      success: true
    });
    
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

// Verify OTP (simulated)
export const verifyOTP = async (phoneNumber, otp) => {
  try {
    // In a real application, this would verify with Firebase Phone Auth
    console.log(`Verifying OTP ${otp} for ${phoneNumber}`);
    
    // For demo purposes, simulate verification success
    // This would normally check against Firebase Auth or your backend
    
    // Find user by phone number (in a real app, use phone auth directly)
    // This is just a placeholder logic
    
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

// Password reset
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

// Create a new parking booking
export const createBooking = async (userId, bookingData) => {
  try {
    // Generate a booking ID
    const bookingId = `PK-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    
    // Prepare booking data
    const booking = {
      ...bookingData,
      bookingId,
      bookingTime: serverTimestamp(),
      startTime: Timestamp.fromDate(new Date(bookingData.startTime)),
      endTime: Timestamp.fromDate(new Date(bookingData.endTime)),
      status: 'active',
      createdAt: serverTimestamp()
    };
    
    // Add to user's bookings
    const bookingRef = await addDoc(collection(db, 'users', userId, 'bookings'), booking);
    
    // Create notification for booking
    await addDoc(collection(db, 'users', userId, 'notifications'), {
      type: 'booking',
      message: `Booking confirmed for ${bookingData.parkingLotName}, Space #${bookingData.spaceId}`,
      bookingId: bookingId,
      read: false,
      timestamp: serverTimestamp()
    });
    
    return { 
      success: true, 
      bookingId: bookingId,
      id: bookingRef.id
    };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { error: error.message };
  }
};

// Update a parking space status
export const updateParkingSpaceStatus = async (parkingLotId, spaceId, isOccupied) => {
  try {
    const spaceRef = doc(db, 'parkingLots', parkingLotId, 'spaces', spaceId);
    await updateDoc(spaceRef, {
      occupied: isOccupied,
      lastUpdated: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};

// Enhanced completeBooking function with Realtime Database support
export const completeBooking = async (userId, bookingData) => {
  const { selectedLot, selectedSpaceIndex, selectedDateTime, selectedDuration, amount, bookingId } = bookingData;
  
  // Parse duration to get hours
  let selectedDurationHours = 1;
  if (selectedDuration.includes('Hour')) {
    selectedDurationHours = parseInt(selectedDuration.split(' ')[0]);
  } else if (selectedDuration === 'Full Day') {
    selectedDurationHours = 24;
  }
  
  const startTime = new Date(selectedDateTime);
  const endTime = new Date(startTime.getTime() + selectedDurationHours * 60 * 60 * 1000);
  
  try {
    // Generate a unique booking ID if not provided
    const newBookingId = bookingId || `PK-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    
    // 1. Create booking in Firestore
    const bookingRef = collection(db, 'users', userId, 'bookings');
    const firestoreBooking = await addDoc(bookingRef, {
      bookingId: newBookingId,
      parkingLotId: selectedLot.id || 'lot1',
      parkingLotName: selectedLot.name || 'Parking Lot',
      spaceId: selectedSpaceIndex + 1, // Convert to 1-based index for display
      location: selectedLot.location || 'Main Location',
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
      duration: selectedDuration,
      amount: amount,
      status: 'active',
      paymentMethod: bookingData.paymentMethod || 'card',
      bookingTime: serverTimestamp(),
      vehicleNumber: bookingData.vehicleNumber || '', 
    });
    
    // 2. Add notification to Firestore
    const notificationRef = collection(db, 'users', userId, 'notifications');
    await addDoc(notificationRef, {
      type: 'booking',
      message: `Your parking booking at ${selectedLot.name || 'Parking Lot'}, Space #${selectedSpaceIndex + 1} is confirmed.`,
      read: false,
      timestamp: serverTimestamp()
    });
    
    // 3. Add booking to global bookings collection (for admin dashboard)
    await addDoc(collection(db, 'bookings'), {
      bookingId: newBookingId,
      userId: userId,
      parkingLotId: selectedLot.id || 'lot1',
      parkingLotName: selectedLot.name || 'Parking Lot',
      spaceId: selectedSpaceIndex + 1,
      startTime: Timestamp.fromDate(startTime),
      endTime: Timestamp.fromDate(endTime),
      duration: selectedDuration,
      amount: amount,
      status: 'active',
      bookingTime: serverTimestamp(),
      userName: 'User'  // Can be updated if user profile info is available
    });
    
    // 4. Write to Realtime Database for real-time updates
    // Ensure parkingLot exists
    const lotId = selectedLot.id || 'lot1';
    
    // Update parking space status
    await update(ref(rtdb, `parkingSpaces/${lotId}/spaces/${selectedSpaceIndex}`), {
      id: selectedSpaceIndex + 1,
      occupied: true,
      reserved: true,
      bookingId: newBookingId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });
    
    // Update parking lot statistics
    const lotRef = ref(rtdb, `parkingLots/${lotId}`);
    const snapshot = await get(lotRef);
    
    if (snapshot.exists()) {
      // Update existing stats
      const currentLot = snapshot.val();
      await update(lotRef, {
        occupiedSpaces: (currentLot.occupiedSpaces || 0) + 1,
        availableSpaces: (currentLot.totalSpaces || 10) - ((currentLot.occupiedSpaces || 0) + 1)
      });
    } else {
      // Create new entry with default values
      await set(lotRef, {
        id: lotId,
        name: selectedLot.name || 'Parking Lot',
        location: selectedLot.location || 'Main Location',
        totalSpaces: 10,
        occupiedSpaces: 1,
        availableSpaces: 9,
        reservedSpaces: 0
      });
    }
    
    // Update dashboard statistics
    await updateDashboardStats(amount);
    
    return { 
      success: true, 
      bookingId: newBookingId,
      id: firestoreBooking.id
    };
  } catch (error) {
    console.error('Error completing booking:', error);
    return { error: error.message };
  }
};

// Update dashboard statistics in Realtime Database
const updateDashboardStats = async (amount) => {
  try {
    const statsRef = ref(rtdb, 'dashboardStats');
    const snapshot = await get(statsRef);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    if (snapshot.exists()) {
      const stats = snapshot.val();
      
      // Update with new booking info
      await update(statsRef, {
        totalBookings: (stats.totalBookings || 0) + 1,
        dailyRevenue: {
          ...stats.dailyRevenue,
          [today]: ((stats.dailyRevenue && stats.dailyRevenue[today]) || 0) + Number(amount)
        },
        lastUpdated: new Date().toISOString()
      });
    } else {
      // Initialize stats
      await set(statsRef, {
        totalBookings: 1,
        dailyRevenue: {
          [today]: Number(amount)
        },
        lastUpdated: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating dashboard stats:', error);
  }
};

// **** ADMIN DASHBOARD FUNCTIONS ****

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    // Get data from Realtime Database
    const statsRef = ref(rtdb, 'dashboardStats');
    const parkingLotsRef = ref(rtdb, 'parkingLots');
    
    const statsSnapshot = await get(statsRef);
    const lotsSnapshot = await get(parkingLotsRef);
    
    let totalSpots = 0;
    let occupiedSpots = 0;
    let reservedSpots = 0;
    
    // Calculate totalSpots and occupiedSpots from parking lots
    if (lotsSnapshot.exists()) {
      const lots = lotsSnapshot.val();
      Object.values(lots).forEach(lot => {
        totalSpots += (lot.totalSpaces || 0);
        occupiedSpots += (lot.occupiedSpaces || 0);
        reservedSpots += (lot.reservedSpaces || 0);
      });
    } else {
      // Default values
      totalSpots = 10; // Default 10 spots per lot
    }
    
    // Calculate daily revenue
    let dailyRevenue = 0;
    if (statsSnapshot.exists()) {
      const stats = statsSnapshot.val();
      const today = new Date().toISOString().split('T')[0];
      
      if (stats.dailyRevenue && stats.dailyRevenue[today]) {
        dailyRevenue = stats.dailyRevenue[today];
      }
    }
    
    // Count active users (simple approximation)
    let activeUsers = 0;
    
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      activeUsers = usersSnapshot.size;
    } catch (err) {
      console.log('Error counting users:', err);
      activeUsers = 0;
    }
    
    // Calculate vacant spots
    const vacantSpots = totalSpots - occupiedSpots;
    
    return {
      totalSpots,
      activeUsers,
      dailyRevenue,
      vacantSpots,
      occupiedSpots,
      reservedSpots
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    // Return default values if there's an error
    return {
      totalSpots: 10,
      activeUsers: 0,
      dailyRevenue: 0,
      vacantSpots: 10,
      occupiedSpots: 0,
      reservedSpots: 0
    };
  }
};

// Get recent activities
export const getRecentActivities = async (limit = 5) => {
  try {
    // Query bookings from Firestore, ordered by booking time
    const bookingsQuery = query(
      collection(db, 'bookings'),
      orderBy('bookingTime', 'desc'),
      limit(limit)
    );
    
    const bookingsSnapshot = await getDocs(bookingsQuery);
    const activities = [];
    
    bookingsSnapshot.forEach(doc => {
      const booking = doc.data();
      const user = booking.userName || 'User';
      const bookingTime = booking.bookingTime?.toDate() || new Date();
      
      activities.push({
        id: doc.id,
        user: user,
        action: `booked spot ${booking.spaceId} at ${booking.parkingLotName}`,
        time: formatTimeAgo(bookingTime)
      });
    });
    
    return activities;
  } catch (error) {
    console.error('Error getting recent activities:', error);
    return [];
  }
};

// Get parking lot status
export const getParkingLotStatus = async () => {
  try {
    const parkingLotsRef = ref(rtdb, 'parkingLots');
    const snapshot = await get(parkingLotsRef);
    
    let available = 0;
    let occupied = 0;
    let reserved = 0;
    
    if (snapshot.exists()) {
      const lots = snapshot.val();
      
      Object.values(lots).forEach(lot => {
        available += (lot.availableSpaces || 0);
        occupied += (lot.occupiedSpaces || 0);
        reserved += (lot.reservedSpaces || 0);
      });
    } else {
      // Default if no data exists
      available = 10;
    }
    
    return {
      available,
      occupied,
      reserved
    };
  } catch (error) {
    console.error('Error getting parking lot status:', error);
    return {
      available: 10,
      occupied: 0,
      reserved: 0
    };
  }
};

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
}

// Real-time listeners for dashboard
export const listenToDashboardStats = (callback) => {
  const statsRef = ref(rtdb, 'dashboardStats');
  return onValue(statsRef, async () => {
    const stats = await getDashboardStats();
    callback(stats);
  });
};

export const listenToRecentActivities = (callback, limitCount = 5) => {
  // Use Firestore onSnapshot
  const activitiesQuery = query(
    collection(db, 'bookings'), 
    orderBy('bookingTime', 'desc'), 
    limit(limitCount)
  );
  
  return onSnapshot(activitiesQuery, (snapshot) => {
    const activities = [];
    
    snapshot.forEach(doc => {
      const booking = doc.data();
      const user = booking.userName || 'User';
      const bookingTime = booking.bookingTime?.toDate() || new Date();
      
      activities.push({
        id: doc.id,
        user: user,
        action: `booked spot ${booking.spaceId} at ${booking.parkingLotName}`,
        time: formatTimeAgo(bookingTime)
      });
    });
    
    callback(activities);
  });
};

export const listenToParkingStatus = (callback) => {
  const lotsRef = ref(rtdb, 'parkingLots');
  return onValue(lotsRef, async () => {
    const status = await getParkingLotStatus();
    callback(status);
  });
};

// Setup initial data in Realtime Database
export const setupInitialData = async () => {
  try {
    // Check if parkingLots exists
    const lotsRef = ref(rtdb, 'parkingLots');
    const lotsSnapshot = await get(lotsRef);
    
    if (!lotsSnapshot.exists()) {
      // Create default parking lot
      await set(ref(rtdb, 'parkingLots/lot1'), {
        id: 'lot1',
        name: 'Main Parking',
        location: 'City Center',
        totalSpaces: 10,
        occupiedSpaces: 0,
        availableSpaces: 10,
        reservedSpaces: 0
      });
      
      // Create default spaces for this lot
      const spaces = {};
      
      for (let i = 0; i < 10; i++) {
        spaces[i] = {
          id: i + 1,
          occupied: false,
          reserved: false
        };
      }
      
      await set(ref(rtdb, `parkingSpaces/lot1/spaces`), spaces);
    }
    
    // Check if dashboardStats exists
    const statsRef = ref(rtdb, 'dashboardStats');
    const statsSnapshot = await get(statsRef);
    
    if (!statsSnapshot.exists()) {
      // Initialize dashboard stats
      await set(statsRef, {
        totalBookings: 0,
        dailyRevenue: {},
        lastUpdated: new Date().toISOString()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error setting up initial data:', error);
    return false;
  }
};