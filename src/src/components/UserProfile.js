// import React, { useState, useEffect } from 'react';
// import { doc, updateDoc, getDoc } from 'firebase/firestore';
// import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
// import { auth, db } from '../firebase';
// import { User, Mail, Phone, Car, Lock, Edit, CheckCircle, X } from 'lucide-react';
// import '../styles/UserProfile.css';

// const UserProfile = ({ userId, userProfile }) => {
//   // Profile data states
//   const [profile, setProfile] = useState({
//     name: '',
//     email: '',
//     phoneNumber: '',
//     vehicleNumber: '',
//     ...userProfile
//   });
  
//   // Edit mode states
//   const [editMode, setEditMode] = useState({
//     name: false,
//     email: false,
//     phoneNumber: false,
//     vehicleNumber: false,
//     password: false
//   });
  
//   // Form state
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phoneNumber: '',
//     vehicleNumber: '',
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });
  
//   // UI states
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
  
//   // Update local state when userProfile prop changes
//   useEffect(() => {
//     if (userProfile) {
//       setProfile({
//         name: '',
//         email: '',
//         phoneNumber: '',
//         vehicleNumber: '',
//         ...userProfile
//       });
//     }
//   }, [userProfile]);
  
//   const toggleEditMode = (field) => {
//     // Reset any previous errors or success messages
//     setError(null);
//     setSuccess(null);
    
//     // Toggle edit mode for the specified field
//     setEditMode(prev => ({
//       ...prev,
//       [field]: !prev[field]
//     }));
    
//     // Initialize form data with current profile data
//     setFormData(prev => ({
//       ...prev,
//       [field]: profile[field] || ''
//     }));
//   };
  
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };
  
//   const cancelEdit = (field) => {
//     setEditMode(prev => ({
//       ...prev,
//       [field]: false
//     }));
//     setError(null);
//   };
  
//   const updateField = async (field) => {
//     setLoading(true);
//     setError(null);
//     setSuccess(null);
    
//     try {
//       const userRef = doc(db, 'users', userId);
      
//       // Special handling for email and password updates
//       if (field === 'email') {
//         // Email requires reauthentication
//         if (!formData.currentPassword) {
//           setError('Current password is required to update email');
//           setLoading(false);
//           return;
//         }
        
//         const credential = EmailAuthProvider.credential(
//           auth.currentUser.email,
//           formData.currentPassword
//         );
        
//         // Reauthenticate
//         await reauthenticateWithCredential(auth.currentUser, credential);
        
//         // Update email in Firebase Auth
//         await updateEmail(auth.currentUser, formData.email);
//       } 
//       else if (field === 'password') {
//         // Password validation
//         if (formData.newPassword !== formData.confirmPassword) {
//           setError('Passwords do not match');
//           setLoading(false);
//           return;
//         }
        
//         if (formData.newPassword.length < 6) {
//           setError('Password must be at least 6 characters');
//           setLoading(false);
//           return;
//         }
        
//         // Reauthenticate
//         const credential = EmailAuthProvider.credential(
//           auth.currentUser.email,
//           formData.currentPassword
//         );
        
//         await reauthenticateWithCredential(auth.currentUser, credential);
        
//         // Update password in Firebase Auth
//         await updatePassword(auth.currentUser, formData.newPassword);
        
//         // Clear password fields
//         setFormData(prev => ({
//           ...prev,
//           currentPassword: '',
//           newPassword: '',
//           confirmPassword: ''
//         }));
//       } 
//       else {
//         // Update other fields in Firestore
//         await updateDoc(userRef, {
//           [field]: formData[field]
//         });
        
//         // Update local state
//         setProfile(prev => ({
//           ...prev,
//           [field]: formData[field]
//         }));
//       }
      
//       // Exit edit mode and show success message
//       setEditMode(prev => ({
//         ...prev,
//         [field]: false
//       }));
      
//       setSuccess(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
      
//       // Fetch updated profile from Firestore for email updates
//       if (field === 'email') {
//         const updatedUserProfile = await getDoc(userRef);
//         if (updatedUserProfile.exists()) {
//           setProfile(updatedUserProfile.data());
//         }
//       }
//     } catch (err) {
//       console.error(`Error updating ${field}:`, err);
      
