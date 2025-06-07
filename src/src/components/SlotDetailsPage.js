




// import React, { useState, useEffect, useRef } from 'react';
// import { ArrowLeft, AlertCircle } from 'lucide-react';
// import { auth, rtdb } from '../firebase';
// import { ref, push, update, serverTimestamp, onValue, get, set } from 'firebase/database';
// import '../styles/SlotDetails.css';
// import Script from 'react-load-script';

// const SlotDetailsPage = ({ lot, onReturn }) => {
//   const [selectedDuration, setSelectedDuration] = useState('');
//   const [timeRemaining, setTimeRemaining] = useState(15 * 60);
//   const [bookingComplete, setBookingComplete] = useState(false);
//   const [selectedSpaceIndex, setSelectedSpaceIndex] = useState(null);
//   const [amount, setAmount] = useState(0);
//   const [showSummary, setShowSummary] = useState(false);
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
//   const [selectedDateTime, setSelectedDateTime] = useState('');
//   const [bookingError, setBookingError] = useState('');
//   const [bookingId, setBookingId] = useState('');
//   const [showSlotDetails, setShowSlotDetails] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [activeBookings, setActiveBookings] = useState([]);
//   const [isParkingAvailable, setIsParkingAvailable] = useState(true);

//   // Handle case where lot is undefined
//   const parkingSpacesKey = lot && lot.id ? `parkingSpaces-${lot.id}` : 'parkingSpaces-default';
//   const [parkingSpaces, setParkingSpaces] = useState([]);

//   // Get parking system status
//   const [parkingEnabled, setParkingEnabled] = useState(true);
  
//   // Fetch all active bookings to prevent double booking - only for the current lot
//   useEffect(() => {
//     if (!lot || !lot.id) return;
    
//     const bookingsRef = ref(rtdb, 'bookings');
//     const activeBookingsUnsubscribe = onValue(bookingsRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const activeBookingsList = [];
//         snapshot.forEach((childSnapshot) => {
//           const booking = childSnapshot.val();
//           // Only include active and confirmed bookings for this specific lot
//           if ((booking.status === 'active' || booking.status === 'confirmed') && 
//               booking.lotId === lot.id) {
//             activeBookingsList.push({
//               ...booking,
//               id: childSnapshot.key,
//               startTime: booking.startTime ? new Date(booking.startTime) : null,
//               endTime: booking.endTime ? new Date(booking.endTime) : null
//             });
//           }
//         });
//         setActiveBookings(activeBookingsList);
//       }
//     });

//     return () => activeBookingsUnsubscribe();
//   }, [lot]);
  
//   useEffect(() => {
//     // Check if parking system is enabled
//     const parkingEnabledRef = ref(rtdb, 'parking_enabled');
//     const parkingStatusUnsubscribe = onValue(parkingEnabledRef, (snapshot) => {
//       if (snapshot.exists()) {
//         setParkingEnabled(snapshot.val());
//       }
//     });
    
//     return () => parkingStatusUnsubscribe();
//   }, []);

//   // Initialize the database properly if needed
//   useEffect(() => {
//     if (!lot || !lot.id) return;
    
//     const initializeOccupiedSlots = async () => {
//       const occupiedSlotsRef = ref(rtdb, `occupiedSlots/${lot.id}`);
//       const snapshot = await get(occupiedSlotsRef);
      
//       if (!snapshot.exists()) {
//         // Initialize with empty array if it doesn't exist
//         await set(occupiedSlotsRef, JSON.stringify([]));
//       }
//     };
    
//     initializeOccupiedSlots();
//   }, [lot]);

//   // Fetch occupied slots for this specific lot
//   useEffect(() => {
//     if (!lot || !lot.id) return;
    
//     const occupiedSlotsRef = ref(rtdb, `occupiedSlots/${lot.id}`);
//     const occupiedSlotsUnsubscribe = onValue(occupiedSlotsRef, (snapshot) => {
//       if (snapshot.exists()) {
//         try {
//           // Parse the occupied slots
//           const slotsData = snapshot.val();
//           const occupiedSlotsList = Array.isArray(slotsData) ? 
//             slotsData : 
//             typeof slotsData === 'string' ? 
//               JSON.parse(slotsData) : 
//               [];
          
//           // Update the parking spaces with the occupied slots
//           setParkingSpaces(prevSpaces => {
//             if (!prevSpaces || prevSpaces.length === 0) return prevSpaces;
            
//             const updatedSpaces = [...prevSpaces];
//             return updatedSpaces.map(space => ({
//               ...space,
//               occupied: occupiedSlotsList.includes(space.id) || 
//                         activeBookings.some(b => parseInt(b.spaceId) === space.id)
//             }));
//           });
//         } catch (error) {
//           console.error("Error parsing occupied slots:", error);
//         }
//       }
//     });

//     return () => occupiedSlotsUnsubscribe();
//   }, [lot, activeBookings]);

//   useEffect(() => {
//     // If lot is undefined, show an error message and return
//     if (!lot || !lot.id) {
//       setBookingError('Parking lot data is unavailable. Please try again later.');
//       return;
//     }

//     // Check if this lot exists in Firebase, if not, initialize it
//     const lotRef = ref(rtdb, `parkingSpaces/${lot.id}`);
//     get(lotRef).then(snapshot => {
//       if (!snapshot.exists()) {
//         // Initialize this lot with 3 available spaces
//         const defaultSpaces = {};
//         for (let i = 1; i <= 3; i++) {
//           defaultSpaces[`space${i}`] = {
//             id: i,
//             row: 1,
//             column: i,
//             occupied: false,
//             bookings: []
//           };
//         }
        
//         set(ref(rtdb, `parkingSpaces/${lot.id}/spaces`), defaultSpaces)
//           .then(() => console.log(`Initialized lot ${lot.id} with default spaces`))
//           .catch(err => console.error(`Error initializing lot ${lot.id}:`, err));
//       }
//     });

//     const spacesRef = ref(rtdb, `parkingSpaces/${lot.id}/spaces`);
//     const unsubscribe = onValue(spacesRef, (snapshot) => {
//       if (snapshot.exists()) {
//         const spacesData = snapshot.val();
//         console.log('SlotDetailsPage: Fetched spaces from database:', spacesData);
        
//         // Only use the first 3 spaces
//         const spacesArray = Object.keys(spacesData)
//           .filter(key => {
//             const spaceId = spacesData[key].id;
//             return spaceId <= 3; // Only include spaces 1, 2, and 3
//           })
//           .map(key => {
//             const spaceId = spacesData[key].id;
            
//             // Check if this space has an active booking
//             const hasActiveBooking = activeBookings.some(booking => 
//               parseInt(booking.spaceId) === spaceId
//             );
            
//             return {
//               id: spaceId,
//               row: spacesData[key].row || Math.ceil(spaceId / 3),
//               column: spacesData[key].column || ((spaceId - 1) % 3) + 1,
//               // A space is occupied if marked as such OR has an active booking
//               occupied: spacesData[key].occupied || hasActiveBooking,
//               bookings: spacesData[key].bookings || []
//             };
//           });
          
//         // Ensure we have exactly 3 spaces
//         const filledSpaces = ensureThreeSpaces(spacesArray);
//         console.log('SlotDetailsPage: Processed spaces array:', filledSpaces);
        
//         // Check if there are any available spaces
//         const anyAvailable = filledSpaces.some(space => !space.occupied);
//         setIsParkingAvailable(anyAvailable);
        
