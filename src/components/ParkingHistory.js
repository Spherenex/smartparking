



// import React, { useState, useEffect } from 'react';
// import { rtdb } from '../firebase';
// import { ref, onValue, query, orderByChild, equalTo, update } from 'firebase/database';
// import { Calendar, Clock, MapPin, Activity, ChevronRight } from 'lucide-react';
// import '../styles/ParkingHistory.css';

// const ParkingHistory = ({ userId, onBookingsFetched }) => {
//   const [bookings, setBookings] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [filter, setFilter] = useState('all');
//   const [expandedBooking, setExpandedBooking] = useState(null);

//   useEffect(() => {
//     console.log('ParkingHistory useEffect - userId:', userId);
//     fetchBookingHistory();
//   }, [userId, filter]);

//   const fetchBookingHistory = () => {
//     setLoading(true);
//     try {
//       let bookingsRef;

//       if (filter === 'all') {
//         bookingsRef = query(
//           ref(rtdb, 'bookings'),
//           orderByChild('userId'),
//           equalTo(userId)
//         );
//       } else {
//         bookingsRef = query(
//           ref(rtdb, 'bookings'),
//           orderByChild('userId'),
//           equalTo(userId)
//         );
//       }

//       const unsubscribe = onValue(bookingsRef, (snapshot) => {
//         const bookingsList = [];
//         if (snapshot.exists()) {
//           snapshot.forEach((childSnapshot) => {
//             const bookingData = childSnapshot.val();
//             if (filter === 'all' || bookingData.status === filter) {
//               bookingsList.push({
//                 id: childSnapshot.key,
//                 ...bookingData,
//                 bookingTime: bookingData.bookingTime
//                   ? new Date(bookingData.bookingTime)
//                   : null,
//                 startTime: bookingData.startTime
//                   ? new Date(bookingData.startTime)
//                   : null,
//                 endTime: bookingData.endTime
//                   ? new Date(bookingData.endTime)
//                   : null,
//               });
//             }
//           });

//           bookingsList.sort((a, b) => {
//             const timeA = a.bookingTime ? a.bookingTime.getTime() : 0;
//             const timeB = b.bookingTime ? b.bookingTime.getTime() : 0;
//             return timeB - timeA;
//           });
//         }

//         console.log('Fetched bookings in ParkingHistory:', bookingsList);
//         setBookings(bookingsList);
//         setLoading(false);

//         if (onBookingsFetched) {
//           console.log('Calling onBookingsFetched with:', bookingsList);
//           onBookingsFetched(bookingsList);
//         }
//       }, (err) => {
//         console.error("Error fetching booking history:", err);
//         setError('Failed to load booking history. Please try again later.');
//         setLoading(false);
//       });

//       return () => unsubscribe();
//     } catch (err) {
//       console.error("Error setting up booking history listener:", err);
//       setError('Failed to load booking history. Please try again later.');
//       setLoading(false);
//     }
//   };

//   const cancelBooking = async (bookingId) => {
//     try {
//       const bookingRef = ref(rtdb, `bookings/${bookingId}`);
//       await update(bookingRef, {
//         status: 'cancelled',
//         cancelledAt: new Date().toISOString(),
//       });

//       const updatedBookings = bookings.map((booking) =>
//         booking.id === bookingId
//           ? { ...booking, status: 'cancelled', cancelledAt: new Date() }
//           : booking
//       );
//       setBookings(updatedBookings);

//       if (onBookingsFetched) {
//         console.log('Calling onBookingsFetched after cancel with:', updatedBookings);
//         onBookingsFetched(updatedBookings);
//       }
//     } catch (err) {
//       console.error("Error cancelling booking:", err);
//       setError('Failed to cancel booking. Please try again later.');
//     }
//   };

//   const formatDateTime = (date) => {
//     if (!date) return 'N/A';

//     return date.toLocaleString('en-US', {
//       weekday: 'short',
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit',
//       timeZone: 'Asia/Kolkata'
//     });
//   };

//   const getStatusClass = (status) => {
//     switch (status) {
//       case 'active':
//         return 'status-active';
//       case 'completed':
//         return 'status-completed';
//       case 'cancelled':
//         return 'status-cancelled';
//       default:
//         return '';
//     }
//   };

//   const toggleExpandBooking = (bookingId) => {
//     if (expandedBooking === bookingId) {
//       setExpandedBooking(null);
//     } else {
//       setExpandedBooking(bookingId);
//     }
//   };

//   const getTimeDifference = (start, end) => {
//     if (!start || !end) return 'N/A';

//     const diffMs = end - start;
//     const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
//     const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

//     return `${diffHrs}h ${diffMins}m`;
//   };

//   const determineBookingStatus = (booking) => {
//     const now = new Date();
//     const startTime = booking.startTime ? new Date(booking.startTime) : null;
//     const endTime = booking.endTime ? new Date(booking.endTime) : null;

