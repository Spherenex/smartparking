// import React, { useState, useEffect } from 'react';
// import { ref, onValue, update, get } from 'firebase/database';
// import { auth, rtdb } from '../firebase';
// import { 
//   User, Phone, Car, Mail, Search, Edit, Save, X, Check, 
//   AlertTriangle, Filter, Download, Users, RefreshCw
// } from 'lucide-react';
// import '../styles/UserDetails.css';

// const UserDetails = () => {
//   // State for users data
//    const [users, setUsers] = useState([]);
//   const [filteredUsers, setFilteredUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
  
//   // State for editing
//   const [editingUser, setEditingUser] = useState(null);
//   const [vehicleType, setVehicleType] = useState('');
  
//   // State for filtering and searching
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
  
//   // State for feedback messages
//   const [successMessage, setSuccessMessage] = useState(null);
  
//   // Fetch all users on component mount
//   useEffect(() => {
//     // Verify admin is logged in
//     if (!auth.currentUser) {
//       setError('You must be logged in as an admin to view this page.');
//       setLoading(false);
//       return;
//     }
    
//     // Here you would typically check if the current user has admin rights
//     // This would require a separate admin flag in your database
    
//     const usersRef = ref(rtdb, 'users');
    
//     const unsubscribe = onValue(usersRef, (snapshot) => {
//       setLoading(true);
      
//       if (snapshot.exists()) {
//         const usersData = snapshot.val();
        
//         // Convert object of users to array
//         const usersArray = Object.keys(usersData).map(uid => ({
//           uid,
//           ...usersData[uid]
//         }));
        
//         setUsers(usersArray);
//         setFilteredUsers(usersArray);
//       } else {
//         setUsers([]);
//         setFilteredUsers([]);
//       }
      
//       setLoading(false);
//     }, (error) => {
//       console.error("Error fetching users:", error);
//       setError('Failed to load user data. Please try again later.');
//       setLoading(false);
//     });
    
//     return () => unsubscribe();
//   }, []);
  
//   // Filter users when search term or filter status changes
//   useEffect(() => {
//     let result = [...users];
    
//     // Apply search term filter
//     if (searchTerm) {
//       result = result.filter(user => 
//         (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
//         (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
//         (user.phoneNumber && user.phoneNumber.includes(searchTerm)) ||
//         (user.vehicleNumber && user.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()))
//       );
//     }
    
//     // Apply vehicle type filter
//     if (filterStatus !== 'all') {
//       if (filterStatus === 'empty') {
//         result = result.filter(user => !user.vehicleType);
//       } else {
//         result = result.filter(user => user.vehicleType === filterStatus);
//       }
//     }
    
//     setFilteredUsers(result);
//   }, [searchTerm, filterStatus, users]);
  
//   const startEditing = (user) => {
//     setEditingUser(user.uid);
//     setVehicleType(user.vehicleType || '');
//   };
  
//   const cancelEditing = () => {
//     setEditingUser(null);
//     setVehicleType('');
//   };
  
//   const saveVehicleType = async (uid) => {
//     if (!uid) return;
    
//     try {
//       const userRef = ref(rtdb, `users/${uid}`);
      
//       await update(userRef, {
//         vehicleType: vehicleType
//       });
      
//       setEditingUser(null);
//       setSuccessMessage(`Vehicle type updated successfully for user ${uid}`);
      
//       // Clear success message after 3 seconds
//       setTimeout(() => {
//         setSuccessMessage(null);
//       }, 3000);
//     } catch (err) {
//       console.error("Error updating vehicle type:", err);
//       setError(`Failed to update vehicle type: ${err.message}`);
      
//       // Clear error message after 3 seconds
//       setTimeout(() => {
//         setError(null);
//       }, 3000);
//     }
//   };
  
//   const exportUserData = () => {
//     // Create CSV data
//     const csvHeader = ['User ID', 'Name', 'Email', 'Phone Number', 'Vehicle Number', 'Vehicle Type'];
    
//     const csvData = filteredUsers.map(user => [
//       user.uid,
//       user.name || '',
//       user.email || '',
//       user.phoneNumber || '',
//       user.vehicleNumber || '',
//       user.vehicleType || ''
//     ]);
    
//     // Combine header and data
//     const csv = [
//       csvHeader.join(','),
//       ...csvData.map(row => row.join(','))
//     ].join('\n');
    
//     // Create download link
//     const blob = new Blob([csv], { type: 'text/csv' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `user-data-${new Date().toISOString().split('T')[0]}.csv`;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(url);
//   };
  
//   const refreshData = async () => {
//     setLoading(true);
    