//       // Handle different error cases
//       if (err.code === 'auth/requires-recent-login') {
//         setError('Please log in again before changing your email/password');
//       } else if (err.code === 'auth/wrong-password') {
//         setError('Incorrect current password');
//       } else if (err.code === 'auth/email-already-in-use') {
//         setError('Email is already in use by another account');
//       } else {
//         setError(`Failed to update ${field}. ${err.message}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   return (
//     <div className="user-profile">
//       <div className="profile-header">
//         <h1>User Profile</h1>
//         <div className="profile-avatar">
//           <User size={40} />
//         </div>
//       </div>
      
//       {error && (
//         <div className="profile-message error">
//           <X size={20} />
//           {error}
//         </div>
//       )}
      
//       {success && (
//         <div className="profile-message success">
//           <CheckCircle size={20} />
//           {success}
//         </div>
//       )}
      
//       <div className="profile-sections">
//         <div className="profile-section">
//           <h2>Personal Information</h2>
          
//           <div className="profile-field">
//             <div className="field-header">
//               <User size={18} />
//               <h3>Name</h3>
//               {!editMode.name && (
//                 <button 
//                   className="edit-button"
//                   onClick={() => toggleEditMode('name')}
//                 >
//                   <Edit size={16} />
//                   Edit
//                 </button>
//               )}
//             </div>
            
//             {editMode.name ? (
//               <div className="edit-field">
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   placeholder="Enter your name"
//                 />
//                 <div className="edit-actions">
//                   <button 
//                     className="cancel-button"
//                     onClick={() => cancelEdit('name')}
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>
//                   <button 
//                     className="save-button"
//                     onClick={() => updateField('name')}
//                     disabled={loading}
//                   >
//                     {loading ? 'Saving...' : 'Save'}
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="field-value">{profile.name || 'Not set'}</div>
//             )}
//           </div>
          
//           <div className="profile-field">
//             <div className="field-header">
//               <Mail size={18} />
//               <h3>Email</h3>
//               {!editMode.email && (
//                 <button 
//                   className="edit-button"
//                   onClick={() => toggleEditMode('email')}
//                 >
//                   <Edit size={16} />
//                   Edit
//                 </button>
//               )}
//             </div>
            
//             {editMode.email ? (
//               <div className="edit-field">
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="Enter your email"
//                 />
//                 <input
//                   type="password"
//                   name="currentPassword"
//                   value={formData.currentPassword}
//                   onChange={handleChange}
//                   placeholder="Current password"
//                   className="password-input"
//                 />
//                 <div className="edit-actions">
//                   <button 
//                     className="cancel-button"
//                     onClick={() => cancelEdit('email')}
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>
//                   <button 
//                     className="save-button"
//                     onClick={() => updateField('email')}
//                     disabled={loading || !formData.email || !formData.currentPassword}
//                   >
//                     {loading ? 'Saving...' : 'Save'}
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="field-value">{profile.email || auth.currentUser?.email || 'Not set'}</div>
//             )}
//           </div>
          
//           <div className="profile-field">
//             <div className="field-header">
//               <Phone size={18} />
//               <h3>Phone Number</h3>
//               {!editMode.phoneNumber && (
//                 <button 
//                   className="edit-button"
//                   onClick={() => toggleEditMode('phoneNumber')}
//                 >
//                   <Edit size={16} />
//                   Edit
//                 </button>
//               )}
//             </div>
            
//             {editMode.phoneNumber ? (
//               <div className="edit-field">
//                 <input
//                   type="tel"
//                   name="phoneNumber"
//                   value={formData.phoneNumber}
//                   onChange={handleChange}
//                   placeholder="Enter your phone number"
//                   pattern="[0-9]{10}"
//                 />
//                 <div className="edit-actions">
//                   <button 
//                     className="cancel-button"
//                     onClick={() => cancelEdit('phoneNumber')}
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>
//                   <button 
//                     className="save-button"
//                     onClick={() => updateField('phoneNumber')}
//                     disabled={loading || !formData.phoneNumber}
//                   >
//                     {loading ? 'Saving...' : 'Save'}
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="field-value">{profile.phoneNumber || 'Not set'}</div>
//             )}
//           </div>
//         </div>
        
//         <div className="profile-section">
//           <h2>Vehicle Information</h2>
          