//     if (booking.status === 'cancelled') {
//       return 'cancelled';
//     } else if (startTime && endTime) {
//       if (now < startTime) {
//         return 'active';
//       } else if (now >= startTime && now <= endTime) {
//         return 'active';
//       } else if (now > endTime) {
//         return 'completed';
//       }
//     }
//     return booking.status;
//   };

//   return (
//     <div className="parking-history">
//       <div className="history-header">
//         <h1>Booking History</h1>
//         <div className="filter-tabs">
//           <button
//             className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
//             onClick={() => setFilter('all')}
//           >
//             All
//           </button>
//         </div>
//       </div>

//       {error && <div className="error-message">{error}</div>}

//       {loading ? (
//         <div className="loading-container">
//           <div className="loading-spinner"></div>
//           <p>Loading booking history...</p>
//         </div>
//       ) : bookings.length === 0 ? (
//         <div className="no-bookings">
//           <Activity size={48} />
//           <h3>No bookings found</h3>
//           <p>Your booking history will appear here once you make a booking.</p>
//         </div>
//       ) : (
//         <div className="bookings-list">
//           {bookings.map((booking) => {
//             const displayStatus = determineBookingStatus(booking);
//             return (
//               <div
//                 key={booking.id}
//                 className={`booking-card ${expandedBooking === booking.id ? 'expanded' : ''}`}
//               >
//                 <div
//                   className="booking-card-header"
//                   onClick={() => toggleExpandBooking(booking.id)}
//                 >
//                   <div className="booking-basic-info">
//                     <h3>{booking.parkingLotName}</h3>
//                     <div className="booking-meta">
//                       <span className="booking-id">ID: {booking.bookingId}</span>
//                       <span className={`booking-status ${getStatusClass(displayStatus)}`}>
//                         {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
//                       </span>
//                     </div>
//                   </div>
//                   <div className="booking-time-info">
//                     <ChevronRight
//                       size={20}
//                       className={`expand-icon ${expandedBooking === booking.id ? 'rotated' : ''}`}
//                     />
//                   </div>
//                 </div>

//                 {expandedBooking === booking.id && (
//                   <div className="booking-details">
//                     <div className="detail-section">
//                       <h4>Location</h4>
//                       <div className="detail-item">
//                         <MapPin size={16} />
//                         <span>{booking.location || 'Location not available'}</span>
//                       </div>
//                     </div>

//                     <div className="detail-section">
//                       <h4>Timing Details</h4>
//                       <div className="detail-item">
//                         <Clock size={16} />
//                         <div className="time-details">
//                           <div className="time-range">
//                             <span>Start: {formatDateTime(booking.startTime)}</span>
//                             <span>End: {formatDateTime(booking.endTime)}</span>
//                           </div>
//                           <div className="duration">
//                             Duration: {getTimeDifference(booking.startTime, booking.endTime)}
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="detail-section payment-details">
//                       <div className="payment-info">
//                         <h4>Payment Details</h4>
//                         <div className="payment-amount">₹{booking.amount}</div>
//                       </div>
//                       <div className="payment-method">
//                         {booking.paymentMethod === 'card' ? 'Card Payment' : 'Online Payment'}
//                       </div>
//                     </div>

//                     <div className="detail-section">
//                       <h4>Parking Space</h4>
//                       <div className="space-info">
//                         <div className="space-number">Space #{booking.spaceId}</div>
//                         {booking.vehicleNumber && (
//                           <div className="vehicle-info">Vehicle: {booking.vehicleNumber}</div>
//                         )}
//                       </div>
//                     </div>

//                     {displayStatus === 'active' && (
//                       <div className="booking-actions">
//                         <button
//                           className="cancel-booking-btn"
//                           onClick={() => cancelBooking(booking.id)}
//                         >
//                           Cancel Booking
//                         </button>
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ParkingHistory;



import React, { useState, useEffect } from 'react';
import { rtdb } from '../firebase';
import { ref, onValue, query, orderByChild, equalTo, update, get, set } from 'firebase/database';
import { Calendar, Clock, MapPin, Activity, ChevronRight, CreditCard, Banknote } from 'lucide-react';
import '../styles/ParkingHistory.css';