//     try {
//       const usersRef = ref(rtdb, 'users');
//       const snapshot = await get(usersRef);
      
//       if (snapshot.exists()) {
//         const usersData = snapshot.val();
        
//         // Convert object of users to array
//         const usersArray = Object.keys(usersData).map(uid => ({
//           uid,
//           ...usersData[uid]
//         }));
        
//         setUsers(usersArray);
//         setFilteredUsers(usersArray);
//       }
      
//       setSuccessMessage('Data refreshed successfully');
      
//       // Clear success message after 3 seconds
//       setTimeout(() => {
//         setSuccessMessage(null);
//       }, 3000);
//     } catch (err) {
//       console.error("Error refreshing data:", err);
//       setError(`Failed to refresh data: ${err.message}`);
      
//       // Clear error message after 3 seconds
//       setTimeout(() => {
//         setError(null);
//       }, 3000);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Get unique vehicle types for filter dropdown
//   const vehicleTypes = ['all', 'empty', ...new Set(users.filter(user => user.vehicleType).map(user => user.vehicleType))];
  
//   return (
//     <div className="admin-panel">
//       <div className="admin-header">
//         <div className="header-title">
//           <h1>
//             <Users size={28} />
//             User Management
//           </h1>
//           <p>Total users: {users.length}</p>
//         </div>
        
//         <div className="header-actions">
//           <button className="refresh-btn" onClick={refreshData} disabled={loading}>
//             <RefreshCw size={16} />
//             Refresh
//           </button>
//           <button className="export-btn" onClick={exportUserData} disabled={filteredUsers.length === 0}>
//             <Download size={16} />
//             Export CSV
//           </button>
//         </div>
//       </div>
      
//       {error && (
//         <div className="admin-message error">
//           <AlertTriangle size={20} />
//           {error}
//         </div>
//       )}
      
//       {successMessage && (
//         <div className="admin-message success">
//           <Check size={20} />
//           {successMessage}
//         </div>
//       )}
      
//       <div className="admin-controls">
//         <div className="search-container">
//           <Search size={18} />
//           <input
//             type="text"
//             placeholder="Search by name, email, phone, or vehicle number..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="search-input"
//           />
//           {searchTerm && (
//             <button 
//               className="clear-search" 
//               onClick={() => setSearchTerm('')}
//               aria-label="Clear search"
//             >
//               <X size={16} />
//             </button>
//           )}
//         </div>
        
//         <div className="filter-container">
//           <Filter size={18} />
//           <select 
//             value={filterStatus} 
//             onChange={(e) => setFilterStatus(e.target.value)}
//             className="filter-select"
//           >
//             <option value="all">All Vehicle Types</option>
//             <option value="empty">Not Set</option>
//             {vehicleTypes
//               .filter(type => type !== 'all' && type !== 'empty')
//               .map(type => (
//                 <option key={type} value={type}>{type}</option>
//               ))
//             }
//           </select>
//         </div>
//       </div>
      
//       {loading ? (
//         <div className="loading-container">
//           <div className="loading-spinner"></div>
//           <p>Loading user data...</p>
//         </div>
//       ) : filteredUsers.length === 0 ? (
//         <div className="no-users">
//           <User size={48} />
//           <h2>No users found</h2>
//           <p>
//             {searchTerm || filterStatus !== 'all'
//               ? 'Try adjusting your search or filter criteria'
//               : 'There are no registered users in the system yet'}
//           </p>
//         </div>
//       ) : (
//         <div className="users-table-container">
//           <table className="users-table">
//             <thead>
//               <tr>
//                 <th>Name</th>
//                 <th>Email</th>
//                 <th>Phone Number</th>
//                 <th>Vehicle Number</th>
//                 <th>Vehicle Type</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredUsers.map(user => (
//                 <tr key={user.uid}>
//                   <td className="user-name">
//                     <User size={16} className="icon" />
//                     <span>{user.name || 'Not set'}</span>
//                   </td>
//                   <td className="user-email">
//                     <Mail size={16} className="icon" />
//                     <span>{user.email || 'Not set'}</span>
//                   </td>
//                   <td className="user-phone">
//                     <Phone size={16} className="icon" />
//                     <span>{user.phoneNumber || 'Not set'}</span>
//                   </td>
//                   <td className="user-vehicle">
//                     <Car size={16} className="icon" />
//                     <span>{user.vehicleNumber || 'Not set'}</span>
//                   </td>
//                   <td className="user-vehicle-type">
//                     {editingUser === user.uid ? (
//                       <select
//                         value={vehicleType}
//                         onChange={(e) => setVehicleType(e.target.value)}
//                         className="vehicle-type-select"
//                       >
//                         <option value="">Not Set</option>
//                         <option value="Car">Car</option>
//                         <option value="Bike">Bike</option>
//                         <option value="SUV">SUV</option>
//                         <option value="Truck">Truck</option>
//                         <option value="Van">Van</option>
//                       </select>
//                     ) : (
//                       <span className={`vehicle-type ${user.vehicleType ? 'has-type' : 'no-type'}`}>
//                         {user.vehicleType || 'Not set'}
//                       </span>
//                     )}
//                   </td>
//                   <td className="user-actions">
//                     {editingUser === user.uid ? (
//                       <div className="edit-actions">
//                         <button 
//                           className="save-button"
//                           onClick={() => saveVehicleType(user.uid)}
//                           title="Save changes"
//                         >
//                           <Save size={16} />
//                         </button>
//                         <button 
//                           className="cancel-button"
//                           onClick={cancelEditing}
//                           title="Cancel"
//                         >
//                           <X size={16} />
//                         </button>
//                       </div>
//                     ) : (
//                       <button 
//                         className="edit-button"
//                         onClick={() => startEditing(user)}
//                         title="Edit vehicle type"
//                       >
//                         <Edit size={16} />
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}
      
