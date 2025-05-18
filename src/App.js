


// import React, { useState, useEffect } from 'react';
// import AdminLogin from './components/AdminLogin';
// import AdminDashboard from './components/AdminDashboard';
// import { auth, db } from './firebase';
// import { onAuthStateChanged } from 'firebase/auth';
// import { doc, getDoc, collection, query, onSnapshot } from 'firebase/firestore';

// const App = () => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [allBookings, setAllBookings] = useState([]); // State to store all bookings

//   // Fetch all bookings for all users
//   useEffect(() => {
//     const fetchAllBookings = () => {
//       // Since bookings are stored under each user's subcollection, we first need to get all users
//       const usersRef = collection(db, 'users');
//       const unsubscribe = onSnapshot(usersRef, (usersSnapshot) => {
//         const bookingsPromises = [];
//         usersSnapshot.forEach((userDoc) => {
//           const userId = userDoc.id;
//           const bookingsRef = collection(db, 'users', userId, 'bookings');
//           const bookingsQuery = query(bookingsRef);
//           // Create a promise to fetch bookings for this user
//           bookingsPromises.push(
//             new Promise((resolve) => {
//               onSnapshot(bookingsQuery, (bookingsSnapshot) => {
//                 const userBookings = [];
//                 bookingsSnapshot.forEach((bookingDoc) => {
//                   userBookings.push({
//                     id: bookingDoc.id,
//                     userId: userId,
//                     ...bookingDoc.data(),
//                     bookingTime: bookingDoc.data().bookingTime
//                       ? new Date(bookingDoc.data().bookingTime)
//                       : null,
//                     startTime: bookingDoc.data().startTime
//                       ? new Date(bookingDoc.data().startTime)
//                       : null,
//                     endTime: bookingDoc.data().endTime
//                       ? new Date(bookingDoc.data().endTime)
//                       : null,
//                   });
//                 });
//                 resolve(userBookings);
//               });
//             })
//           );
//         });

//         // Wait for all bookings to be fetched
//         Promise.all(bookingsPromises).then((allBookingsArrays) => {
//           // Flatten the array of arrays into a single array
//           const flattenedBookings = allBookingsArrays.flat();
//           // Sort by bookingTime (newest first)
//           flattenedBookings.sort((a, b) => {
//             const timeA = a.bookingTime ? a.bookingTime.getTime() : 0;
//             const timeB = b.bookingTime ? b.bookingTime.getTime() : 0;
//             return timeB - timeA;
//           });
//           console.log('App (Admin): Fetched all bookings:', flattenedBookings);
//           setAllBookings(flattenedBookings);
//         });
//       });

//       return unsubscribe;
//     };

//     fetchAllBookings();
//   }, []);

//   // Listen for authentication state changes
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         try {
//           const userDoc = await getDoc(doc(db, 'users', user.uid));
          
//           if (userDoc.exists() && userDoc.data().role === 'admin') {
//             setIsAuthenticated(true);
//             setCurrentUser({
//               uid: user.uid,
//               email: user.email,
//               ...userDoc.data()
//             });
//           } else {
//             setIsAuthenticated(false);
//             setCurrentUser(null);
//           }
//         } catch (error) {
//           console.error('Error fetching user data:', error);
//           setIsAuthenticated(false);
//           setCurrentUser(null);
//         }
//       } else {
//         setIsAuthenticated(false);
//         setCurrentUser(null);
//       }
//       setLoading(false);
//     });
    
//     return () => unsubscribe();
//   }, []);

//   const handleLogin = (user) => {
//     setIsAuthenticated(true);
//     setCurrentUser(user);
//   };

//   const handleLogout = () => {
//     setIsAuthenticated(false);
//     setCurrentUser(null);
//   };

//   if (loading) {
//     return (
//       <div className="app-loading">
//         <div className="loading-spinner"></div>
//         <p>Loading application...</p>
//       </div>
//     );
//   }

//   return isAuthenticated ? (
//     <AdminDashboard
//       currentUser={currentUser}
//       onLogout={handleLogout}
//       allBookings={allBookings} // Pass allBookings to AdminDashboard
//     />
//   ) : (
//     <AdminLogin onLoginSuccess={handleLogin} />
//   );
// };

// export default App;


import React, { useState, useEffect } from 'react';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, onSnapshot } from 'firebase/firestore';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allBookings, setAllBookings] = useState([]); // State to store all bookings

  // Fetch all bookings for all users
  useEffect(() => {
    if (!isAuthenticated) return; // Only fetch bookings when authenticated
    
    const fetchAllBookings = () => {
      // Since bookings are stored under each user's subcollection, we first need to get all users
      const usersRef = collection(db, 'users');
      const unsubscribe = onSnapshot(usersRef, (usersSnapshot) => {
        const bookingsPromises = [];
        usersSnapshot.forEach((userDoc) => {
          const userId = userDoc.id;
          const bookingsRef = collection(db, 'users', userId, 'bookings');
          const bookingsQuery = query(bookingsRef);
          // Create a promise to fetch bookings for this user
          bookingsPromises.push(
            new Promise((resolve) => {
              onSnapshot(bookingsQuery, (bookingsSnapshot) => {
                const userBookings = [];
                bookingsSnapshot.forEach((bookingDoc) => {
                  userBookings.push({
                    id: bookingDoc.id,
                    userId: userId,
                    ...bookingDoc.data(),
                    bookingTime: bookingDoc.data().bookingTime
                      ? new Date(bookingDoc.data().bookingTime)
                      : null,
                    startTime: bookingDoc.data().startTime
                      ? new Date(bookingDoc.data().startTime)
                      : null,
                    endTime: bookingDoc.data().endTime
                      ? new Date(bookingDoc.data().endTime)
                      : null,
                  });
                });
                resolve(userBookings);
              });
            })
          );
        });

        // Wait for all bookings to be fetched
        Promise.all(bookingsPromises).then((allBookingsArrays) => {
          // Flatten the array of arrays into a single array
          const flattenedBookings = allBookingsArrays.flat();
          // Sort by bookingTime (newest first)
          flattenedBookings.sort((a, b) => {
            const timeA = a.bookingTime ? a.bookingTime.getTime() : 0;
            const timeB = b.bookingTime ? b.bookingTime.getTime() : 0;
            return timeB - timeA;
          });
          console.log('App (Admin): Fetched all bookings:', flattenedBookings);
          setAllBookings(flattenedBookings);
        });
      });

      return unsubscribe;
    };

    const unsubscribe = fetchAllBookings();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthenticated]);

  // Listen for authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAuthenticated(true);
            setCurrentUser({
              uid: user.uid,
              email: user.email,
              ...userDoc.data()
            });
          } else {
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const handleLogin = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading application...</p>
      </div>
    );
  }

  return isAuthenticated ? (
    <AdminDashboard
      currentUser={currentUser}
      onLogout={handleLogout}
      allBookings={allBookings} // Pass allBookings to AdminDashboard
    />
  ) : (
    <AdminLogin onLoginSuccess={handleLogin} />
  );
};

export default App;