//           <div className="profile-field">
//             <div className="field-header">
//               <Car size={18} />
//               <h3>Vehicle Registration Number</h3>
//               {!editMode.vehicleNumber && (
//                 <button 
//                   className="edit-button"
//                   onClick={() => toggleEditMode('vehicleNumber')}
//                 >
//                   <Edit size={16} />
//                   Edit
//                 </button>
//               )}
//             </div>
            
//             {editMode.vehicleNumber ? (
//               <div className="edit-field">
//                 <input
//                   type="text"
//                   name="vehicleNumber"
//                   value={formData.vehicleNumber}
//                   onChange={handleChange}
//                   placeholder="Enter your vehicle number"
//                 />
//                 <div className="edit-actions">
//                   <button 
//                     className="cancel-button"
//                     onClick={() => cancelEdit('vehicleNumber')}
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>
//                   <button 
//                     className="save-button"
//                     onClick={() => updateField('vehicleNumber')}
//                     disabled={loading || !formData.vehicleNumber}
//                   >
//                     {loading ? 'Saving...' : 'Save'}
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="field-value">{profile.vehicleNumber || 'Not set'}</div>
//             )}
//           </div>
//         </div>
        
//         <div className="profile-section">
//           <h2>Security</h2>
          
//           <div className="profile-field">
//             <div className="field-header">
//               <Lock size={18} />
//               <h3>Password</h3>
//               {!editMode.password && (
//                 <button 
//                   className="edit-button"
//                   onClick={() => toggleEditMode('password')}
//                 >
//                   <Edit size={16} />
//                   Change
//                 </button>
//               )}
//             </div>
            
//             {editMode.password ? (
//               <div className="edit-field">
//                 <input
//                   type="password"
//                   name="currentPassword"
//                   value={formData.currentPassword}
//                   onChange={handleChange}
//                   placeholder="Current password"
//                   className="password-input"
//                 />
//                 <input
//                   type="password"
//                   name="newPassword"
//                   value={formData.newPassword}
//                   onChange={handleChange}
//                   placeholder="New password (min 6 characters)"
//                   className="password-input"
//                 />
//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   placeholder="Confirm new password"
//                   className="password-input"
//                 />
//                 <div className="edit-actions">
//                   <button 
//                     className="cancel-button"
//                     onClick={() => cancelEdit('password')}
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>
//                   <button 
//                     className="save-button"
//                     onClick={() => updateField('password')}
//                     disabled={
//                       loading || 
//                       !formData.currentPassword || 
//                       !formData.newPassword || 
//                       !formData.confirmPassword
//                     }
//                   >
//                     {loading ? 'Updating...' : 'Update Password'}
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="field-value">••••••••</div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserProfile;




// import React, { useState, useEffect } from 'react';
// import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
// import { ref, update, get } from 'firebase/database'; // Changed to RTDB imports
// import { auth, rtdb } from '../firebase'; // Changed to rtdb instead of db
// import { User, Mail, Phone, Car, Lock, Edit, CheckCircle, X } from 'lucide-react';
// import '../styles/UserProfile.css';

// const UserProfile = ({ userId, userProfile }) => {
//   // Profile data states
//   const [profile, setProfile] = useState({
//     name: '',
//     email: '',
//     phoneNumber: '',
//     vehicleNumber: '',
//     ...userProfile
//   });
  
//   // Edit mode states
//   const [editMode, setEditMode] = useState({
//     name: false,
//     email: false,
//     phoneNumber: false,
//     vehicleNumber: false,
//     password: false
//   });
  
//   // Form state
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phoneNumber: '',
//     vehicleNumber: '',
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });
  
//   // UI states
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [success, setSuccess] = useState(null);
  
//   // Check if user is authenticated
//   useEffect(() => {
//     if (!auth.currentUser) {
//       setError('You must be logged in to update your profile.');
//     }
//   }, []);

//   // Update local state when userProfile prop changes
//   useEffect(() => {
//     if (userProfile) {
//       setProfile({
//         name: userProfile.name || '',
//         email: userProfile.email || auth.currentUser?.email || '',
//         phoneNumber: userProfile.phoneNumber || '',
//         vehicleNumber: userProfile.vehicleNumber || '',
//       });
//     }
//   }, [userProfile]);

