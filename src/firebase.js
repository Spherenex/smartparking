// // firebase.js - Firebase configuration and utility functions
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
//   getDoc,
//   setDoc, 
//   updateDoc,
//   serverTimestamp,
//   collection,
//   addDoc,
//   getDocs,
//   query,
//   where,
//   orderBy,
//   limit,
//   Timestamp,
//   onSnapshot
// } from 'firebase/firestore';

// // Firebase configuration
// const firebaseConfig = {
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

// // Admin authentication
// export const adminLogin = async (email, password) => {
//   try {
//     // Authenticate with Firebase
//     const userCredential = await signInWithEmailAndPassword(auth, email, password);
//     const user = userCredential.user;

//     // Check if user has admin role in Firestore
//     const userDoc = await getDoc(doc(db, 'users', user.uid));
    
//     if (userDoc.exists() && userDoc.data().role === 'admin') {
//       // Update last login time
//       await updateDoc(doc(db, 'users', user.uid), {
//         lastLogin: serverTimestamp()
//       });
      
//       return { 
//         success: true, 
//         user: {
//           uid: user.uid,
//           email: user.email,
//           ...userDoc.data()
//         } 
//       };
//     } else {
//       // User is not an admin, sign out
//       await firebaseSignOut(auth);
//       return { 
//         success: false, 
//         error: 'Access denied. You do not have administrator privileges.' 
//       };
//     }
//   } catch (error) {
//     return { 
//       success: false, 
//       error: error.message 
//     };
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

// // Get dashboard statistics
// export const getDashboardStats = async () => {
//   try {
//     // Get total parking spots
//     const parkingLotsSnapshot = await getDocs(collection(db, 'parkingLots'));
//     let totalSpots = 0;
//     parkingLotsSnapshot.forEach(doc => {
//       // Assuming each parking lot document has a totalSpaces field
//       const lotData = doc.data();
//       if (lotData.totalSpaces) {
//         totalSpots += lotData.totalSpaces;
//       }
//     });
    
//     // Get active users count
//     const usersSnapshot = await getDocs(collection(db, 'users'));
//     const activeUsers = usersSnapshot.size;
    
//     // Get vacant spots (total - occupied)
//     // This would need a more complex query in a real application
//     // For simplicity, we'll use a placeholder calculation
//     const vacantSpots = Math.floor(totalSpots * 0.3); // Assume 30% vacant for demo
    
//     // Calculate daily revenue
//     // In a real app, you would sum transactions for the current day
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
    
//     const bookingsQuery = query(
//       collection(db, 'bookings'),
//       where('bookingTime', '>=', today)
//     );
    
//     const bookingsSnapshot = await getDocs(bookingsQuery);
//     let dailyRevenue = 0;
//     bookingsSnapshot.forEach(doc => {
//       const bookingData = doc.data();
//       if (bookingData.amount) {
//         dailyRevenue += parseFloat(bookingData.amount);
//       }
//     });
    
//     return {
//       totalSpots,
//       activeUsers,
//       dailyRevenue: dailyRevenue.toFixed(2),
//       vacantSpots
//     };
//   } catch (error) {
//     console.error('Error getting dashboard stats:', error);
//     // Return default values if there's an error
//     return {
//       totalSpots: 0,
//       activeUsers: 0,
//       dailyRevenue: 0,
//       vacantSpots: 0
//     };
//   }
// };

// // Get recent activities
// export const getRecentActivities = async (limit = 10) => {
//   try {
//     // Create a combined query for recent bookings
//     const bookingsQuery = query(
//       collection(db, 'bookings'),
//       orderBy('bookingTime', 'desc'),
//       limit(limit)
//     );
    
//     const bookingsSnapshot = await getDocs(bookingsQuery);
//     const activities = [];
    
//     bookingsSnapshot.forEach(doc => {
//       const booking = doc.data();
//       const user = booking.userName || 'User'; // Fallback if userName is not available
      
