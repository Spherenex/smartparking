

import React, { useState, useEffect } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { auth, rtdb } from '../firebase';
import { ref, push, update, serverTimestamp, onValue, get, set } from 'firebase/database';
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

  // Handle case where lot is undefined
  const parkingSpacesKey = lot && lot.id ? `parkingSpaces-${lot.id}` : 'parkingSpaces-default';
  const [parkingSpaces, setParkingSpaces] = useState([]);

  useEffect(() => {
    // If lot is undefined, show an error message and return
    if (!lot || !lot.id) {
      setBookingError('Parking lot data is unavailable. Please try again later.');
      return;
    }

    const spacesRef = ref(rtdb, `parkingSpaces/${lot.id}/spaces`);
    const unsubscribe = onValue(spacesRef, (snapshot) => {
      if (snapshot.exists()) {
        const spacesData = snapshot.val();
        console.log('SlotDetailsPage: Fetched spaces from database:', spacesData);
        const spacesArray = Object.keys(spacesData).map(key => ({
          id: spacesData[key].id,
          row: Math.ceil(spacesData[key].id / 5),
          column: ((spacesData[key].id - 1) % 5) + 1,
          occupied: spacesData[key].occupied || false,
          bookings: spacesData[key].bookings || []
        }));
        // Ensure we have 10 spaces
        const filledSpaces = ensureTenSpaces(spacesArray);
        console.log('SlotDetailsPage: Processed spaces array:', filledSpaces);
        setParkingSpaces(filledSpaces);
        localStorage.setItem(parkingSpacesKey, JSON.stringify(filledSpaces));
      } else {
        console.log('SlotDetailsPage: No spaces found in database, checking localStorage');
        // If no data in database, initialize it with 10 spaces
        const defaultSpaces = Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          row: Math.ceil((i + 1) / 5),
          column: (i % 5) + 1,
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
            console.log('SlotDetailsPage: Initialized database with 10 spaces:', spacesObject);
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
              const filledSpaces = ensureTenSpaces(parsedSpaces);
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
        const filledSpaces = ensureTenSpaces(parsedSpaces);
        console.log('SlotDetailsPage: Using localStorage spaces on error:', filledSpaces);
        setParkingSpaces(filledSpaces);
      } else {
        const defaultSpaces = Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          row: Math.ceil((i + 1) / 5),
          column: (i % 5) + 1,
          occupied: false,
          bookings: []
        }));
        console.log('SlotDetailsPage: Using default spaces on error:', defaultSpaces);
        setParkingSpaces(defaultSpaces);
        localStorage.setItem(parkingSpacesKey, JSON.stringify(defaultSpaces));
      }
    });

    return () => unsubscribe();
  }, [lot, parkingSpacesKey]);

  // Helper function to ensure we always have 10 spaces
  const ensureTenSpaces = (spacesArray) => {
    if (spacesArray.length >= 10) return spacesArray;

    const existingIds = spacesArray.map(space => space.id);
    const filledSpaces = [...spacesArray];
    for (let i = 1; i <= 10; i++) {
      if (!existingIds.includes(i)) {
        filledSpaces.push({
          id: i,
          row: Math.ceil(i / 5),
          column: ((i - 1) % 5) + 1,
          occupied: false,
          bookings: []
        });
      }
    }
    filledSpaces.sort((a, b) => a.id - b.id);
    return filledSpaces.slice(0, 10);
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
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    return space.bookings && space.bookings.some((booking) => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      return (
        (start >= bookingStart && start < bookingEnd) ||
        (end > bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      );
    });
  };

  const handleSpaceSelect = (index) => {
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
    if (selectedDuration && selectedSpaceIndex !== null && selectedDateTime) {
      setLoading(true);
      setBookingError('');
      
      try {
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
          },
        ],
      };

      setParkingSpaces(updatedSpaces);
      localStorage.setItem(parkingSpacesKey, JSON.stringify(updatedSpaces));

      const userId = auth.currentUser?.uid || 'anonymous';
      const bookingData = {
        userId,
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
        status: 'confirmed'
      };

      const bookingsRef = ref(rtdb, 'bookings');
      const newBookingRef = await push(bookingsRef, bookingData);

      const spaceRef = ref(rtdb, `parkingSpaces/${lot.id}/spaces/space${parkingSpaces[selectedSpaceIndex].id}`);
      await update(spaceRef, {
        occupied: true,
        bookings: updatedSpaces[selectedSpaceIndex].bookings
      });

      const statusRef = ref(rtdb, 'parkingStatus');
      const snapshot = await get(statusRef);
      const currentStatus = snapshot.val() || { available: 10, occupied: 0, reserved: 0 };
      await update(statusRef, {
        available: Math.max(0, currentStatus.available - 1),
        occupied: (currentStatus.occupied || 0) + 1,
        reserved: currentStatus.reserved || 0
      });

      const statsRef = ref(rtdb, 'dashboardStats');
      const statsSnapshot = await get(statsRef);
      const currentStats = statsSnapshot.val() || { totalSpots: 10, activeUsers: 0, dailyRevenue: 0, vacantSpots: 10 };
      await update(statsRef, {
        dailyRevenue: (currentStats.dailyRevenue || 0) + amount,
        vacantSpots: Math.max(0, (currentStats.vacantSpots || 10) - 1)
      });

      const activitiesRef = ref(rtdb, 'recentActivities');
      const userName = auth.currentUser?.displayName || 'User';
      await push(activitiesRef, {
        user: userName,
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
          <strong>Status:</strong> {lot?.realTimeStatus || 'Not available'}
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
              disabled={loading}
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
                >
                  {duration.name} - ₹{duration.price}
                </button>
              ))}
            </div>
          </div>

          <div className="parking-spaces-container">
            <h2>Select a Parking Space</h2>
            <div className="parking-grid">
              {parkingSpaces.map((space, index) => (
                <div
                  key={space.id}
                  className={`parking-space ${
                    space.occupied ? 'occupied' : 'available'
                  } ${selectedSpaceIndex === index ? 'selected' : ''}`}
                  onClick={() => !space.occupied && handleSpaceSelect(index)}
                  style={{ cursor: space.occupied ? 'not-allowed' : 'pointer' }}
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
                loading
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