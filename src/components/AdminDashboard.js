


// import React, { useState, useEffect } from 'react';
// import { LayoutDashboard, Settings, Users, FileText, BarChart3, LogOut, Bell, Shield } from 'lucide-react';
// import { rtdb, signOut } from '../firebase';
// import { ref, onValue } from 'firebase/database';
// import UsersList from './UsersList';
// import '../styles/AdminDashboard.css';

// const AdminDashboard = ({ currentUser, onLogout }) => {
//   const [stats, setStats] = useState({
//     totalSpots: 10,
//     activeUsers: 0,
//     dailyRevenue: 0,
//     vacantSpots: 0
//   });
  
//   const [recentActivity, setRecentActivity] = useState([]);
  
//   const [parkingStatus, setParkingStatus] = useState({
//     available: 0,
//     occupied: 0,
//     reserved: 0
//   });
  
//   const [loading, setLoading] = useState(true);
//   const [currentView, setCurrentView] = useState('dashboard');

//   useEffect(() => {
//     if (currentView !== 'dashboard') return;

//     const statsRef = ref(rtdb, 'dashboardStats');
//     const statsUnsubscribe = onValue(statsRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setStats({
//           totalSpots: data.totalSpots || 0,
//           activeUsers: data.activeUsers || 0,
//           dailyRevenue: data.dailyRevenue || 0,
//           vacantSpots: data.vacantSpots || 0
//         });
//       }
//     });

//     const activitiesRef = ref(rtdb, 'recentActivities');
//     const activitiesUnsubscribe = onValue(activitiesRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         const activitiesArray = Object.entries(data).map(([id, activity]) => ({
//           id,
//           user: activity.user,
//           action: activity.action,
//           time: activity.time
//         }));
//         activitiesArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
//         setRecentActivity(activitiesArray.slice(0, 5));
//       } else {
//         setRecentActivity([]);
//       }
//     });

//     const statusRef = ref(rtdb, 'parkingStatus');
//     const statusUnsubscribe = onValue(statusRef, (snapshot) => {
//       const data = snapshot.val();
//       if (data) {
//         setParkingStatus({
//           available: data.available || 0,
//           occupied: data.occupied || 0,
//           reserved: data.reserved || 0
//         });
//       }
//     });

//     setLoading(false);

//     return () => {
//       statsUnsubscribe();
//       activitiesUnsubscribe();
//       statusUnsubscribe();
//     };
//   }, [currentView]);

//   const handleLogout = async () => {
//     try {
//       await signOut();
//       onLogout();
//     } catch (error) {
//       console.error("Logout error:", error);
//     }
//   };

//   const formattedStats = [
//     { 
//       title: 'Total Parking Spots', 
//       value: 10, 
//       change: '+4%', 
//       icon: <BarChart3 size={20} /> 
//     },
//     { 
//       title: 'Active Users', 
//       value: parkingStatus.occupied.toLocaleString(),
//       change: '+12%', 
//       icon: <Users size={20} /> 
//     },
//     { 
//       title: 'Daily Revenue', 
//       value: `₹${stats.dailyRevenue.toLocaleString()}`, 
//       change: '+18%', 
//       icon: <BarChart3 size={20} /> 
//     },
//     { 
//       title: 'Vacant Spots', 
//       value: stats.vacantSpots.toLocaleString(), 
//       change: '+7%', 
//       icon: <FileText size={20} /> 
//     }
//   ];

//   const renderContent = () => {
//     switch (currentView) {
//       case 'users':
//         return <UsersList onBack={() => setCurrentView('dashboard')} recentActivity={recentActivity} />;
//       case 'dashboard':
//       default:
//         return (
//           <main className="dashboard-content">
//             {loading ? (
//               <div className="loading-container">
//                 <div className="loading-spinner"></div>
//                 <p>Loading dashboard data...</p>
//               </div>
//             ) : (
//               <>
//                 <div className="stats-grid">
//                   {formattedStats.map((stat, index) => (
//                     <div key={index} className="stat-card">
//                       <div className="stat-header">
//                         <div>
//                           <p className="stat-title">{stat.title}</p>
//                           <p className="stat-value">{stat.value}</p>
//                         </div>
//                         <div className="stat-icon">
//                           {stat.icon}
//                         </div>
//                       </div>
//                       <p className={`stat-change ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
//                         {stat.change} from last month
//                       </p>
//                     </div>
//                   ))}
//                 </div>
                
//                 <div className="dashboard-grid">
//                   <div className="dashboard-card">
//                     <div className="card-header">
//                       <h2 className="card-title">Parking Status</h2>
//                     </div>
//                     <div className="parking-status">
//                       <div className="status-container">
//                         <div className="status-item available">
//                           <p className="status-label">Available</p>
//                           <p className="status-count">{parkingStatus.available}</p>
//                         </div>
//                         <div className="status-item occupied">
//                           <p className="status-label">Occupied</p>
//                           <p className="status-count">{parkingStatus.occupied}</p>
//                         </div>
//                         {/* <div className="status-item reserved">
//                           <p className="status-label">Reserved</p>
//                           <p className="status-count">{parkingStatus.reserved}</p>
//                         </div> */}
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="dashboard-card">
//                     <div className="card-header">
//                       <h2 className="card-title">Recent Activity</h2>
//                       <div className="view-all">View All</div>
//                     </div>
                    