//       activities.push({
//         id: doc.id,
//         user: user,
//         action: `booked spot ${booking.spaceId} at ${booking.parkingLotName}`,
//         time: formatTimeAgo(booking.bookingTime.toDate())
//       });
//     });
    
//     return activities;
//   } catch (error) {
//     console.error('Error getting recent activities:', error);
//     return [];
//   }
// };

// // Get parking lot status
// export const getParkingLotStatus = async () => {
//   try {
//     const parkingLotsSnapshot = await getDocs(collection(db, 'parkingLots'));
//     let available = 0;
//     let occupied = 0;
//     let reserved = 0;
    
//     for (const lotDoc of parkingLotsSnapshot.docs) {
//       const lotId = lotDoc.id;
//       const spacesSnapshot = await getDocs(collection(db, 'parkingLots', lotId, 'spaces'));
      
//       spacesSnapshot.forEach(spaceDoc => {
//         const space = spaceDoc.data();
//         if (space.status === 'available') {
//           available++;
//         } else if (space.status === 'occupied') {
//           occupied++;
//         } else if (space.status === 'reserved') {
//           reserved++;
//         }
//       });
//     }
    
//     return {
//       available,
//       occupied,
//       reserved
//     };
//   } catch (error) {
//     console.error('Error getting parking lot status:', error);
//     return {
//       available: 0,
//       occupied: 0,
//       reserved: 0
//     };
//   }
// };

// // Helper function to format time ago
// function formatTimeAgo(date) {
//   const now = new Date();
//   const diffInSeconds = Math.floor((now - date) / 1000);
  
//   if (diffInSeconds < 60) {
//     return `${diffInSeconds} seconds ago`;
//   }
  
//   const diffInMinutes = Math.floor(diffInSeconds / 60);
//   if (diffInMinutes < 60) {
//     return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
//   }
  
//   const diffInHours = Math.floor(diffInMinutes / 60);
//   if (diffInHours < 24) {
//     return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
//   }
  
//   const diffInDays = Math.floor(diffInHours / 24);
//   return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
// }

// // Setup admin user if it doesn't exist (for demo purposes)
// export const setupAdminUser = async () => {
//   const DEFAULT_ADMIN_EMAIL = 'admin@gmail.com';
//   const DEFAULT_ADMIN_PASSWORD = 'admin123';
  
//   try {
//     // Try to find if admin user already exists
//     try {
//       const userCredential = await signInWithEmailAndPassword(auth, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD);
//       const user = userCredential.user;
      
//       // Check if user document exists
//       const userDoc = await getDoc(doc(db, 'users', user.uid));
//       if (!userDoc.exists() || userDoc.data().role !== 'admin') {
//         // Create or update admin document
//         await setDoc(doc(db, 'users', user.uid), {
//           email: DEFAULT_ADMIN_EMAIL,
//           role: 'admin',
//           name: 'Admin User',
//           createdAt: serverTimestamp(),
//           updatedAt: serverTimestamp()
//         });
//       }
      
//       // Sign out after setup
//       await firebaseSignOut(auth);
//       return { success: true };
//     } catch (signInError) {
//       // If sign in fails, create new admin user
//       if (signInError.code === 'auth/user-not-found') {
//         try {
//           const userCredential = await createUserWithEmailAndPassword(auth, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD);
//           const user = userCredential.user;
          
//           await setDoc(doc(db, 'users', user.uid), {
//             email: DEFAULT_ADMIN_EMAIL,
//             role: 'admin',
//             name: 'Admin User',
//             createdAt: serverTimestamp(),
//             updatedAt: serverTimestamp()
//           });
          
//           // Sign out after setup
//           await firebaseSignOut(auth);
//           return { success: true };
//         } catch (createError) {
//           console.error('Error creating admin user:', createError);
//           return { success: false, error: createError.message };
//         }
//       } else {
//         console.error('Error during admin setup:', signInError);
//         return { success: false, error: signInError.message };
//       }
//     }
//   } catch (error) {
//     console.error('Error in admin setup process:', error);
//     return { success: false, error: error.message };
//   }
// };