//   const toggleEditMode = (field) => {
//     // Reset any previous errors or success messages
//     setError(null);
//     setSuccess(null);
    
//     // Toggle edit mode for the specified field
//     setEditMode(prev => ({
//       ...prev,
//       [field]: !prev[field]
//     }));
    
//     // Initialize form data with current profile data
//     setFormData(prev => ({
//       ...prev,
//       [field]: profile[field] || ''
//     }));
//   };
  
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };
  
//   const cancelEdit = (field) => {
//     setEditMode(prev => ({
//       ...prev,
//       [field]: false
//     }));
//     setError(null);
//     setSuccess(null);
//     setFormData(prev => ({
//       ...prev,
//       currentPassword: '',
//       newPassword: '',
//       confirmPassword: ''
//     }));
//   };
  
//   const updateField = async (field) => {
//     if (!userId) {
//       setError('User ID is missing. Cannot update profile.');
//       return;
//     }

//     // Verify that userId matches the authenticated user
//     if (userId !== auth.currentUser?.uid) {
//       setError('You do not have permission to update this profile.');
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setSuccess(null);
    
//     try {
//       // Changed to use RTDB reference
//       const userRef = ref(rtdb, `users/${userId}`);
      
//       // Validate input before proceeding
//       if (field !== 'password' && !formData[field]) {
//         setError(`${field.charAt(0).toUpperCase() + field.slice(1)} cannot be empty.`);
//         setLoading(false);
//         return;
//       }

//       // Special handling for email and password updates
//       if (field === 'email') {
//         // Email requires reauthentication
//         if (!formData.currentPassword) {
//           setError('Current password is required to update email.');
//           setLoading(false);
//           return;
//         }
        
//         const credential = EmailAuthProvider.credential(
//           auth.currentUser.email,
//           formData.currentPassword
//         );
        
//         // Reauthenticate
//         await reauthenticateWithCredential(auth.currentUser, credential);
        
//         // Update email in Firebase Auth
//         await updateEmail(auth.currentUser, formData.email);

//         // Update email in RTDB as well
//         await update(userRef, { email: formData.email });
        
//         // Update local state
//         setProfile(prev => ({
//           ...prev,
//           email: formData.email
//         }));
//       } 
//       else if (field === 'password') {
//         // Password validation
//         if (formData.newPassword !== formData.confirmPassword) {
//           setError('New password and confirmation do not match.');
//           setLoading(false);
//           return;
//         }
        
//         if (formData.newPassword.length < 6) {
//           setError('Password must be at least 6 characters long.');
//           setLoading(false);
//           return;
//         }
        
//         if (!formData.currentPassword) {
//           setError('Current password is required to update password.');
//           setLoading(false);
//           return;
//         }
        
//         // Reauthenticate
//         const credential = EmailAuthProvider.credential(
//           auth.currentUser.email,
//           formData.currentPassword
//         );
        
//         await reauthenticateWithCredential(auth.currentUser, credential);
        
//         // Update password in Firebase Auth
//         await updatePassword(auth.currentUser, formData.newPassword);
        
//         // Clear password fields
//         setFormData(prev => ({
//           ...prev,
//           currentPassword: '',
//           newPassword: '',
//           confirmPassword: ''
//         }));
//       } 
//       else {
//         // Update other fields in RTDB
//         await update(userRef, {
//           [field]: formData[field]
//         });
        
//         // Update local state
//         setProfile(prev => ({
//           ...prev,
//           [field]: formData[field]
//         }));
//       }
      
//       // Exit edit mode and show success message
//       setEditMode(prev => ({
//         ...prev,
//         [field]: false
//       }));
      
//       setSuccess(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully.`);
      
//       // Fetch updated profile from RTDB to ensure sync
//       const updatedUserSnapshot = await get(userRef);
//       if (updatedUserSnapshot.exists()) {
//         setProfile(prev => ({
//           ...prev,
//           ...updatedUserSnapshot.val()
//         }));
//       }
//     } catch (err) {
//       console.error(`Error updating ${field}:`, err);
      