//         setParkingSpaces(filledSpaces);
//         localStorage.setItem(parkingSpacesKey, JSON.stringify(filledSpaces));
//       } else {
//         console.log('SlotDetailsPage: No spaces found in database, initializing 3 spaces');
//         // If no data in database, initialize it with 3 spaces
//         const defaultSpaces = Array.from({ length: 3 }, (_, i) => ({
//           id: i + 1,
//           row: 1,
//           column: i + 1,
//           occupied: false,
//           bookings: []
//         }));

//         // Write the default spaces to the database
//         const spacesObject = defaultSpaces.reduce((acc, space) => {
//           acc[`space${space.id}`] = space;
//           return acc;
//         }, {});
        
//         set(spacesRef, spacesObject)
//           .then(() => {
//             console.log('SlotDetailsPage: Initialized database with 3 spaces:', spacesObject);
//             setParkingSpaces(defaultSpaces);
//             localStorage.setItem(parkingSpacesKey, JSON.stringify(defaultSpaces));
//           })
//           .catch((error) => {
//             console.error('SlotDetailsPage: Error initializing spaces in database:', error);
//             setBookingError('Failed to initialize parking spaces. Please try again later.');
            
//             // Fallback to localStorage or default if database write fails
//             const savedSpaces = localStorage.getItem(parkingSpacesKey);
//             if (savedSpaces) {
//               const parsedSpaces = JSON.parse(savedSpaces);
//               const filledSpaces = ensureThreeSpaces(parsedSpaces);
//               console.log('SlotDetailsPage: Using localStorage spaces:', filledSpaces);
//               setParkingSpaces(filledSpaces);
//             } else {
//               console.log('SlotDetailsPage: Using default spaces:', defaultSpaces);
//               setParkingSpaces(defaultSpaces);
//               localStorage.setItem(parkingSpacesKey, JSON.stringify(defaultSpaces));
//             }
//           });
//       }
//     }, (error) => {
//       console.error('SlotDetailsPage: Error fetching spaces:', error);
//       setBookingError('Failed to load parking spaces. Please try again later.');
      
//       // Fallback to localStorage or default on error
//       const savedSpaces = localStorage.getItem(parkingSpacesKey);
//       if (savedSpaces) {
//         const parsedSpaces = JSON.parse(savedSpaces);
//         const filledSpaces = ensureThreeSpaces(parsedSpaces);
//         console.log('SlotDetailsPage: Using localStorage spaces on error:', filledSpaces);
//         setParkingSpaces(filledSpaces);
//       } else {
//         const defaultSpaces = Array.from({ length: 3 }, (_, i) => ({
//           id: i + 1,
//           row: 1,
//           column: i + 1,
//           occupied: false,
//           bookings: []
//         }));
//         console.log('SlotDetailsPage: Using default spaces on error:', defaultSpaces);
//         setParkingSpaces(defaultSpaces);
//         localStorage.setItem(parkingSpacesKey, JSON.stringify(defaultSpaces));
//       }
//     });

//     return () => unsubscribe();
//   }, [lot, parkingSpacesKey, activeBookings]);

//   // Helper function to ensure we always have 3 spaces
//   const ensureThreeSpaces = (spacesArray) => {
//     if (spacesArray.length >= 3) return spacesArray.slice(0, 3);

//     const existingIds = spacesArray.map(space => space.id);
//     const filledSpaces = [...spacesArray];
//     for (let i = 1; i <= 3; i++) {
//       if (!existingIds.includes(i)) {
//         filledSpaces.push({
//           id: i,
//           row: 1,
//           column: i,
//           occupied: false,
//           bookings: []
//         });
//       }
//     }
//     filledSpaces.sort((a, b) => a.id - b.id);
//     return filledSpaces.slice(0, 3);
//   };