// // Listen for real-time updates to dashboard stats
// export const listenToDashboardStats = (callback) => {
//   // Listen to bookings collection for revenue updates
//   const bookingsListener = onSnapshot(collection(db, 'bookings'), (snapshot) => {
//     getDashboardStats().then(stats => {
//       callback(stats);
//     });
//   });
  
//   // Listen to users collection for user count updates
//   const usersListener = onSnapshot(collection(db, 'users'), (snapshot) => {
//     getDashboardStats().then(stats => {
//       callback(stats);
//     });
//   });
  
//   // Listen to parking lots for space updates
//   const parkingLotsListener = onSnapshot(collection(db, 'parkingLots'), (snapshot) => {
//     getDashboardStats().then(stats => {
//       callback(stats);
//     });
//   });
  
//   // Return a function to unsubscribe from all listeners
//   return () => {
//     bookingsListener();
//     usersListener();
//     parkingLotsListener();
//   };
// };

// // Listen for real-time updates to activities
// export const listenToRecentActivities = (callback, limitCount = 10) => {
//   const activitiesListener = onSnapshot(
//     query(collection(db, 'bookings'), orderBy('bookingTime', 'desc'), limit(limitCount)),
//     (snapshot) => {
//       const activities = [];
      
//       snapshot.forEach(doc => {
//         const booking = doc.data();
//         const user = booking.userName || 'User';
        
//         activities.push({
//           id: doc.id,
//           user: user,
//           action: `booked spot ${booking.spaceId} at ${booking.parkingLotName}`,
//           time: formatTimeAgo(booking.bookingTime.toDate())
//         });
//       });
      
//       callback(activities);
//     }
//   );
  
//   return activitiesListener;
// };

// // Listen for real-time updates to parking status
// export const listenToParkingStatus = (callback) => {
//   // This is a simplified version for demo purposes
//   // In a real app, you would track individual space status changes
  
//   const statusListener = onSnapshot(collection(db, 'parkingLots'), () => {
//     getParkingLotStatus().then(status => {
//       callback(status);
//     });
//   });
  
//   return statusListener;
// };



// firebase.js - Enhanced with Realtime Database integration
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
  onSnapshot,
  getDocs,
  Timestamp
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
export const rtdb = getDatabase(app); // Realtime Database

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