//       // Handle different error cases
//       if (err.code === 'auth/requires-recent-login') {
//         setError('Please log in again to update your email or password.');
//       } else if (err.code === 'auth/wrong-password') {
//         setError('Incorrect current password.');
//       } else if (err.code === 'auth/email-already-in-use') {
//         setError('Email is already in use by another account.');
//       } else if (err.code === 'permission-denied') {
//         setError('You do not have permission to update this profile. Please ensure you are updating your own profile or contact support.');
//       } else {
//         setError(`Failed to update ${field}. ${err.message}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   return (
//     <div className="user-profile">
//       <div className="profile-header">
//         <h1>User Profile</h1>
//         <div className="profile-avatar">
//           <User size={40} />
//         </div>
//       </div>
      
//       {error && (
//         <div className="profile-message error">
//           <X size={20} />
//           {error}
//         </div>
//       )}
      
//       {success && (
//         <div className="profile-message success">
//           <CheckCircle size={20} />
//           {success}
//         </div>
//       )}
      
//       <div className="profile-sections">
//         <div className="profile-section">
//           <h2>Personal Information</h2>
          
//           <div className="profile-field">
//             <div className="field-header">
//               <User size={18} />
//               <h3>Name</h3>
//               {!editMode.name && (
//                 <button 
//                   className="edit-button"
//                   onClick={() => toggleEditMode('name')}
//                 >
//                   <Edit size={16} />
//                   Edit
//                 </button>
//               )}
//             </div>
            
//             {editMode.name ? (
//               <div className="edit-field">
//                 <input
//                   type="text"
//                   name="name"
//                   value={formData.name}
//                   onChange={handleChange}
//                   placeholder="Enter your name"
//                 />
//                 <div className="edit-actions">
//                   <button 
//                     className="cancel-button"
//                     onClick={() => cancelEdit('name')}
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>
//                   <button 
//                     className="save-button"
//                     onClick={() => updateField('name')}
//                     disabled={loading || !formData.name}
//                   >
//                     {loading ? 'Saving...' : 'Save'}
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="field-value">{profile.name || 'Not set'}</div>
//             )}
//           </div>
          
//           <div className="profile-field">
//             <div className="field-header">
//               <Mail size={18} />
//               <h3>Email</h3>
//               {!editMode.email && (
//                 <button 
//                   className="edit-button"
//                   onClick={() => toggleEditMode('email')}
//                 >
//                   <Edit size={16} />
//                   Edit
//                 </button>
//               )}
//             </div>
            
//             {editMode.email ? (
//               <div className="edit-field">
//                 <input
//                   type="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   placeholder="Enter your email"
//                 />
//                 <input
//                   type="password"
//                   name="currentPassword"
//                   value={formData.currentPassword}
//                   onChange={handleChange}
//                   placeholder="Current password"
//                   className="password-input"
//                 />
//                 <div className="edit-actions">
//                   <button 
//                     className="cancel-button"
//                     onClick={() => cancelEdit('email')}
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>
//                   <button 
//                     className="save-button"
//                     onClick={() => updateField('email')}
//                     disabled={loading || !formData.email || !formData.currentPassword}
//                   >
//                     {loading ? 'Saving...' : 'Save'}
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="field-value">{profile.email || auth.currentUser?.email || 'Not set'}</div>
//             )}
//           </div>
          
//           <div className="profile-field">
//             <div className="field-header">
//               <Phone size={18} />
//               <h3>Phone Number</h3>
//               {!editMode.phoneNumber && (
//                 <button 
//                   className="edit-button"
//                   onClick={() => toggleEditMode('phoneNumber')}
//                 >
//                   <Edit size={16} />
//                   Edit
//                 </button>
//               )}
//             </div>
            
//             {editMode.phoneNumber ? (
//               <div className="edit-field">
//                 <input
//                   type="tel"
//                   name="phoneNumber"
//                   value={formData.phoneNumber}
//                   onChange={handleChange}
//                   placeholder="Enter your phone number"
//                   pattern="[0-9]{10}"
//                 />
//                 <div className="edit-actions">
//                   <button 
//                     className="cancel-button"
//                     onClick={() => cancelEdit('phoneNumber')}
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>
//                   <button 
//                     className="save-button"
//                     onClick={() => updateField('phoneNumber')}
//                     disabled={loading || !formData.phoneNumber}
//                   >
//                     {loading ? 'Saving...' : 'Save'}
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="field-value">{profile.phoneNumber || 'Not set'}</div>
//             )}
//           </div>
//         </div>
        
