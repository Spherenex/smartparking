



import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, limit, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { auth, db } from './firebase';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ParkingHistory from './components/ParkingHistory';
import UserProfile from './components/UserProfile';
import './App.css';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [authView, setAuthView] = useState('login');
  const [recentBookings, setRecentBookings] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  // Authentication state monitoring
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        fetchUserData(currentUser.uid);
      } else {
        // Reset user data when logged out
        setUserProfile(null);
        setRecentBookings([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user data from Firestore
  const fetchUserData = async (userId) => {
    try {
      // Get user profile
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        setUserProfile(userSnap.data());
      }
      
      // Subscribe to recent bookings
      const bookingsRef = collection(db, 'users', userId, 'bookings');
      const bookingsQuery = query(
        bookingsRef,
        where('status', '!=', 'cancelled'),
        limit(5)
      );
      
      const unsubscribe = onSnapshot(bookingsQuery, (snapshot) => {
        const bookings = [];
        snapshot.forEach((doc) => {
          bookings.push({
            id: doc.id,
            ...doc.data()
          });
        });
        setRecentBookings(bookings);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  // Toggle between login and register views
  const switchAuthView = () => {
    setAuthView(authView === 'login' ? 'register' : 'login');
  };

  // If still loading, show loading screen
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If user is not logged in, show auth screens
  if (!user) {
    return (
      <div className="auth-wrapper">
        {authView === 'login' ? (
          <Login onSwitch={switchAuthView} />
        ) : (
          <Register onSwitch={switchAuthView} />
        )}
      </div>
    );
  }

  // Main application with header and content
  return (
    <div className="app-container">
      <Header 
        setActiveView={setActiveView} 
        activeView={activeView} 
      />
      
      <main className="app-content">
        {activeView === 'dashboard' && (
          <Dashboard 
            userProfile={userProfile}
          />
        )}
        
        {activeView === 'history' && (
          <ParkingHistory 
            recentBookings={recentBookings}
            userId={user.uid}
          />
        )}
        
        {activeView === 'profile' && (
          <UserProfile 
            userProfile={userProfile}
            userId={user.uid}
          />
        )}
      </main>
    </div>
  );
};

export default App;