// Admin authentication
export const adminLogin = async (email, password) => {
  try {
    // Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Check if user has admin role in Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (userDoc.exists() && userDoc.data().role === 'admin') {
      // Update last login time
      await updateDoc(doc(db, 'users', user.uid), {
        lastLogin: serverTimestamp()
      });
      
      return { 
        success: true, 
        user: {
          uid: user.uid,
          email: user.email,
          ...userDoc.data()
        } 
      };
    } else {
      // User is not an admin, sign out
      await firebaseSignOut(auth);
      return { 
        success: false, 
        error: 'Access denied. You do not have administrator privileges.' 
      };
    }
  } catch (error) {
    return { 
      success: false, 
      error: error.message 
    };
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

// **** BOOKING FUNCTIONS - REALTIME DATABASE ****

// Create a booking in both Firestore and Realtime Database
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
      parkingLotId: selectedLot.id,
      parkingLotName: selectedLot.name,
      spaceId: selectedSpaceIndex + 1, // Convert to 1-based index for display
      location: selectedLot.location,
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
      message: `Your parking booking at ${selectedLot.name}, Space #${selectedSpaceIndex + 1} is confirmed.`,
      read: false,
      timestamp: serverTimestamp()
    });
    
    // 3. Add booking to global bookings collection (for admin dashboard)
    await addDoc(collection(db, 'bookings'), {
      bookingId: newBookingId,
      userId: userId,
      parkingLotId: selectedLot.id,
      parkingLotName: selectedLot.name,
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
    // Store parking space status
    await update(ref(rtdb, `parkingSpaces/${selectedLot.id}/spaces/${selectedSpaceIndex}`), {
      id: selectedSpaceIndex + 1,
      occupied: true,
      reserved: true,
      bookingId: newBookingId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });
    
    // Update parking lot statistics
    const lotRef = ref(rtdb, `parkingLots/${selectedLot.id}`);
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
        id: selectedLot.id,
        name: selectedLot.name,
        location: selectedLot.location,
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

// **** ADMIN DASHBOARD FUNCTIONS - REALTIME DATABASE ****

// Get dashboard statistics
export const getDashboardStats = async () => {
  try {
    // Get data from Realtime Database
    const statsRef = ref(rtdb, 'dashboardStats');
    const parkingLotsRef = ref(rtdb, 'parkingLots');
    const usersRef = ref(rtdb, 'users');
    
    const statsSnapshot = await get(statsRef);
    const lotsSnapshot = await get(parkingLotsRef);
    const usersSnapshot = await get(usersRef);
    
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
    
    // Count active users
    let activeUsers = 0;
    if (usersSnapshot.exists()) {
      activeUsers = Object.keys(usersSnapshot.val()).length;
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

// Listen for real-time updates to dashboard stats
export const listenToDashboardStats = (callback) => {
  // Listen to dashboard stats in Realtime Database
  const statsRef = ref(rtdb, 'dashboardStats');
  const unsubscribe = onValue(statsRef, async () => {
    // Get updated stats and call the callback
    const stats = await getDashboardStats();
    callback(stats);
  });
  
  return unsubscribe;
};

// Listen for real-time updates to activities
export const listenToRecentActivities = (callback, limitCount = 5) => {
  // Use Firestore onSnapshot for activities
  const activitiesListener = onSnapshot(
    query(collection(db, 'bookings'), orderBy('bookingTime', 'desc'), limit(limitCount)),
    (snapshot) => {
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
    }
  );
  
  return activitiesListener;
};

// Listen for real-time updates to parking status
export const listenToParkingStatus = (callback) => {
  // Listen to parking lots in Realtime Database
  const lotsRef = ref(rtdb, 'parkingLots');
  const unsubscribe = onValue(lotsRef, async () => {
    // Get updated parking status and call the callback
    const status = await getParkingLotStatus();
    callback(status);
  });
  
  return unsubscribe;
};

// Setup initial data in Realtime Database if it doesn't exist
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
      const spacesRef = ref(rtdb, `parkingSpaces/lot1/spaces`);
      const spaces = {};
      
      for (let i = 0; i < 10; i++) {
        spaces[i] = {
          id: i + 1,
          occupied: false,
          reserved: false
        };
      }
      
      await set(spacesRef, spaces);
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

// Setup admin user in Firebase if it doesn't exist
export const setupAdminUser = async () => {
  const DEFAULT_ADMIN_EMAIL = 'admin@gmail.com';
  const DEFAULT_ADMIN_PASSWORD = 'admin123';
  
  try {
    // Try to sign in with default admin credentials
    try {
      const userCredential = await signInWithEmailAndPassword(auth, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD);
      const user = userCredential.user;
      
      // Check if user document exists with admin role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        // Create or update admin document
        await setDoc(doc(db, 'users', user.uid), {
          email: DEFAULT_ADMIN_EMAIL,
          role: 'admin',
          name: 'Admin User',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // Sign out after setup
      await firebaseSignOut(auth);
      return { success: true };
      
    } catch (signInError) {
      // If sign in fails, create new admin user
      if (signInError.code === 'auth/user-not-found') {
        const userCredential = await createUserWithEmailAndPassword(auth, DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD);
        const user = userCredential.user;
        
        await setDoc(doc(db, 'users', user.uid), {
          email: DEFAULT_ADMIN_EMAIL,
          role: 'admin',
          name: 'Admin User',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        
        // Sign out after setup
        await firebaseSignOut(auth);
        return { success: true };
      }
      
      return { success: false, error: signInError.message };
    }
  } catch (error) {
    console.error('Error in admin setup process:', error);
    return { success: false, error: error.message };
  }
};