//         <div className="profile-section">
//           <h2>Vehicle Information</h2>
          
//           <div className="profile-field">
//             <div className="field-header">
//               <Car size={18} />
//               <h3>Vehicle Registration Number</h3>
//               {!editMode.vehicleNumber && (
//                 <button 
//                   className="edit-button"
//                   onClick={() => toggleEditMode('vehicleNumber')}
//                 >
//                   <Edit size={16} />
//                   Edit
//                 </button>
//               )}
//             </div>
            
//             {editMode.vehicleNumber ? (
//               <div className="edit-field">
//                 <input
//                   type="text"
//                   name="vehicleNumber"
//                   value={formData.vehicleNumber}
//                   onChange={handleChange}
//                   placeholder="Enter your vehicle number"
//                 />
//                 <div className="edit-actions">
//                   <button 
//                     className="cancel-button"
//                     onClick={() => cancelEdit('vehicleNumber')}
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>
//                   <button 
//                     className="save-button"
//                     onClick={() => updateField('vehicleNumber')}
//                     disabled={loading || !formData.vehicleNumber}
//                   >
//                     {loading ? 'Saving...' : 'Save'}
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="field-value">{profile.vehicleNumber || 'Not set'}</div>
//             )}
//           </div>
//         </div>
        
//         <div className="profile-section">
//           <h2>Security</h2>
          
//           <div className="profile-field">
//             <div className="field-header">
//               <Lock size={18} />
//               <h3>Password</h3>
//               {!editMode.password && (
//                 <button 
//                   className="edit-button"
//                   onClick={() => toggleEditMode('password')}
//                 >
//                   <Edit size={16} />
//                   Change
//                 </button>
//               )}
//             </div>
            
//             {editMode.password ? (
//               <div className="edit-field">
//                 <input
//                   type="password"
//                   name="currentPassword"
//                   value={formData.currentPassword}
//                   onChange={handleChange}
//                   placeholder="Current password"
//                   className="password-input"
//                 />
//                 <input
//                   type="password"
//                   name="newPassword"
//                   value={formData.newPassword}
//                   onChange={handleChange}
//                   placeholder="New password (min 6 characters)"
//                   className="password-input"
//                 />
//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   placeholder="Confirm new password"
//                   className="password-input"
//                 />
//                 <div className="edit-actions">
//                   <button 
//                     className="cancel-button"
//                     onClick={() => cancelEdit('password')}
//                     disabled={loading}
//                   >
//                     Cancel
//                   </button>
//                   <button 
//                     className="save-button"
//                     onClick={() => updateField('password')}
//                     disabled={
//                       loading || 
//                       !formData.currentPassword || 
//                       !formData.newPassword || 
//                       !formData.confirmPassword
//                     }
//                   >
//                     {loading ? 'Updating...' : 'Update Password'}
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="field-value">••••••••</div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserProfile;



import React, { useState, useEffect } from 'react';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, update, get, onValue } from 'firebase/database'; // Added onValue import
import { auth, rtdb } from '../firebase';
import { User, Mail, Phone, Car, Lock, Edit, CheckCircle, X } from 'lucide-react';
import '../styles/UserProfile.css';