//   const availableDurations = [
//     { name: '1 Hour', price: 50, hours: 1 },
//     { name: '2 Hours', price: 80, hours: 2 },
//     { name: '3 Hours', price: 100, hours: 3 },
//     { name: '4 Hours', price: 120, hours: 4 },
//     { name: '6 Hours', price: 150, hours: 6 },
//     { name: '8 Hours', price: 180, hours: 8 },
//     { name: '12 Hours', price: 250, hours: 12 },
//     { name: 'Full Day', price: 300, hours: 24 },
//   ];

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeRemaining((prevTime) => {
//         if (prevTime <= 1) {
//           clearInterval(timer);
//           if (!bookingComplete) {
//             onReturn();
//           }
//           return 0;
//         }
//         return prevTime - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [onReturn, bookingComplete]);

//   const formatTime = (seconds) => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
//   };

//   const isSlotBooked = (space, startTime, durationHours) => {
//     // Check if the slot is already occupied in the system
//     if (space.occupied) {
//       return true;
//     }

//     // Check for overlapping bookings
//     const start = new Date(startTime);
//     const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

//     // Check for any active bookings for this space
//     const hasActiveBooking = activeBookings.some(booking => {
//       // Check if this booking is for the same space
//       if (parseInt(booking.spaceId) === space.id) {
//         const bookingStart = booking.startTime;
//         const bookingEnd = booking.endTime;
        
//         // Check for time overlap
//         return (
//           (start >= bookingStart && start < bookingEnd) ||
//           (end > bookingStart && end <= bookingEnd) ||
//           (start <= bookingStart && end >= bookingEnd)
//         );
//       }
//       return false;
//     });

//     // Also check space's own booking records
//     const hasBookingRecord = space.bookings && space.bookings.some((booking) => {
//       // Skip cancelled bookings
//       if (booking.status === 'cancelled' || booking.status === 'completed') {
//         return false;
//       }
      
//       const bookingStart = new Date(booking.startTime);
//       const bookingEnd = new Date(booking.endTime);
      
//       return (
//         (start >= bookingStart && start < bookingEnd) ||
//         (end > bookingStart && end <= bookingEnd) ||
//         (start <= bookingStart && end >= bookingEnd)
//       );
//     });

//     return hasActiveBooking || hasBookingRecord;
//   };

//   const handleSpaceSelect = (index) => {
//     if (!parkingEnabled) {
//       setBookingError('Parking system is currently disabled by the administrator.');
//       return;
//     }
    
//     if (!selectedDateTime || !selectedDuration) {
//       setBookingError('Please select date, time, and duration first');
//       return;
//     }

//     if (parkingSpaces[index].occupied) {
//       setBookingError('This slot is already occupied. Please select another slot.');
//       return;
//     }

//     const selectedDurationObj = availableDurations.find(
//       (d) => d.name === selectedDuration
//     );

//     if (
//       isSlotBooked(
//         parkingSpaces[index],
//         selectedDateTime,
//         selectedDurationObj.hours
//       )
//     ) {
//       setBookingError('This slot is already booked for the selected time');
//       setSelectedSpaceIndex(null);
//       return;
//     }

//     setBookingError('');
//     setSelectedSpaceIndex(index);
//   };

//   const generateBookingId = () => {
//     return `PK-${Math.floor(Math.random() * 1000000)
//       .toString()
//       .padStart(6, '0')}`;
//   };

//   const handleDurationSelect = (duration) => {
//     setSelectedDuration(duration.name);
//     setAmount(duration.price);
//   };

//   const setPaymentMethod = (method) => {
//     setSelectedPaymentMethod(method);
//   };

//   const showBookingSummary = () => {
//     if (!parkingEnabled) {
//       setBookingError('Parking system is currently disabled by the administrator.');
//       return;
//     }
    
//     if (selectedDuration && selectedSpaceIndex !== null && selectedDateTime) {
//       setShowSummary(true);
//     }
//   };

//   const initiateRazorpayPayment = () => {
//     const newBookingId = bookingId || generateBookingId();
//     setBookingId(newBookingId);

//     const options = {
//       key: 'rzp_test_YOUR_RAZORPAY_KEY',
//       amount: amount * 100,
//       currency: 'INR',
//       name: 'Parking Booking',
//       description: `Parking slot booking for ${selectedDuration}`,
//       image: 'https://your-logo-url.com/logo.png',
//       handler: function (response) {
//         completeBookingProcess(response.razorpay_payment_id);
//       },
//       prefill: {
//         name: 'John Doe',
//         email: 'john.doe@example.com',
//         contact: '9999999999',
//       },
//       notes: {
//         booking_id: newBookingId,
//         slot_id: parkingSpaces[selectedSpaceIndex].id,
//       },
//       theme: {
//         color: '#3399cc',
//       },
//     };

//     const rzp = new window.Razorpay(options);
//     rzp.open();
//   };

//   const confirmBooking = () => {
//     if (!parkingEnabled) {
//       setBookingError('Parking system is currently disabled by the administrator.');
//       return;
//     }
    
//     if (selectedDuration && selectedSpaceIndex !== null && selectedDateTime) {
//       setLoading(true);
//       setBookingError('');
      
//       try {
//         // Check one more time if the slot is still available
//         if (
//           isSlotBooked(
//             parkingSpaces[selectedSpaceIndex],
//             selectedDateTime,
//             availableDurations.find(d => d.name === selectedDuration).hours
//           )
//         ) {
//           setBookingError('This slot has just been booked by someone else. Please choose another slot.');
//           setLoading(false);
//           return;
//         }
        
//         const updatedSpaces = [...parkingSpaces];
//         updatedSpaces[selectedSpaceIndex] = {
//           ...updatedSpaces[selectedSpaceIndex],
//           occupied: true,
//         };
//         setParkingSpaces(updatedSpaces);
//         localStorage.setItem(parkingSpacesKey, JSON.stringify(updatedSpaces));
        
//         if (selectedPaymentMethod === 'razorpay') {
//           initiateRazorpayPayment();
//         } else {
//           completeBookingProcess();
//         }
//       } catch (error) {
//         console.error("SlotDetailsPage: Error in confirmBooking:", error);
//         setBookingError("Failed to confirm booking. Please try again.");
//         setLoading(false);
//       }
//     }
//   };

//   const completeBookingProcess = async (paymentId = null) => {
//     try {
//       const selectedDurationObj = availableDurations.find(
//         (d) => d.name === selectedDuration
//       );
      
//       if (!selectedDurationObj) {
//         throw new Error("Selected duration not found");
//       }
      
//       const startTime = new Date(selectedDateTime);
//       const endTime = new Date(
//         startTime.getTime() + selectedDurationObj.hours * 60 * 60 * 1000
//       );

//       const newBookingId = bookingId || generateBookingId();
//       setBookingId(newBookingId);

//       const updatedSpaces = [...parkingSpaces];
//       updatedSpaces[selectedSpaceIndex] = {
//         ...updatedSpaces[selectedSpaceIndex],
//         occupied: true,
//         bookings: [
//           ...(updatedSpaces[selectedSpaceIndex].bookings || []),
//           {
//             startTime: startTime.toISOString(),
//             endTime: endTime.toISOString(),
//             duration: selectedDuration,
//             bookingId: newBookingId,
//             spaceId: parkingSpaces[selectedSpaceIndex].id,
//             status: 'active'
//           },
//         ],
//       };

//       setParkingSpaces(updatedSpaces);
//       localStorage.setItem(parkingSpacesKey, JSON.stringify(updatedSpaces));

//       const userId = auth.currentUser?.uid || 'anonymous';
//       const userName = auth.currentUser?.displayName || 'User';
      
//       const bookingData = {
//         userId,
//         userName,
//         lotId: lot?.id || 'lot1',
//         lotName: lot?.name || 'Kengeri Parking',
//         location: lot?.location || 'A\' road, 1st Main Rd, next to Platform No. 4',
//         spaceId: parkingSpaces[selectedSpaceIndex].id,
//         spaceIndex: selectedSpaceIndex,
//         startTime: startTime.toISOString(),
//         endTime: endTime.toISOString(),
//         duration: selectedDuration,
//         amount: amount,
//         bookingId: newBookingId,
//         paymentId: paymentId,
//         paymentMethod: selectedPaymentMethod,
//         timestamp: serverTimestamp(),
//         status: 'active'
//       };

//       // Add to bookings collection
//       const bookingsRef = ref(rtdb, 'bookings');
//       const newBookingRef = await push(bookingsRef, bookingData);

//       // Update the parking space in the database
//       const spaceRef = ref(rtdb, `parkingSpaces/${lot.id}/spaces/space${parkingSpaces[selectedSpaceIndex].id}`);
//       await update(spaceRef, {
//         occupied: true,
//         bookings: updatedSpaces[selectedSpaceIndex].bookings
//       });

//       // Update the occupied slots for this specific lot
//       const occupiedSlotsRef = ref(rtdb, `occupiedSlots/${lot.id}`);
//       const occupiedSlotsSnapshot = await get(occupiedSlotsRef);
      
//       if (occupiedSlotsSnapshot.exists()) {
//         try {
//           const slotsData = occupiedSlotsSnapshot.val();
//           let occupiedSlots = Array.isArray(slotsData) ? 
//             slotsData : 
//             typeof slotsData === 'string' ? 
//               JSON.parse(slotsData) : 
//               [];
          
//           // Add this slot to occupied slots if not already there
//           if (!occupiedSlots.includes(parkingSpaces[selectedSpaceIndex].id)) {
//             occupiedSlots.push(parkingSpaces[selectedSpaceIndex].id);
//             await set(occupiedSlotsRef, JSON.stringify(occupiedSlots));
//           }
//         } catch (error) {
//           console.error("Error updating occupied slots:", error);
//         }
//       } else {
//         // Initialize with this slot
//         await set(occupiedSlotsRef, JSON.stringify([parkingSpaces[selectedSpaceIndex].id]));
//       }

//       // Update parking status for this lot
//       const statusRef = ref(rtdb, `parkingStatus/${lot.id}`);
//       const statusSnapshot = await get(statusRef);
//       const currentStatus = statusSnapshot.exists() 
//         ? statusSnapshot.val() 
//         : { available: 3, occupied: 0, reserved: 0 };
      
//       await update(statusRef, {
//         available: Math.max(0, currentStatus.available - 1),
//         occupied: (currentStatus.occupied || 0) + 1,
//         reserved: currentStatus.reserved || 0
//       });

//       // Record activity
//       const activitiesRef = ref(rtdb, 'recentActivities');
//       await push(activitiesRef, {
//         user: userName,
//         userId: userId,
//         action: `booked Space #${parkingSpaces[selectedSpaceIndex].id} at ${lot?.name}`,
//         time: new Date().toLocaleString(),
//         timestamp: serverTimestamp()
//       });

//       setBookingComplete(true);
//       setShowSummary(false);
//       setShowSlotDetails(true);
//     } catch (error) {
//       console.error("SlotDetailsPage: Error completing booking:", error);
//       setBookingError("Failed to complete booking: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getCurrentDateTime = () => {
//     const date = new Date(selectedDateTime || Date.now());
//     return date.toLocaleString('en-US', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//     });
//   };

//   // If lot is undefined, show an error message
//   if (!lot) {
//     return (
//       <div className="slot-details-page">
//         <div className="slot-details-header">
//           <button className="back-button" onClick={onReturn}>
//             <ArrowLeft size={18} />
//             Back to Dashboard
//           </button>
//           <h1>Parking Slots</h1>
//         </div>
//         <div className="booking-error-alert">
//           <AlertCircle size={20} />
//           <p>Parking lot data is unavailable. Please try again later.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="slot-details-page">
//       <Script url="https://checkout.razorpay.com/v1/checkout.js" />

//       <div className="slot-details-header">
//         <button className="back-button" onClick={onReturn}>
//           <ArrowLeft size={18} />
//           Back to Dashboard
//         </button>
//         <h1>{lot?.name || 'Parking Slots'}</h1>
//       </div>
      
//       {!parkingEnabled && (
//         <div className="booking-error-alert">
//           <AlertCircle size={20} />
//           <p>Parking system is currently disabled by the administrator.</p>
//         </div>
//       )}
      
//       {!isParkingAvailable && (
//         <div className="booking-error-alert">
//           <AlertCircle size={20} />
//           <p>All parking slots are currently occupied. Please check back later.</p>
//         </div>
//       )}

//       {!bookingComplete && (
//         <div className="booking-timer-alert">
//           <AlertCircle size={20} />
//           <p>
//             You have{' '}
//             <span className="countdown">{formatTime(timeRemaining)}</span> to
//             complete your booking
//           </p>
//         </div>
//       )}

//       {bookingError && (
//         <div className="booking-error-alert">
//           <AlertCircle size={20} />
//           <p>{bookingError}</p>
//         </div>
//       )}

//       <div className="slot-details-info">
//         <p>
//           <strong>Location:</strong> {lot?.location || 'Not available'}
//         </p>
//         <p>
//           <strong>Available Hours:</strong> {lot?.availableTimings || 'Not available'}
//         </p>
//         <p>
//           <strong>Status:</strong> {parkingEnabled ? 'Open' : 'Closed'} - {lot?.realTimeStatus || 'Not available'}
//         </p>
//       </div>

//       {bookingComplete && showSlotDetails ? (
//         <div className="booking-confirmation">
//           <h2>Booking Successful!</h2>
//           <p>Your parking slot has been booked successfully.</p>

//           <div className="booking-details">
//             <h3>Booking Summary</h3>
//             <div className="summary-item">
//               <span>Slot Name:</span>
//               <span>
//                 Space #{parkingSpaces[selectedSpaceIndex]?.id || 'N/A'}, {lot?.name || 'Parking Lot'}
//               </span>
//             </div>
//             <div className="summary-item">
//               <span>Timing:</span>
//               <span>
//                 {selectedDuration} (from {getCurrentDateTime()})
//               </span>
//             </div>
//             <div className="summary-item">
//               <span>Amount:</span>
//               <span>₹{amount}</span>
//             </div>
//             <div className="summary-item">
//               <span>Status:</span>
//               <span className="success-status">Confirmed</span>
//             </div>
//             {selectedPaymentMethod === 'razorpay' && (
//               <div className="summary-item">
//                 <span>Payment ID:</span>
//                 <span>RZP-{Math.random().toString(36).substr(2, 9)}</span>
//               </div>
//             )}
//             <div className="summary-item">
//               <span>Booking ID:</span>
//               <span>{bookingId}</span>
//             </div>
//           </div>

//           <div className="qr-code-placeholder">
//             <p>Booking ID: {bookingId}</p>
//           </div>

//           <button className="return-btn" onClick={onReturn}>
//             Return to Dashboard
//           </button>
//         </div>
//       ) : showSummary ? (
//         <div className="booking-summary">
//           <h2>Booking Summary</h2>
//           <div className="summary-content">
//             <div className="summary-item">
//               <span>Slot Name:</span>
//               <span>
//                 Space #{parkingSpaces[selectedSpaceIndex]?.id || 'N/A'}, {lot?.name || 'Parking Lot'}
//               </span>
//             </div>
//             <div className="summary-item">
//               <span>Timing:</span>
//               <span>
//                 {selectedDuration} (from {getCurrentDateTime()})
//               </span>
//             </div>
//             <div className="summary-item">
//               <span>Amount:</span>
//               <span>₹{amount}</span>
//             </div>
//           </div>

//           <div className="summary-actions">
//             <button
//               className="back-btn"
//               onClick={() => {
//                 setShowSummary(false);
//                 setLoading(false);
//               }}
//               disabled={loading}
//             >
//               Back
//             </button>
//             <button 
//               className="confirm-btn" 
//               onClick={confirmBooking}
//               disabled={loading || !parkingEnabled}
//             >
//               {loading ? 'Processing...' : `Confirm ₹${amount}`}
//             </button>
//           </div>
//         </div>
//       ) : (
//         <>
//           <div className="time-slot-selection">
//             <h2>Select Date and Time</h2>
//             <input
//               type="datetime-local"
//               value={selectedDateTime}
//               onChange={(e) => setSelectedDateTime(e.target.value)}
//               min={new Date().toISOString().slice(0, 16)}
//               className="datetime-picker"
//               disabled={!parkingEnabled}
//             />

//             <h2>Select Parking Duration</h2>
//             <div className="time-slots-container">
//               {availableDurations.map((duration, index) => (
//                 <button
//                   key={index}
//                   className={`time-slot-btn ${
//                     selectedDuration === duration.name ? 'selected' : ''
//                   }`}
//                   onClick={() => handleDurationSelect(duration)}
//                   disabled={!parkingEnabled}
//                 >
//                   {duration.name} - ₹{duration.price}
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="parking-spaces-container">
//             <h2>Select a Parking Space</h2>
//             <div className="parking-grid parking-grid-3">
//               {parkingSpaces.map((space, index) => (
//                 <div
//                   key={space.id}
//                   className={`parking-space ${
//                     space.occupied ? 'occupied' : 'available'
//                   } ${selectedSpaceIndex === index ? 'selected' : ''}`}
//                   onClick={() => !space.occupied && parkingEnabled && handleSpaceSelect(index)}
//                   style={{ 
//                     cursor: (!parkingEnabled || space.occupied) ? 'not-allowed' : 'pointer',
//                     opacity: !parkingEnabled ? '0.7' : '1'
//                   }}
//                 >
//                   <span>{space.id}</span>
//                 </div>
//               ))}
//             </div>
//             <div className="space-legend">
//               <div className="legend-item">
//                 <div className="legend-color available"></div>
//                 <span>Available</span>
//               </div>
//               <div className="legend-item">
//                 <div className="legend-color occupied"></div>
//                 <span>Occupied</span>
//               </div>
//               <div className="legend-item">
//                 <div className="legend-color selected"></div>
//                 <span>Selected</span>
//               </div>
//             </div>
//           </div>

//           <div className="booking-actions">
//             <button
//               className="confirm-btn"
//               disabled={
//                 !selectedDuration ||
//                 selectedSpaceIndex === null ||
//                 !selectedDateTime ||
//                 loading ||
//                 !parkingEnabled
//               }
//               onClick={showBookingSummary}
//             >
//               Continue to Book
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default SlotDetailsPage;




import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { auth, rtdb } from '../firebase';
import { ref, push, update, serverTimestamp, onValue, get, set, remove } from 'firebase/database';
import '../styles/SlotDetails.css';
import Script from 'react-load-script';

const SlotDetailsPage = ({ lot, onReturn }) => {
  const [selectedDuration, setSelectedDuration] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(15 * 60);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [selectedSpaceIndex, setSelectedSpaceIndex] = useState(null);
  const [amount, setAmount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [selectedDateTime, setSelectedDateTime] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [showSlotDetails, setShowSlotDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeBookings, setActiveBookings] = useState([]);
  const [isParkingAvailable, setIsParkingAvailable] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  // Handle case where lot is undefined
  const parkingSpacesKey = lot && lot.id ? `parkingSpaces-${lot.id}` : 'parkingSpaces-default';
  const [parkingSpaces, setParkingSpaces] = useState([]);

  // Get parking system status
  const [parkingEnabled, setParkingEnabled] = useState(true);
  
  // Listen for recent activities changes - if they're cleared, reset slots
  useEffect(() => {
    const activitiesRef = ref(rtdb, 'recentActivities');
    const activitiesUnsubscribe = onValue(activitiesRef, (snapshot) => {
      if (snapshot.exists()) {
        const activitiesList = [];
        snapshot.forEach((childSnapshot) => {
          const activity = childSnapshot.val();
          activitiesList.push({
            id: childSnapshot.key,
            ...activity
          });
        });
        
        // Check if activities were significantly reduced (indicating a reset/clear)
        const previousCount = recentActivities.length;
        const currentCount = activitiesList.length;
        
        // If activities were cleared (went from having activities to 0 or very few)
        if (previousCount > 5 && currentCount === 0) {
          console.log('Recent activities cleared - resetting all parking slots');
          resetAllParkingSlots();
        }
        
        setRecentActivities(activitiesList);
      } else {
        // Activities collection doesn't exist or is empty
        if (recentActivities.length > 0) {
          console.log('Recent activities removed - resetting all parking slots');
          resetAllParkingSlots();
        }
        setRecentActivities([]);
      }
    });
    
    return () => activitiesUnsubscribe();
  }, [recentActivities.length, lot]);
  
  // Function to reset all parking slots when activities are cleared
  const resetAllParkingSlots = async () => {
    if (!lot || !lot.id) return;
    
    try {
      console.log('Resetting parking slots for lot:', lot.id);
      
      // Reset occupied slots for this lot
      const occupiedSlotsRef = ref(rtdb, `occupiedSlots/${lot.id}`);
      await set(occupiedSlotsRef, JSON.stringify([]));
      
      // Reset all parking spaces to available
      const spacesRef = ref(rtdb, `parkingSpaces/${lot.id}/spaces`);
      const spacesSnapshot = await get(spacesRef);
      
      if (spacesSnapshot.exists()) {
        const spacesData = spacesSnapshot.val();
        const resetSpaces = {};
        
        Object.keys(spacesData).forEach(spaceKey => {
          resetSpaces[spaceKey] = {
            ...spacesData[spaceKey],
            occupied: false,
            bookings: []
          };
        });
        
        await set(spacesRef, resetSpaces);
      }
      
      // Clear all active bookings for this lot
      const bookingsRef = ref(rtdb, 'bookings');
      const bookingsSnapshot = await get(bookingsRef);
      
      if (bookingsSnapshot.exists()) {
        const updates = {};
        bookingsSnapshot.forEach((childSnapshot) => {
          const booking = childSnapshot.val();
          if (booking.lotId === lot.id && (booking.status === 'active' || booking.status === 'confirmed')) {
            updates[`bookings/${childSnapshot.key}/status`] = 'cancelled';
          }
        });
        
        if (Object.keys(updates).length > 0) {
          await update(ref(rtdb), updates);
        }
      }
      
      // Reset parking status for this lot
      const statusRef = ref(rtdb, `parkingStatus/${lot.id}`);
      await set(statusRef, {
        available: 3,
        occupied: 0,
        reserved: 0
      });
      
      // Reset connection status
      const connectionRef = ref(rtdb, 'connection_status');
      await set(connectionRef, 0);
      
      // Update local state
      const resetLocalSpaces = Array.from({ length: 3 }, (_, i) => ({
        id: i + 1,
        row: 1,
        column: i + 1,
        occupied: false,
        bookings: []
      }));
      
      setParkingSpaces(resetLocalSpaces);
      setActiveBookings([]);
      setIsParkingAvailable(true);
      localStorage.setItem(parkingSpacesKey, JSON.stringify(resetLocalSpaces));
      
      console.log('All parking slots reset successfully');
      
    } catch (error) {
      console.error('Error resetting parking slots:', error);
      setBookingError('Failed to reset parking slots. Please refresh the page.');
    }
  };
  
  // Fetch all active bookings to prevent double booking - only for the current lot
  useEffect(() => {
    if (!lot || !lot.id) return;
    
    const bookingsRef = ref(rtdb, 'bookings');
    const activeBookingsUnsubscribe = onValue(bookingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const activeBookingsList = [];
        snapshot.forEach((childSnapshot) => {
          const booking = childSnapshot.val();
          // Only include active and confirmed bookings for this specific lot
          if ((booking.status === 'active' || booking.status === 'confirmed') && 
              booking.lotId === lot.id) {
            activeBookingsList.push({
              ...booking,
              id: childSnapshot.key,
              startTime: booking.startTime ? new Date(booking.startTime) : null,
              endTime: booking.endTime ? new Date(booking.endTime) : null
            });
          }
        });
        setActiveBookings(activeBookingsList);
      } else {
        setActiveBookings([]);
      }
    });

    return () => activeBookingsUnsubscribe();
  }, [lot]);
  
  useEffect(() => {
    // Check if parking system is enabled
    const parkingEnabledRef = ref(rtdb, 'parking_enabled');
    const parkingStatusUnsubscribe = onValue(parkingEnabledRef, (snapshot) => {
      if (snapshot.exists()) {
        setParkingEnabled(snapshot.val());
      }
    });
    
    return () => parkingStatusUnsubscribe();
  }, []);

  // Initialize the database properly if needed
  useEffect(() => {
    if (!lot || !lot.id) return;
    
    const initializeOccupiedSlots = async () => {
      const occupiedSlotsRef = ref(rtdb, `occupiedSlots/${lot.id}`);
      const snapshot = await get(occupiedSlotsRef);
      
      if (!snapshot.exists()) {
        // Initialize with empty array if it doesn't exist
        await set(occupiedSlotsRef, JSON.stringify([]));
      }
    };
    
    initializeOccupiedSlots();
  }, [lot]);

  // Fetch occupied slots for this specific lot
  useEffect(() => {
    if (!lot || !lot.id) return;
    
    const occupiedSlotsRef = ref(rtdb, `occupiedSlots/${lot.id}`);
    const occupiedSlotsUnsubscribe = onValue(occupiedSlotsRef, (snapshot) => {
      if (snapshot.exists()) {
        try {
          // Parse the occupied slots
          const slotsData = snapshot.val();
          const occupiedSlotsList = Array.isArray(slotsData) ? 
            slotsData : 
            typeof slotsData === 'string' ? 
              JSON.parse(slotsData) : 
              [];
          
          // Update the parking spaces with the occupied slots
          setParkingSpaces(prevSpaces => {
            if (!prevSpaces || prevSpaces.length === 0) return prevSpaces;
            
            const updatedSpaces = [...prevSpaces];
            return updatedSpaces.map(space => ({
              ...space,
              occupied: occupiedSlotsList.includes(space.id) || 
                        activeBookings.some(b => parseInt(b.spaceId) === space.id)
            }));
          });
        } catch (error) {
          console.error("Error parsing occupied slots:", error);
        }
      } else {
        // If no occupied slots data, mark all spaces as available
        setParkingSpaces(prevSpaces => {
          if (!prevSpaces || prevSpaces.length === 0) return prevSpaces;
          
          return prevSpaces.map(space => ({
            ...space,
            occupied: activeBookings.some(b => parseInt(b.spaceId) === space.id)
          }));
        });
      }
    });

    return () => occupiedSlotsUnsubscribe();
  }, [lot, activeBookings]);

  useEffect(() => {
    // If lot is undefined, show an error message and return
    if (!lot || !lot.id) {
      setBookingError('Parking lot data is unavailable. Please try again later.');
      return;
    }

    // Check if this lot exists in Firebase, if not, initialize it
    const lotRef = ref(rtdb, `parkingSpaces/${lot.id}`);
    get(lotRef).then(snapshot => {
      if (!snapshot.exists()) {
        // Initialize this lot with 3 available spaces
        const defaultSpaces = {};
        for (let i = 1; i <= 3; i++) {
          defaultSpaces[`space${i}`] = {
            id: i,
            row: 1,
            column: i,
            occupied: false,
            bookings: []
          };
        }
        
        set(ref(rtdb, `parkingSpaces/${lot.id}/spaces`), defaultSpaces)
          .then(() => console.log(`Initialized lot ${lot.id} with default spaces`))
          .catch(err => console.error(`Error initializing lot ${lot.id}:`, err));
      }
    });

    const spacesRef = ref(rtdb, `parkingSpaces/${lot.id}/spaces`);
    const unsubscribe = onValue(spacesRef, (snapshot) => {
      if (snapshot.exists()) {
        const spacesData = snapshot.val();
        console.log('SlotDetailsPage: Fetched spaces from database:', spacesData);
        
        // Only use the first 3 spaces
        const spacesArray = Object.keys(spacesData)
          .filter(key => {
            const spaceId = spacesData[key].id;
            return spaceId <= 3; // Only include spaces 1, 2, and 3
          })
          .map(key => {
            const spaceId = spacesData[key].id;
            
            // Check if this space has an active booking
            const hasActiveBooking = activeBookings.some(booking => 
              parseInt(booking.spaceId) === spaceId
            );
            
            return {
              id: spaceId,
              row: spacesData[key].row || Math.ceil(spaceId / 3),
              column: spacesData[key].column || ((spaceId - 1) % 3) + 1,
              // A space is occupied if marked as such OR has an active booking
              occupied: spacesData[key].occupied || hasActiveBooking,
              bookings: spacesData[key].bookings || []
            };
          });
          
        // Ensure we have exactly 3 spaces
        const filledSpaces = ensureThreeSpaces(spacesArray);
        console.log('SlotDetailsPage: Processed spaces array:', filledSpaces);
        
        // Check if there are any available spaces
        const anyAvailable = filledSpaces.some(space => !space.occupied);
        setIsParkingAvailable(anyAvailable);
        
        setParkingSpaces(filledSpaces);
        localStorage.setItem(parkingSpacesKey, JSON.stringify(filledSpaces));
      } else {
        console.log('SlotDetailsPage: No spaces found in database, initializing 3 spaces');
        // If no data in database, initialize it with 3 spaces
        const defaultSpaces = Array.from({ length: 3 }, (_, i) => ({
          id: i + 1,
          row: 1,
          column: i + 1,
          occupied: false,
          bookings: []
        }));

        // Write the default spaces to the database
        const spacesObject = defaultSpaces.reduce((acc, space) => {
          acc[`space${space.id}`] = space;
          return acc;
        }, {});
        
        set(spacesRef, spacesObject)
          .then(() => {
            console.log('SlotDetailsPage: Initialized database with 3 spaces:', spacesObject);
            setParkingSpaces(defaultSpaces);
            localStorage.setItem(parkingSpacesKey, JSON.stringify(defaultSpaces));
          })
          .catch((error) => {
            console.error('SlotDetailsPage: Error initializing spaces in database:', error);
            setBookingError('Failed to initialize parking spaces. Please try again later.');
            
            // Fallback to localStorage or default if database write fails
            const savedSpaces = localStorage.getItem(parkingSpacesKey);
            if (savedSpaces) {
              const parsedSpaces = JSON.parse(savedSpaces);
              const filledSpaces = ensureThreeSpaces(parsedSpaces);
              console.log('SlotDetailsPage: Using localStorage spaces:', filledSpaces);
              setParkingSpaces(filledSpaces);
            } else {
              console.log('SlotDetailsPage: Using default spaces:', defaultSpaces);
              setParkingSpaces(defaultSpaces);
              localStorage.setItem(parkingSpacesKey, JSON.stringify(defaultSpaces));
            }
          });
      }
    }, (error) => {
      console.error('SlotDetailsPage: Error fetching spaces:', error);
      setBookingError('Failed to load parking spaces. Please try again later.');
      
      // Fallback to localStorage or default on error
      const savedSpaces = localStorage.getItem(parkingSpacesKey);
      if (savedSpaces) {
        const parsedSpaces = JSON.parse(savedSpaces);
        const filledSpaces = ensureThreeSpaces(parsedSpaces);
        console.log('SlotDetailsPage: Using localStorage spaces on error:', filledSpaces);
        setParkingSpaces(filledSpaces);
      } else {
        const defaultSpaces = Array.from({ length: 3 }, (_, i) => ({
          id: i + 1,
          row: 1,
          column: i + 1,
          occupied: false,
          bookings: []
        }));
        console.log('SlotDetailsPage: Using default spaces on error:', defaultSpaces);
        setParkingSpaces(defaultSpaces);
        localStorage.setItem(parkingSpacesKey, JSON.stringify(defaultSpaces));
      }
    });

    return () => unsubscribe();
  }, [lot, parkingSpacesKey, activeBookings]);

  // Helper function to ensure we always have 3 spaces
  const ensureThreeSpaces = (spacesArray) => {
    if (spacesArray.length >= 3) return spacesArray.slice(0, 3);

    const existingIds = spacesArray.map(space => space.id);
    const filledSpaces = [...spacesArray];
    for (let i = 1; i <= 3; i++) {
      if (!existingIds.includes(i)) {
        filledSpaces.push({
          id: i,
          row: 1,
          column: i,
          occupied: false,
          bookings: []
        });
      }
    }
    filledSpaces.sort((a, b) => a.id - b.id);
    return filledSpaces.slice(0, 3);
  };

  const availableDurations = [
    { name: '1 Hour', price: 50, hours: 1 },
    { name: '2 Hours', price: 80, hours: 2 },
    { name: '3 Hours', price: 100, hours: 3 },
    { name: '4 Hours', price: 120, hours: 4 },
    { name: '6 Hours', price: 150, hours: 6 },
    { name: '8 Hours', price: 180, hours: 8 },
    { name: '12 Hours', price: 250, hours: 12 },
    { name: 'Full Day', price: 300, hours: 24 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          if (!bookingComplete) {
            onReturn();
          }
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onReturn, bookingComplete]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const isSlotBooked = (space, startTime, durationHours) => {
    // Check if the slot is already occupied in the system
    if (space.occupied) {
      return true;
    }

    // Check for overlapping bookings
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    // Check for any active bookings for this space
    const hasActiveBooking = activeBookings.some(booking => {
      // Check if this booking is for the same space
      if (parseInt(booking.spaceId) === space.id) {
        const bookingStart = booking.startTime;
        const bookingEnd = booking.endTime;
        
        // Check for time overlap
        return (
          (start >= bookingStart && start < bookingEnd) ||
          (end > bookingStart && end <= bookingEnd) ||
          (start <= bookingStart && end >= bookingEnd)
        );
      }
      return false;
    });

    // Also check space's own booking records
    const hasBookingRecord = space.bookings && space.bookings.some((booking) => {
      // Skip cancelled bookings
      if (booking.status === 'cancelled' || booking.status === 'completed') {
        return false;
      }
      
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      return (
        (start >= bookingStart && start < bookingEnd) ||
        (end > bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      );
    });

    return hasActiveBooking || hasBookingRecord;
  };

  const handleSpaceSelect = (index) => {
    if (!parkingEnabled) {
      setBookingError('Parking system is currently disabled by the administrator.');
      return;
    }
    
    if (!selectedDateTime || !selectedDuration) {
      setBookingError('Please select date, time, and duration first');
      return;
    }

    if (parkingSpaces[index].occupied) {
      setBookingError('This slot is already occupied. Please select another slot.');
      return;
    }

    const selectedDurationObj = availableDurations.find(
      (d) => d.name === selectedDuration
    );

    if (
      isSlotBooked(
        parkingSpaces[index],
        selectedDateTime,
        selectedDurationObj.hours
      )
    ) {
      setBookingError('This slot is already booked for the selected time');
      setSelectedSpaceIndex(null);
      return;
    }

    setBookingError('');
    setSelectedSpaceIndex(index);
  };

  const generateBookingId = () => {
    return `PK-${Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0')}`;
  };

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration.name);
    setAmount(duration.price);
  };

  const setPaymentMethod = (method) => {
    setSelectedPaymentMethod(method);
  };

  const showBookingSummary = () => {
    if (!parkingEnabled) {
      setBookingError('Parking system is currently disabled by the administrator.');
      return;
    }
    
    if (selectedDuration && selectedSpaceIndex !== null && selectedDateTime) {
      setShowSummary(true);
    }
  };

  const initiateRazorpayPayment = () => {
    const newBookingId = bookingId || generateBookingId();
    setBookingId(newBookingId);

    const options = {
      key: 'rzp_test_YOUR_RAZORPAY_KEY',
      amount: amount * 100,
      currency: 'INR',
      name: 'Parking Booking',
      description: `Parking slot booking for ${selectedDuration}`,
      image: 'https://your-logo-url.com/logo.png',
      handler: function (response) {
        completeBookingProcess(response.razorpay_payment_id);
      },
      prefill: {
        name: 'John Doe',
        email: 'john.doe@example.com',
        contact: '9999999999',
      },
      notes: {
        booking_id: newBookingId,
        slot_id: parkingSpaces[selectedSpaceIndex].id,
      },
      theme: {
        color: '#3399cc',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const confirmBooking = () => {
    if (!parkingEnabled) {
      setBookingError('Parking system is currently disabled by the administrator.');
      return;
    }
    
    if (selectedDuration && selectedSpaceIndex !== null && selectedDateTime) {
      setLoading(true);
      setBookingError('');
      
      try {
        // Check one more time if the slot is still available
        if (
          isSlotBooked(
            parkingSpaces[selectedSpaceIndex],
            selectedDateTime,
            availableDurations.find(d => d.name === selectedDuration).hours
          )
        ) {
          setBookingError('This slot has just been booked by someone else. Please choose another slot.');
          setLoading(false);
          return;
        }
        
        const updatedSpaces = [...parkingSpaces];
        updatedSpaces[selectedSpaceIndex] = {
          ...updatedSpaces[selectedSpaceIndex],
          occupied: true,
        };
        setParkingSpaces(updatedSpaces);
        localStorage.setItem(parkingSpacesKey, JSON.stringify(updatedSpaces));
        
        if (selectedPaymentMethod === 'razorpay') {
          initiateRazorpayPayment();
        } else {
          completeBookingProcess();
        }
      } catch (error) {
        console.error("SlotDetailsPage: Error in confirmBooking:", error);
        setBookingError("Failed to confirm booking. Please try again.");
        setLoading(false);
      }
    }
  };

  const completeBookingProcess = async (paymentId = null) => {
    try {
      const selectedDurationObj = availableDurations.find(
        (d) => d.name === selectedDuration
      );
      
      if (!selectedDurationObj) {
        throw new Error("Selected duration not found");
      }
      
      const startTime = new Date(selectedDateTime);
      const endTime = new Date(
        startTime.getTime() + selectedDurationObj.hours * 60 * 60 * 1000
      );

      const newBookingId = bookingId || generateBookingId();
      setBookingId(newBookingId);

      const updatedSpaces = [...parkingSpaces];
      updatedSpaces[selectedSpaceIndex] = {
        ...updatedSpaces[selectedSpaceIndex],
        occupied: true,
        bookings: [
          ...(updatedSpaces[selectedSpaceIndex].bookings || []),
          {
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration: selectedDuration,
            bookingId: newBookingId,
            spaceId: parkingSpaces[selectedSpaceIndex].id,
            status: 'active'
          },
        ],
      };

      setParkingSpaces(updatedSpaces);
      localStorage.setItem(parkingSpacesKey, JSON.stringify(updatedSpaces));

      const userId = auth.currentUser?.uid || 'anonymous';
      const userName = auth.currentUser?.displayName || 'User';
      
      const bookingData = {
        userId,
        userName,
        lotId: lot?.id || 'lot1',
        lotName: lot?.name || 'Kengeri Parking',
        location: lot?.location || 'A\' road, 1st Main Rd, next to Platform No. 4',
        spaceId: parkingSpaces[selectedSpaceIndex].id,
        spaceIndex: selectedSpaceIndex,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: selectedDuration,
        amount: amount,
        bookingId: newBookingId,
        paymentId: paymentId,
        paymentMethod: selectedPaymentMethod,
        timestamp: serverTimestamp(),
        status: 'active'
      };

      // Add to bookings collection
      const bookingsRef = ref(rtdb, 'bookings');
      const newBookingRef = await push(bookingsRef, bookingData);

      // Update the parking space in the database
      const spaceRef = ref(rtdb, `parkingSpaces/${lot.id}/spaces/space${parkingSpaces[selectedSpaceIndex].id}`);
      await update(spaceRef, {
        occupied: true,
        bookings: updatedSpaces[selectedSpaceIndex].bookings
      });

      // Update the occupied slots for this specific lot
      const occupiedSlotsRef = ref(rtdb, `occupiedSlots/${lot.id}`);
      const occupiedSlotsSnapshot = await get(occupiedSlotsRef);
      
      if (occupiedSlotsSnapshot.exists()) {
        try {
          const slotsData = occupiedSlotsSnapshot.val();
          let occupiedSlots = Array.isArray(slotsData) ? 
            slotsData : 
            typeof slotsData === 'string' ? 
              JSON.parse(slotsData) : 
              [];
          
          // Add this slot to occupied slots if not already there
          if (!occupiedSlots.includes(parkingSpaces[selectedSpaceIndex].id)) {
            occupiedSlots.push(parkingSpaces[selectedSpaceIndex].id);
            await set(occupiedSlotsRef, JSON.stringify(occupiedSlots));
          }
        } catch (error) {
          console.error("Error updating occupied slots:", error);
        }
      } else {
        // Initialize with this slot
        await set(occupiedSlotsRef, JSON.stringify([parkingSpaces[selectedSpaceIndex].id]));
      }

      // Update parking status for this lot
      const statusRef = ref(rtdb, `parkingStatus/${lot.id}`);
      const statusSnapshot = await get(statusRef);
      const currentStatus = statusSnapshot.exists() 
        ? statusSnapshot.val() 
        : { available: 3, occupied: 0, reserved: 0 };
      
      await update(statusRef, {
        available: Math.max(0, currentStatus.available - 1),
        occupied: (currentStatus.occupied || 0) + 1,
        reserved: currentStatus.reserved || 0
      });

      // Record activity
      const activitiesRef = ref(rtdb, 'recentActivities');
      await push(activitiesRef, {
        user: userName,
        userId: userId,
        action: `booked Space #${parkingSpaces[selectedSpaceIndex].id} at ${lot?.name}`,
        time: new Date().toLocaleString(),
        timestamp: serverTimestamp()
      });

      setBookingComplete(true);
      setShowSummary(false);
      setShowSlotDetails(true);
    } catch (error) {
      console.error("SlotDetailsPage: Error completing booking:", error);
      setBookingError("Failed to complete booking: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDateTime = () => {
    const date = new Date(selectedDateTime || Date.now());
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // If lot is undefined, show an error message
  if (!lot) {
    return (
      <div className="slot-details-page">
        <div className="slot-details-header">
          <button className="back-button" onClick={onReturn}>
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <h1>Parking Slots</h1>
        </div>
        <div className="booking-error-alert">
          <AlertCircle size={20} />
          <p>Parking lot data is unavailable. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="slot-details-page">
      <Script url="https://checkout.razorpay.com/v1/checkout.js" />

      <div className="slot-details-header">
        <button className="back-button" onClick={onReturn}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        <h1>{lot?.name || 'Parking Slots'}</h1>
      </div>
      
      {!parkingEnabled && (
        <div className="booking-error-alert">
          <AlertCircle size={20} />
          <p>Parking system is currently disabled by the administrator.</p>
        </div>
      )}
      
      {!isParkingAvailable && (
        <div className="booking-error-alert">
          <AlertCircle size={20} />
          <p>All parking slots are currently occupied. Please check back later.</p>
        </div>
      )}

      {!bookingComplete && (
        <div className="booking-timer-alert">
          <AlertCircle size={20} />
          <p>
            You have{' '}
            <span className="countdown">{formatTime(timeRemaining)}</span> to
            complete your booking
          </p>
        </div>
      )}

      {bookingError && (
        <div className="booking-error-alert">
          <AlertCircle size={20} />
          <p>{bookingError}</p>
        </div>
      )}

      <div className="slot-details-info">
        <p>
          <strong>Location:</strong> {lot?.location || 'Not available'}
        </p>
        <p>
          <strong>Available Hours:</strong> {lot?.availableTimings || 'Not available'}
        </p>
        <p>
          <strong>Status:</strong> {parkingEnabled ? 'Open' : 'Closed'} - {lot?.realTimeStatus || 'Not available'}
        </p>
      </div>

      {bookingComplete && showSlotDetails ? (
        <div className="booking-confirmation">
          <h2>Booking Successful!</h2>
          <p>Your parking slot has been booked successfully.</p>

          <div className="booking-details">
            <h3>Booking Summary</h3>
            <div className="summary-item">
              <span>Slot Name:</span>
              <span>
                Space #{parkingSpaces[selectedSpaceIndex]?.id || 'N/A'}, {lot?.name || 'Parking Lot'}
              </span>
            </div>
            <div className="summary-item">
              <span>Timing:</span>
              <span>
                {selectedDuration} (from {getCurrentDateTime()})
              </span>
            </div>
            <div className="summary-item">
              <span>Amount:</span>
              <span>₹{amount}</span>
            </div>
            <div className="summary-item">
              <span>Status:</span>
              <span className="success-status">Confirmed</span>
            </div>
            {selectedPaymentMethod === 'razorpay' && (
              <div className="summary-item">
                <span>Payment ID:</span>
                <span>RZP-{Math.random().toString(36).substr(2, 9)}</span>
              </div>
            )}
            <div className="summary-item">
              <span>Booking ID:</span>
              <span>{bookingId}</span>
            </div>
          </div>

          <div className="qr-code-placeholder">
            <p>Booking ID: {bookingId}</p>
          </div>

          <button className="return-btn" onClick={onReturn}>
            Return to Dashboard
          </button>
        </div>
      ) : showSummary ? (
        <div className="booking-summary">
          <h2>Booking Summary</h2>
          <div className="summary-content">
            <div className="summary-item">
              <span>Slot Name:</span>
              <span>
                Space #{parkingSpaces[selectedSpaceIndex]?.id || 'N/A'}, {lot?.name || 'Parking Lot'}
              </span>
            </div>
            <div className="summary-item">
              <span>Timing:</span>
              <span>
                {selectedDuration} (from {getCurrentDateTime()})
              </span>
            </div>
            <div className="summary-item">
              <span>Amount:</span>
              <span>₹{amount}</span>
            </div>
          </div>

          <div className="summary-actions">
            <button
              className="back-btn"
              onClick={() => {
                setShowSummary(false);
                setLoading(false);
              }}
              disabled={loading}
            >
              Back
            </button>
            <button 
              className="confirm-btn" 
              onClick={confirmBooking}
              disabled={loading || !parkingEnabled}
            >
              {loading ? 'Processing...' : `Confirm ₹${amount}`}
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="time-slot-selection">
            <h2>Select Date and Time</h2>
            <input
              type="datetime-local"
              value={selectedDateTime}
              onChange={(e) => setSelectedDateTime(e.target.value)}
              min={new Date().toISOString().slice(0, 16)}
              className="datetime-picker"
              disabled={!parkingEnabled}
            />

            <h2>Select Parking Duration</h2>
            <div className="time-slots-container">
              {availableDurations.map((duration, index) => (
                <button
                  key={index}
                  className={`time-slot-btn ${
                    selectedDuration === duration.name ? 'selected' : ''
                  }`}
                  onClick={() => handleDurationSelect(duration)}
                  disabled={!parkingEnabled}
                >
                  {duration.name} - ₹{duration.price}
                </button>
              ))}
            </div>
          </div>

          <div className="parking-spaces-container">
            <h2>Select a Parking Space</h2>
            <div className="parking-grid parking-grid-3">
              {parkingSpaces.map((space, index) => (
                <div
                  key={space.id}
                  className={`parking-space ${
                    space.occupied ? 'occupied' : 'available'
                  } ${selectedSpaceIndex === index ? 'selected' : ''}`}
                  onClick={() => !space.occupied && parkingEnabled && handleSpaceSelect(index)}
                  style={{ 
                    cursor: (!parkingEnabled || space.occupied) ? 'not-allowed' : 'pointer',
                    opacity: !parkingEnabled ? '0.7' : '1'
                  }}
                >
                  <span>{space.id}</span>
                </div>
              ))}
            </div>
            <div className="space-legend">
              <div className="legend-item">
                <div className="legend-color available"></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="legend-color occupied"></div>
                <span>Occupied</span>
              </div>
              <div className="legend-item">
                <div className="legend-color selected"></div>
                <span>Selected</span>
              </div>
            </div>
          </div>

          <div className="booking-actions">
            <button
              className="confirm-btn"
              disabled={
                !selectedDuration ||
                selectedSpaceIndex === null ||
                !selectedDateTime ||
                loading ||
                !parkingEnabled
              }
              onClick={showBookingSummary}
            >
              Continue to Book
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default SlotDetailsPage;