//       <div className="admin-footer">
//         <p>
//           Showing {filteredUsers.length} of {users.length} users
//           {searchTerm && ' (filtered)'}
//         </p>
//       </div>
//     </div>
//   );
// };


// export default UserDetails;



import React, { useState, useEffect } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { auth, rtdb } from '../firebase';
import { 
  User, Phone, Car, Mail, Search, Edit, Save, X, Check, 
  AlertTriangle, Filter, Download, Users, RefreshCw
} from 'lucide-react';
import '../styles/UserDetails.css';

const UserDetails = () => {
  // State for users data
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for editing
  const [editingUser, setEditingUser] = useState(null);
  const [vehicleType, setVehicleType] = useState('');
  
  // State for filtering and searching
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // State for feedback messages
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Vehicle type mapping (display value to database value)
  const vehicleTypeMapping = {
    'Bike': '2',
    'Car': '4',
    'Auto': '3',
    'SUV': '4',
    'Truck': '4',
    'Van': '4'
  };
  
  // Reverse mapping (database value to display value)
  const vehicleTypeDisplayMapping = {
    '2': 'Bike',
    '3': 'Auto',
    '4': 'Car'
  };
  
  // Fetch all users on component mount
  useEffect(() => {
    // Verify admin is logged in
    if (!auth.currentUser) {
      setError('You must be logged in as an admin to view this page.');
      setLoading(false);
      return;
    }
    
    const usersRef = ref(rtdb, 'users');
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      setLoading(true);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        
        // Convert object of users to array
        const usersArray = Object.keys(usersData).map(uid => ({
          uid,
          ...usersData[uid],
          // Convert numeric vehicle type to display value
          displayVehicleType: usersData[uid].vehicleType ? 
            (vehicleTypeDisplayMapping[usersData[uid].vehicleType] || usersData[uid].vehicleType) : 
            ''
        }));
        
        setUsers(usersArray);
        setFilteredUsers(usersArray);
      } else {
        setUsers([]);
        setFilteredUsers([]);
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      setError('Failed to load user data. Please try again later.');
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Filter users when search term or filter status changes
  useEffect(() => {
    let result = [...users];
    
    // Apply search term filter
    if (searchTerm) {
      result = result.filter(user => 
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.phoneNumber && user.phoneNumber.includes(searchTerm)) ||
        (user.vehicleNumber && user.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.displayVehicleType && user.displayVehicleType.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply vehicle type filter
    if (filterStatus !== 'all') {
      if (filterStatus === 'empty') {
        result = result.filter(user => !user.vehicleType);
      } else {
        // Filter by numeric value or display value
        result = result.filter(user => 
          user.vehicleType === filterStatus || 
          user.displayVehicleType === filterStatus
        );
      }
    }
    
    setFilteredUsers(result);
  }, [searchTerm, filterStatus, users]);
  
  const startEditing = (user) => {
    setEditingUser(user.uid);
    // Set the dropdown to show the display value
    setVehicleType(user.displayVehicleType || '');
  };
  
  const cancelEditing = () => {
    setEditingUser(null);
    setVehicleType('');
  };
  
  const saveVehicleType = async (uid) => {
    if (!uid) return;
    
    try {
      const userRef = ref(rtdb, `users/${uid}`);
      
      // Convert display value to numeric value for storage
      const numericValue = vehicleTypeMapping[vehicleType] || '';
      
      await update(userRef, {
        vehicleType: numericValue
      });
      
      setEditingUser(null);
      setSuccessMessage(`Vehicle type updated successfully for user ${uid}`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error updating vehicle type:", err);
      setError(`Failed to update vehicle type: ${err.message}`);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };
  
  const exportUserData = () => {
    // Create CSV data
    const csvHeader = ['User ID', 'Name', 'Phone Number', 'Vehicle Number', 'Vehicle Type'];
    
    const csvData = filteredUsers.map(user => [
      user.uid,
      user.name || '',
      user.phoneNumber || '',
      user.vehicleNumber || '',
      user.displayVehicleType || ''
    ]);
    
    // Combine header and data
    const csv = [
      csvHeader.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const refreshData = async () => {
    setLoading(true);
    
    try {
      const usersRef = ref(rtdb, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        
        // Convert object of users to array
        const usersArray = Object.keys(usersData).map(uid => ({
          uid,
          ...usersData[uid],
          // Convert numeric vehicle type to display value
          displayVehicleType: usersData[uid].vehicleType ? 
            (vehicleTypeDisplayMapping[usersData[uid].vehicleType] || usersData[uid].vehicleType) : 
            ''
        }));
        
        setUsers(usersArray);
        setFilteredUsers(usersArray);
      }
      
      setSuccessMessage('Data refreshed successfully');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError(`Failed to refresh data: ${err.message}`);
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  };
  
  // Get unique vehicle types for filter dropdown
  const displayVehicleTypes = users
    .filter(user => user.displayVehicleType)
    .map(user => user.displayVehicleType);
  
  const uniqueVehicleTypes = ['all', 'empty', ...new Set(displayVehicleTypes)];
  
  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="header-title">
          <h1>
            <Users size={28} />
            User Management
          </h1>
          <p>Total users: {users.length}</p>
        </div>
        
        <div className="header-actions">
          <button className="refresh-btn" onClick={refreshData} disabled={loading}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="export-btn" onClick={exportUserData} disabled={filteredUsers.length === 0}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>
      
      {error && (
        <div className="admin-message error">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="admin-message success">
          <Check size={20} />
          {successMessage}
        </div>
      )}
      
      <div className="admin-controls">
        <div className="search-container">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, phone, or vehicle details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search" 
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="filter-container">
          <Filter size={18} />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Vehicle Types</option>
            <option value="empty">Not Set</option>
            {uniqueVehicleTypes
              .filter(type => type !== 'all' && type !== 'empty')
              .map(type => (
                <option key={type} value={type}>{type}</option>
              ))
            }
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading user data...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="no-users">
          <User size={48} />
          <h2>No users found</h2>
          <p>
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'There are no registered users in the system yet'}
          </p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>NAME</th>
                <th>PHONE NUMBER</th>
                <th>VEHICLE NUMBER</th>
                <th>VEHICLE TYPE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.uid}>
                  <td>
                    <div className="td-content">
                      <User size={16} className="icon" />
                      <span>{user.name || 'Not set'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="td-content">
                      <Phone size={16} className="icon" />
                      <span>{user.phoneNumber || 'Not set'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="td-content">
                      <Car size={16} className="icon" />
                      <span>{user.vehicleNumber || 'Not set'}</span>
                    </div>
                  </td>
                  <td>
                    {editingUser === user.uid ? (
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="vehicle-type-select"
                      >
                        <option value="">Not Set</option>
                        <option value="Car">Car</option>
                        <option value="Bike">Bike</option>
                        <option value="Auto">Auto</option>
                        <option value="SUV">SUV</option>
                        <option value="Truck">Truck</option>
                        <option value="Van">Van</option>
                      </select>
                    ) : (
                      <div className="td-content">
                        <span className={`vehicle-type ${user.displayVehicleType ? 'has-type' : 'no-type'}`}>
                          {user.displayVehicleType || 'Not set'}
                        </span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="td-content-center">
                      {editingUser === user.uid ? (
                        <div className="edit-actions">
                          <button 
                            className="save-button"
                            onClick={() => saveVehicleType(user.uid)}
                            title="Save changes"
                          >
                            <Save size={16} />
                          </button>
                          <button 
                            className="cancel-button"
                            onClick={cancelEditing}
                            title="Cancel"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="edit-button"
                          onClick={() => startEditing(user)}
                          title="Edit vehicle type"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="admin-footer">
        <p>
          Showing {filteredUsers.length} of {users.length} users
          {searchTerm && ' (filtered)'}
        </p>
      </div>
    </div>
  );
};


export default UserDetails;