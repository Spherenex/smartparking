import React, { useState, useEffect } from 'react';
import { User, Calendar, Home, LogOut, Clock, Bell } from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, onSnapshot, collection, query, orderBy, limit } from 'firebase/firestore';
import { auth, db } from '../firebase';
import '../styles/Header.css';

const Header = ({ setActiveView, activeView }) => {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [bookingHistory, setBookingHistory] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Monitor auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserProfile(currentUser.uid);
        subscribeToBookingHistory(currentUser.uid);
        subscribeToNotifications(currentUser.uid);
      } else {
        setProfileData(null);
        setBookingHistory([]);
        setNotifications([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch user profile from Firebase
  const fetchUserProfile = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setProfileData(userDoc.data());
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Subscribe to real-time booking history updates
  const subscribeToBookingHistory = (userId) => {
    const historyRef = collection(db, 'users', userId, 'bookings');
    const historyQuery = query(historyRef, orderBy('createdAt', 'desc'), limit(5));
    
    const unsubscribe = onSnapshot(historyQuery, (snapshot) => {
      const bookings = [];
      snapshot.forEach((doc) => {
        bookings.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setBookingHistory(bookings);
    }, (error) => {
      console.error("Error getting booking history:", error);
    });
    
    return unsubscribe;
  };

  // Subscribe to real-time notifications
  const subscribeToNotifications = (userId) => {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const notificationsQuery = query(notificationsRef, orderBy('timestamp', 'desc'), limit(5));
    
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const newNotifications = [];
      let newUnreadCount = 0;
      
      snapshot.forEach((doc) => {
        const notification = {
          id: doc.id,
          ...doc.data()
        };
        if (!notification.read) {
          newUnreadCount++;
        }
        newNotifications.push(notification);
      });
      
      setNotifications(newNotifications);
      setUnreadCount(newUnreadCount);
    }, (error) => {
      console.error("Error getting notifications:", error);
    });
    
    return unsubscribe;
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Additional cleanup as needed
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="app-header">
      <div className="header-brand">
        <h1>Park Smart</h1>
      </div>
      
      <nav className="header-nav">
        <button 
          className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveView('dashboard')}
        >
          <Home size={20} />
          <span>Dashboard</span>
        </button>
        
        <button 
          className={`nav-item ${activeView === 'history' ? 'active' : ''}`}
          onClick={() => setActiveView('history')}
        >
          <Calendar size={20} />
          <span>History</span>
          {bookingHistory.length > 0 && (
            <span className="badge history-badge">{bookingHistory.length}</span>
          )}
        </button>
        
        <button 
          className={`nav-item ${activeView === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveView('profile')}
        >
          <User size={20} />
          <span>Profile</span>
        </button>
      </nav>
      
      <div className="header-actions">
        {/* <div className="notification-container">
          <button 
            className="notification-btn"
            onClick={toggleNotifications}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notifications-panel">
              <h3>Notifications</h3>
              {notifications.length > 0 ? (
                <ul className="notifications-list">
                  {notifications.map(notification => (
                    <li 
                      key={notification.id} 
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    >
                      <div className="notification-icon">
                        {notification.type === 'booking' ? <Clock size={16} /> : <Bell size={16} />}
                      </div>
                      <div className="notification-content">
                        <p>{notification.message}</p>
                        <span className="notification-time">
                          {notification.timestamp?.toDate().toLocaleString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="no-notifications">No notifications</p>
              )}
            </div>
          )}
        </div> */}
        
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              {profileData?.name ? profileData.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{profileData?.name || 'User'}</span>
              <span className="user-email">{user.email}</span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;