const UserProfile = ({ userId, userProfile }) => {
  // Profile data states
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    vehicleNumber: '',
    ...userProfile
  });
  
  // Edit mode states
  const [editMode, setEditMode] = useState({
    name: false,
    email: false,
    phoneNumber: false,
    vehicleNumber: false,
    password: false
  });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    vehicleNumber: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Check if user is authenticated and fetch fresh data on component mount
  useEffect(() => {
    if (!auth.currentUser) {
      setError('You must be logged in to update your profile.');
      return;
    }
    
    // Verify we have a valid userId
    const currentUserId = auth.currentUser.uid;
    const profileId = userId || currentUserId;
    
    if (!profileId) {
      setError('Unable to retrieve user profile: User ID is missing.');
      return;
    }
    
    // Set up a listener to get real-time updates from Firebase
    const userRef = ref(rtdb, `users/${profileId}`);
    
    // This creates a persistent listener that updates when data changes
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const userData = snapshot.val();
        setProfile({
          name: userData.name || '',
          email: userData.email || auth.currentUser?.email || '',
          phoneNumber: userData.phoneNumber || '',
          vehicleNumber: userData.vehicleNumber || '',
          // Include any other fields that should be in the profile
        });
      } else {
        // If no data exists for this user, initialize with just the email
        setProfile({
          name: '',
          email: auth.currentUser?.email || '',
          phoneNumber: '',
          vehicleNumber: ''
        });
      }
    }, (error) => {
      console.error("Error fetching user data:", error);
      setError('Failed to load profile data. Please try again later.');
    });
    
    // Clean up the listener when component unmounts
    return () => unsubscribe();
  }, [userId]); // Depend only on userId, not userProfile

  // Initialize form data when entering edit mode
  useEffect(() => {
    if (userProfile) {
      // This effect now only initializes formData from userProfile prop
      // to avoid overriding real-time data from the Firebase listener
      setFormData(prev => ({
        ...prev,
        name: userProfile.name || '',
        email: userProfile.email || auth.currentUser?.email || '',
        phoneNumber: userProfile.phoneNumber || '',
        vehicleNumber: userProfile.vehicleNumber || '',
      }));
    }
  }, [userProfile]);

  const toggleEditMode = (field) => {
    // Reset any previous errors or success messages
    setError(null);
    setSuccess(null);
    
    // Toggle edit mode for the specified field
    setEditMode(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    
    // Initialize form data with current profile data
    setFormData(prev => ({
      ...prev,
      [field]: profile[field] || ''
    }));
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const cancelEdit = (field) => {
    setEditMode(prev => ({
      ...prev,
      [field]: false
    }));
    setError(null);
    setSuccess(null);
    setFormData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };
  
  const updateField = async (field) => {
    const currentUserId = auth.currentUser?.uid;
    const profileId = userId || currentUserId;
    
    if (!profileId) {
      setError('User ID is missing. Cannot update profile.');
      return;
    }

    // Verify that userId matches the authenticated user
    if (profileId !== auth.currentUser?.uid) {
      setError('You do not have permission to update this profile.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Use RTDB reference
      const userRef = ref(rtdb, `users/${profileId}`);
      
      // Validate input before proceeding
      if (field !== 'password' && !formData[field]) {
        setError(`${field.charAt(0).toUpperCase() + field.slice(1)} cannot be empty.`);
        setLoading(false);
        return;
      }

      // Special handling for email and password updates
      if (field === 'email') {
        // Email requires reauthentication
        if (!formData.currentPassword) {
          setError('Current password is required to update email.');
          setLoading(false);
          return;
        }
        
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          formData.currentPassword
        );
        
        // Reauthenticate
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // Update email in Firebase Auth
        await updateEmail(auth.currentUser, formData.email);

        // Update email in RTDB as well
        await update(userRef, { email: formData.email });
      } 
      else if (field === 'password') {
        // Password validation
        if (formData.newPassword !== formData.confirmPassword) {
          setError('New password and confirmation do not match.');
          setLoading(false);
          return;
        }
        
        if (formData.newPassword.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        
        if (!formData.currentPassword) {
          setError('Current password is required to update password.');
          setLoading(false);
          return;
        }
        
        // Reauthenticate
        const credential = EmailAuthProvider.credential(
          auth.currentUser.email,
          formData.currentPassword
        );
        
        await reauthenticateWithCredential(auth.currentUser, credential);
        
        // Update password in Firebase Auth
        await updatePassword(auth.currentUser, formData.newPassword);
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } 
      else {
        // Update other fields in RTDB
        await update(userRef, {
          [field]: formData[field]
        });
      }
      
      // Exit edit mode and show success message
      setEditMode(prev => ({
        ...prev,
        [field]: false
      }));
      
      setSuccess(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully.`);
      
      // Note: We don't need to fetch updated profile manually here anymore
      // because the onValue listener we set up will automatically update
      // the local state when the database changes
    } catch (err) {
      console.error(`Error updating ${field}:`, err);
      
      // Handle different error cases
      if (err.code === 'auth/requires-recent-login') {
        setError('Please log in again to update your email or password.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect current password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email is already in use by another account.');
      } else if (err.code === 'permission-denied') {
        setError('You do not have permission to update this profile. Please ensure you are updating your own profile or contact support.');
      } else {
        setError(`Failed to update ${field}. ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="user-profile">
      <div className="profile-header">
        <h1>User Profile</h1>
        <div className="profile-avatar">
          <User size={40} />
        </div>
      </div>
      
      {error && (
        <div className="profile-message error">
          <X size={20} />
          {error}
        </div>
      )}
      
      {success && (
        <div className="profile-message success">
          <CheckCircle size={20} />
          {success}
        </div>
      )}
      
      <div className="profile-sections">
        <div className="profile-section">
          <h2>Personal Information</h2>
          
          <div className="profile-field">
            <div className="field-header">
              <User size={18} />
              <h3>Name</h3>
              {!editMode.name && (
                <button 
                  className="edit-button"
                  onClick={() => toggleEditMode('name')}
                >
                  <Edit size={16} />
                  Edit
                </button>
              )}
            </div>
            
            {editMode.name ? (
              <div className="edit-field">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
                <div className="edit-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => cancelEdit('name')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-button"
                    onClick={() => updateField('name')}
                    disabled={loading || !formData.name}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="field-value">{profile.name || 'Not set'}</div>
            )}
          </div>
          
          <div className="profile-field">
            <div className="field-header">
              <Mail size={18} />
              <h3>Email</h3>
              {!editMode.email && (
                <button 
                  className="edit-button"
                  onClick={() => toggleEditMode('email')}
                >
                  <Edit size={16} />
                  Edit
                </button>
              )}
            </div>
            
            {editMode.email ? (
              <div className="edit-field">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Current password"
                  className="password-input"
                />
                <div className="edit-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => cancelEdit('email')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-button"
                    onClick={() => updateField('email')}
                    disabled={loading || !formData.email || !formData.currentPassword}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="field-value">{profile.email || auth.currentUser?.email || 'Not set'}</div>
            )}
          </div>
          
          <div className="profile-field">
            <div className="field-header">
              <Phone size={18} />
              <h3>Phone Number</h3>
              {!editMode.phoneNumber && (
                <button 
                  className="edit-button"
                  onClick={() => toggleEditMode('phoneNumber')}
                >
                  <Edit size={16} />
                  Edit
                </button>
              )}
            </div>
            
            {editMode.phoneNumber ? (
              <div className="edit-field">
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  pattern="[0-9]{10}"
                />
                <div className="edit-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => cancelEdit('phoneNumber')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-button"
                    onClick={() => updateField('phoneNumber')}
                    disabled={loading || !formData.phoneNumber}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="field-value">{profile.phoneNumber || 'Not set'}</div>
            )}
          </div>
        </div>
        
        <div className="profile-section">
          <h2>Vehicle Information</h2>
          
          <div className="profile-field">
            <div className="field-header">
              <Car size={18} />
              <h3>Vehicle Registration Number</h3>
              {!editMode.vehicleNumber && (
                <button 
                  className="edit-button"
                  onClick={() => toggleEditMode('vehicleNumber')}
                >
                  <Edit size={16} />
                  Edit
                </button>
              )}
            </div>
            
            {editMode.vehicleNumber ? (
              <div className="edit-field">
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                  placeholder="Enter your vehicle number"
                />
                <div className="edit-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => cancelEdit('vehicleNumber')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-button"
                    onClick={() => updateField('vehicleNumber')}
                    disabled={loading || !formData.vehicleNumber}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="field-value">{profile.vehicleNumber || 'Not set'}</div>
            )}
          </div>
        </div>
        
        <div className="profile-section">
          <h2>Security</h2>
          
          <div className="profile-field">
            <div className="field-header">
              <Lock size={18} />
              <h3>Password</h3>
              {!editMode.password && (
                <button 
                  className="edit-button"
                  onClick={() => toggleEditMode('password')}
                >
                  <Edit size={16} />
                  Change
                </button>
              )}
            </div>
            
            {editMode.password ? (
              <div className="edit-field">
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Current password"
                  className="password-input"
                />
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="New password (min 6 characters)"
                  className="password-input"
                />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="password-input"
                />
                <div className="edit-actions">
                  <button 
                    className="cancel-button"
                    onClick={() => cancelEdit('password')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button 
                    className="save-button"
                    onClick={() => updateField('password')}
                    disabled={
                      loading || 
                      !formData.currentPassword || 
                      !formData.newPassword || 
                      !formData.confirmPassword
                    }
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="field-value">••••••••</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;