//                     <div className="activity-list">
//                       {recentActivity.length > 0 ? (
//                         recentActivity.map((activity) => (
//                           <div key={activity.id} className="activity-item">
//                             <div className="activity-avatar">
//                               {activity.user.charAt(0)}
//                             </div>
//                             <div className="activity-details">
//                               <p className="activity-text">
//                                 <span className="activity-user">{activity.user}</span> {activity.action}
//                               </p>
//                               <p className="activity-time">{activity.time}</p>
//                             </div>
//                           </div>
//                         ))
//                       ) : (
//                         <div className="no-activity">
//                           <p>No recent activity to display</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </main>
//         );
//     }
//   };

//   return (
//     <div className="dashboard-container">
//       <div className="sidebar">
//         <div className="sidebar-header">
//           <Shield className="sidebar-logo" size={24} />
//           <h1 className="sidebar-title">Parking Admin</h1>
//         </div>
        
//         <nav className="sidebar-nav">
//           <div className="nav-section-title">
//             Main
//           </div>
          
//           <div
//             className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
//             onClick={() => setCurrentView('dashboard')}
//           >
//             <LayoutDashboard className="nav-icon" size={20} />
//             Dashboard
//           </div>
          
//           <div
//             className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
//             onClick={() => setCurrentView('users')}
//           >
//             <Users className="nav-icon" size={20} />
//            Parking Records
//           </div>
          
//           <div className="nav-item">
//             <FileText className="nav-icon" size={20} />
//            User Profiles
//           </div>
          
//           {/* <div className="nav-item">
//             <BarChart3 className="nav-icon" size={20} />
//             Analytics
//           </div>
          
//           <div className="nav-section-title">
//             Settings
//           </div>
          
//           <div className="nav-item">
//             <Settings className="nav-icon" size={20} />
//             Settings
//           </div> */}
          
//           <div className="nav-item logout" onClick={handleLogout}>
//             <LogOut className="nav-icon" size={20} />
//             Logout
//           </div>
//         </nav>
//       </div>
      
//       <div className="main-content">
//         <header className="dashboard-header">
//           <div className="header-left">
//             <button className="menu-button">
//               <svg xmlns="http://www.w3.org/2000/svg" className="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//               </svg>
//             </button>
//             <h2 className="welcome-text">Welcome back, {currentUser?.name || 'Admin'}</h2>
//           </div>
          
//           <div className="header-right">
//             <div className="notification-icon">
//               <Bell size={20} />
//             </div>
//             <div className="user-profile">
//               <div className="avatar">
//                 {currentUser?.name?.charAt(0) || 'A'}
//               </div>
//               <div className="user-info">
//                 <p className="user-name">{currentUser?.name || 'Admin User'}</p>
//                 <p className="user-role">{currentUser?.email}</p>
//               </div>
//             </div>
//           </div>
//         </header>
        
//         {renderContent()}
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;



import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Settings, Users, FileText, BarChart3, LogOut, Bell, Shield } from 'lucide-react';
import { rtdb, signOut } from '../firebase';
import { ref, onValue } from 'firebase/database';
import UsersList from './UsersList';
// import AdminPanel from './AdminPanel'; // Import the AdminPanel component
import '../styles/AdminDashboard.css';
import UserDetails from './UserDetails';