const ParkingHistory = ({ userId, onBookingsFetched }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [processingPayment, setProcessingPayment] = useState({});

  useEffect(() => {
    console.log('ParkingHistory useEffect - userId:', userId);
    fetchBookingHistory();
  }, [userId, filter]);

  const fetchBookingHistory = () => {
    setLoading(true);
    try {
      let bookingsRef;

      if (filter === 'all') {
        bookingsRef = query(
          ref(rtdb, 'bookings'),
          orderByChild('userId'),
          equalTo(userId)
        );
      } else {
        bookingsRef = query(
          ref(rtdb, 'bookings'),
          orderByChild('userId'),
          equalTo(userId)
        );
      }

      const unsubscribe = onValue(bookingsRef, (snapshot) => {
        const bookingsList = [];
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const bookingData = childSnapshot.val();
            if (filter === 'all' || bookingData.status === filter) {
              bookingsList.push({
                id: childSnapshot.key,
                ...bookingData,
                bookingTime: bookingData.bookingTime
                  ? new Date(bookingData.bookingTime)
                  : null,
                startTime: bookingData.startTime
                  ? new Date(bookingData.startTime)
                  : null,
                endTime: bookingData.endTime
                  ? new Date(bookingData.endTime)
                  : null,
              });
            }
          });

          bookingsList.sort((a, b) => {
            const timeA = a.bookingTime ? a.bookingTime.getTime() : 0;
            const timeB = b.bookingTime ? b.bookingTime.getTime() : 0;
            return timeB - timeA;
          });
        }

        console.log('Fetched bookings in ParkingHistory:', bookingsList);
        setBookings(bookingsList);
        setLoading(false);

        if (onBookingsFetched) {
          console.log('Calling onBookingsFetched with:', bookingsList);
          onBookingsFetched(bookingsList);
        }
      }, (err) => {
        console.error("Error fetching booking history:", err);
        setError('Failed to load booking history. Please try again later.');
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up booking history listener:", err);
      setError('Failed to load booking history. Please try again later.');
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      const bookingRef = ref(rtdb, `bookings/${bookingId}`);
      await update(bookingRef, {
        status: 'cancelled',
        cancelledAt: new Date().toISOString(),
      });

      const updatedBookings = bookings.map((booking) =>
        booking.id === bookingId
          ? { ...booking, status: 'cancelled', cancelledAt: new Date() }
          : booking
      );
      setBookings(updatedBookings);

      if (onBookingsFetched) {
        console.log('Calling onBookingsFetched after cancel with:', updatedBookings);
        onBookingsFetched(updatedBookings);
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError('Failed to cancel booking. Please try again later.');
    }
  };

  // Handle payment processing
  const handlePayment = async (bookingId, paymentMethod) => {
    setProcessingPayment(prev => ({ ...prev, [bookingId]: true }));
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) {
        throw new Error("Booking not found");
      }

      // Update booking with payment info
      const bookingRef = ref(rtdb, `bookings/${bookingId}`);
      await update(bookingRef, {
        status: 'completed',
        paymentMethod: paymentMethod,
        paidAt: new Date().toISOString()
      });

      // If the booking has a spaceId, update the parking space to available
      if (booking.spaceId && booking.lotId) {
        const spaceRef = ref(rtdb, `parkingSpaces/${booking.lotId}/spaces/space${booking.spaceId}`);
        const spaceSnapshot = await get(spaceRef);
        
        if (spaceSnapshot.exists()) {
          await update(spaceRef, { occupied: false });
        }
      }

      // Clear active slot if this was the active booking
      const slotRef = ref(rtdb, 'slot');
      const slotSnapshot = await get(slotRef);
      
      if (slotSnapshot.exists()) {
        const slotValue = slotSnapshot.val();
        const slotNumber = parseInt(slotValue.replace(/"/g, ''));
        
        if (slotNumber === parseInt(booking.spaceId)) {
          // Use set instead of update for primitive values
          await set(slotRef, JSON.stringify("0"));
        }
      }

      // Update connection status
      const connectionRef = ref(rtdb, 'connection_status');
      const connectionSnapshot = await get(connectionRef);
      if (connectionSnapshot.exists()) {
        const currentValue = parseInt(connectionSnapshot.val());
        if (currentValue > 0) {
          // Use set instead of update for primitive values
          await set(connectionRef, currentValue - 1);
        }
      }

      // Update local state
      const updatedBookings = bookings.map((b) =>
        b.id === bookingId
          ? { 
              ...b, 
              status: 'completed', 
              paymentMethod: paymentMethod,
              paidAt: new Date() 
            }
          : b
      );
      
      setBookings(updatedBookings);

      if (onBookingsFetched) {
        onBookingsFetched(updatedBookings);
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setProcessingPayment(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';

    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'status-active';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const toggleExpandBooking = (bookingId) => {
    if (expandedBooking === bookingId) {
      setExpandedBooking(null);
    } else {
      setExpandedBooking(bookingId);
    }
  };

  const getTimeDifference = (start, end) => {
    if (!start || !end) return 'N/A';

    const diffMs = end - start;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${diffHrs}h ${diffMins}m`;
  };

  const determineBookingStatus = (booking) => {
    const now = new Date();
    const startTime = booking.startTime ? new Date(booking.startTime) : null;
    const endTime = booking.endTime ? new Date(booking.endTime) : null;

    if (booking.status === 'cancelled') {
      return 'cancelled';
    } else if (booking.status === 'completed') {
      return 'completed';
    } else if (startTime && endTime) {
      if (now < startTime) {
        return 'active';
      } else if (now >= startTime && now <= endTime) {
        return 'active';
      } else if (now > endTime) {
        return 'completed';
      }
    }
    return booking.status;
  };

  // Function to check if booking is verified
  const isBookingVerified = (booking) => {
    // Check if booking has been checked in and checked out (verified)
    return booking.checkedIn && 
           (booking.checkedOut || booking.verificationResult === 1) && 
           booking.status !== 'completed' && 
           booking.status !== 'cancelled';
  };

  return (
    <div className="parking-history">
      <div className="history-header">
        <h1>Booking History</h1>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading booking history...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="no-bookings">
          <Activity size={48} />
          <h3>No bookings found</h3>
          <p>Your booking history will appear here once you make a booking.</p>
        </div>
      ) : (
        <div className="bookings-list">
          {bookings.map((booking) => {
            const displayStatus = determineBookingStatus(booking);
            const isVerified = isBookingVerified(booking);
            const isProcessingPayment = processingPayment[booking.id];
            
            return (
              <div
                key={booking.id}
                className={`booking-card ${expandedBooking === booking.id ? 'expanded' : ''}`}
              >
                <div
                  className="booking-card-header"
                  onClick={() => toggleExpandBooking(booking.id)}
                >
                  <div className="booking-basic-info">
                    <h3>{booking.parkingLotName}</h3>
                    <div className="booking-meta">
                      <span className="booking-id">ID: {booking.bookingId}</span>
                      <span className={`booking-status ${getStatusClass(displayStatus)}`}>
                        {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="booking-time-info">
                    <ChevronRight
                      size={20}
                      className={`expand-icon ${expandedBooking === booking.id ? 'rotated' : ''}`}
                    />
                  </div>
                </div>

                {expandedBooking === booking.id && (
                  <div className="booking-details">
                    <div className="detail-section">
                      <h4>Location</h4>
                      <div className="detail-item">
                        <MapPin size={16} />
                        <span>{booking.location || 'Location not available'}</span>
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Timing Details</h4>
                      <div className="detail-item">
                        <Clock size={16} />
                        <div className="time-details">
                          <div className="time-range">
                            <span>Start: {formatDateTime(booking.startTime)}</span>
                            <span>End: {formatDateTime(booking.endTime)}</span>
                          </div>
                          <div className="duration">
                            Duration: {getTimeDifference(booking.startTime, booking.endTime)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="detail-section payment-details">
                      <div className="payment-info">
                        <h4>Payment Details</h4>
                        <div className="payment-amount">₹{booking.amount}</div>
                      </div>
                      <div className="payment-method">
                        {booking.paymentMethod ? 
                          `${booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1)} Payment` : 
                          (booking.status === 'completed' ? 'Payment Completed' : 'Payment Pending')
                        }
                        {booking.paymentId && (
                          <div className="payment-id">
                            Transaction ID: {booking.paymentId.substring(0, 10)}...
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Parking Space</h4>
                      <div className="space-info">
                        <div className="space-number">Space #{booking.spaceId}</div>
                        {booking.vehicleNumber && (
                          <div className="vehicle-info">Vehicle: {booking.vehicleNumber}</div>
                        )}
                        {/* {booking.checkinVehicleNumber && (
                          <div className="vehicle-info">Check-in Vehicle: {booking.checkinVehicleNumber}</div>
                        )}
                        {booking.checkoutVehicleNumber && (
                          <div className="vehicle-info">Checkout Vehicle: {booking.checkoutVehicleNumber}</div>
                        )} */}
                      </div>
                    </div>

                    {/* Conditional rendering based on booking status */}
                    {displayStatus === 'active' && !isVerified && !isProcessingPayment && (
                      <div className="booking-actions">
                        <button
                          className="cancel-booking-btn"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </button>
                      </div>
                    )}

                    {/* Payment options for verified bookings */}
                    {isVerified && !isProcessingPayment && (
                      <div className="payment-options">
                        <h4>Select Payment Method</h4>
                        <div className="payment-buttons">
                          <button
                            className="payment-btn cash-btn"
                            onClick={() => handlePayment(booking.id, 'cash')}
                          >
                            <Banknote size={18} />
                            Cash
                          </button>
                          <button
                            className="payment-btn razorpay-btn"
                            onClick={() => handlePayment(booking.id, 'razorpay')}
                          >
                            <CreditCard size={18} />
                            Razorpay
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Processing Payment Indicator */}
                    {isProcessingPayment && (
                      <div className="processing-payment">
                        <div className="loading-spinner"></div>
                        <p>Processing payment...</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParkingHistory;