const AdminDashboard = ({ currentUser, onLogout, allBookings }) => {
  const [stats, setStats] = useState({
    totalSpots: 10,
    activeUsers: 0,
    dailyRevenue: 0,
    vacantSpots: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  
  const [parkingStatus, setParkingStatus] = useState({
    available: 0,
    occupied: 0,
    reserved: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    if (currentView !== 'dashboard') return;

    const statsRef = ref(rtdb, 'dashboardStats');
    const statsUnsubscribe = onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStats({
          totalSpots: data.totalSpots || 0,
          activeUsers: data.activeUsers || 0,
          dailyRevenue: data.dailyRevenue || 0,
          vacantSpots: data.vacantSpots || 0
        });
      }
    });

    const activitiesRef = ref(rtdb, 'recentActivities');
    const activitiesUnsubscribe = onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const activitiesArray = Object.entries(data).map(([id, activity]) => ({
          id,
          user: activity.user,
          action: activity.action,
          time: activity.time
        }));
        activitiesArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        setRecentActivity(activitiesArray.slice(0, 5));
      } else {
        setRecentActivity([]);
      }
    });

    const statusRef = ref(rtdb, 'parkingStatus');
    const statusUnsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setParkingStatus({
          available: data.available || 0,
          occupied: data.occupied || 0,
          reserved: data.reserved || 0
        });
      }
    });

    setLoading(false);

    return () => {
      statsUnsubscribe();
      activitiesUnsubscribe();
      statusUnsubscribe();
    };
  }, [currentView]);

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const formattedStats = [
    { 
      title: 'Total Parking Spots', 
      value: 10, 
      change: '+4%', 
      icon: <BarChart3 size={20} /> 
    },
    { 
      title: 'Active Users', 
      value: parkingStatus.occupied.toLocaleString(),
      change: '+12%', 
      icon: <Users size={20} /> 
    },
    { 
      title: 'Daily Revenue', 
      value: `₹${stats.dailyRevenue.toLocaleString()}`, 
      change: '+18%', 
      icon: <BarChart3 size={20} /> 
    },
    { 
      title: 'Vacant Spots', 
      value: stats.vacantSpots.toLocaleString(), 
      change: '+7%', 
      icon: <FileText size={20} /> 
    }
  ];

  const renderContent = () => {
    switch (currentView) {
      case 'users':
        return <UsersList onBack={() => setCurrentView('dashboard')} recentActivity={recentActivity} />;
      
      case 'userProfiles':
        return <UserDetails userId={currentUser?.uid} />;
      
      case 'dashboard':
      default:
        return (
          <main className="dashboard-content">
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading dashboard data...</p>
              </div>
            ) : (
              <>
                <div className="stats-grid">
                  {formattedStats.map((stat, index) => (
                    <div key={index} className="stat-card">
                      <div className="stat-header">
                        <div>
                          <p className="stat-title">{stat.title}</p>
                          <p className="stat-value">{stat.value}</p>
                        </div>
                        <div className="stat-icon">
                          {stat.icon}
                        </div>
                      </div>
                      <p className={`stat-change ${stat.change.startsWith('+') ? 'positive' : 'negative'}`}>
                        {stat.change} from last month
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="dashboard-grid">
                  <div className="dashboard-card">
                    <div className="card-header">
                      <h2 className="card-title">Parking Status</h2>
                    </div>
                    <div className="parking-status">
                      <div className="status-container">
                        <div className="status-item available">
                          <p className="status-label">Available</p>
                          <p className="status-count">{parkingStatus.available}</p>
                        </div>
                        <div className="status-item occupied">
                          <p className="status-label">Occupied</p>
                          <p className="status-count">{parkingStatus.occupied}</p>
                        </div>
                        {/* <div className="status-item reserved">
                          <p className="status-label">Reserved</p>
                          <p className="status-count">{parkingStatus.reserved}</p>
                        </div> */}
                      </div>
                    </div>
                  </div>
                  
                  <div className="dashboard-card">
                    <div className="card-header">
                      <h2 className="card-title">Recent Activity</h2>
                      <div className="view-all" onClick={() => setCurrentView('users')}>View All</div>
                    </div>
                    
                    <div className="activity-list">
                      {recentActivity.length > 0 ? (
                        recentActivity.map((activity) => (
                          <div key={activity.id} className="activity-item">
                            <div className="activity-avatar">
                              {activity.user.charAt(0)}
                            </div>
                            <div className="activity-details">
                              <p className="activity-text">
                                <span className="activity-user">{activity.user}</span> {activity.action}
                              </p>
                              <p className="activity-time">{activity.time}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-activity">
                          <p>No recent activity to display</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <Shield className="sidebar-logo" size={24} />
          <h1 className="sidebar-title">Parking Admin</h1>
        </div>
        
        <nav className="sidebar-nav">
          <div className="nav-section-title">
            Main
          </div>
          
          <div
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <LayoutDashboard className="nav-icon" size={20} />
            Dashboard
          </div>
          
          <div
            className={`nav-item ${currentView === 'users' ? 'active' : ''}`}
            onClick={() => setCurrentView('users')}
          >
            <Users className="nav-icon" size={20} />
           Parking Records
          </div>
          
          <div
            className={`nav-item ${currentView === 'userProfiles' ? 'active' : ''}`}
            onClick={() => setCurrentView('userProfiles')}
          >
            <FileText className="nav-icon" size={20} />
           User Profiles
          </div>
          
          {/* <div className="nav-item">
            <BarChart3 className="nav-icon" size={20} />
            Analytics
          </div>
          
          <div className="nav-section-title">
            Settings
          </div>
          
          <div className="nav-item">
            <Settings className="nav-icon" size={20} />
            Settings
          </div> */}
          
          <div className="nav-item logout" onClick={handleLogout}>
            <LogOut className="nav-icon" size={20} />
            Logout
          </div>
        </nav>
      </div>
      
      <div className="main-content">
        <header className="dashboard-header">
          <div className="header-left">
            <button className="menu-button">
              <svg xmlns="http://www.w3.org/2000/svg" className="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="welcome-text">Welcome back, {currentUser?.name || 'Admin'}</h2>
          </div>
          
          <div className="header-right">
            <div className="notification-icon">
              <Bell size={20} />
            </div>
            <div className="user-profile">
              <div className="avatar">
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="user-info">
                <p className="user-name">{currentUser?.name || 'Admin User'}</p>
                <p className="user-role">{currentUser?.email}</p>
              </div>
            </div>
          </div>
        </header>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;