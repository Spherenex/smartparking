import React, { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Calendar, 
  Clock, 
  AlertCircle,
  MapPin,
  Car
} from 'lucide-react';
import '../styles/BookingsOverview.css';

const BookingsOverview = ({ bookings }) => {
  const [activeFilter, setActiveFilter] = useState('recent');
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    filterBookings(activeFilter);
  }, [bookings, activeFilter]);
  
  const filterBookings = (filterType) => {
    setLoading(true);
    
    try {
      let filtered = [];
      
      switch (filterType) {
        case 'recent':
          filtered = [...bookings].sort((a, b) => {
            return new Date(b.bookingTime) - new Date(a.bookingTime);
          }).slice(0, 5);
          break;
          
        case 'active':
          filtered = bookings.filter(booking => booking.status === 'active')
            .sort((a, b) => {
              return new Date(b.bookingTime) - new Date(a.bookingTime);
            }).slice(0, 5);
          break;
          
        case 'completed':
          filtered = bookings.filter(booking => booking.status === 'completed')
            .sort((a, b) => {
              return new Date(b.bookingTime) - new Date(a.bookingTime);
            }).slice(0, 5);
          break;
          
        default:
          filtered = [...bookings].sort((a, b) => {
            return new Date(b.bookingTime) - new Date(a.bookingTime);
          }).slice(0, 5);
      }
      
      setFilteredBookings(filtered);
    } catch (err) {
      console.error("Error filtering bookings:", err);
      setError("Failed to filter bookings");
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="bookings-overview">
      <div className="bookings-overview-header">
        <h3>Booking Activity</h3>
        <div className="booking-filters">
          <button 
            className={`filter-btn ${activeFilter === 'recent' ? 'active' : ''}`}
            onClick={() => setActiveFilter('recent')}
          >
            Recent
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            Active
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveFilter('completed')}
          >
            Completed
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-bookings">
          <div className="spinner"></div>
          <p>Loading bookings...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <AlertCircle size={24} />
          <p>{error}</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="no-bookings">
          <AlertCircle size={32} />
          <p>No bookings found for the selected filter</p>
        </div>
      ) : (
        <div className="bookings-list">
          {filteredBookings.map((booking) => (
            <div key={booking.id} className="booking-item">
              <div className="booking-item-header">
                <div className="parking-name">
                  <MapPin size={16} />
                  {booking.parkingLotName || 'Unknown Location'}
                </div>
                <div className={`booking-status ${booking.status}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
              </div>
              
              <div className="booking-item-details">
                <div className="booking-detail">
                  <Calendar size={14} />
                  <span>Booked: {formatDate(booking.bookingTime)}</span>
                </div>
                <div className="booking-detail">
                  <Clock size={14} />
                  <span>{formatDate(booking.startTime)} - {formatDate(booking.endTime)}</span>
                </div>
                <div className="booking-detail">
                  <Car size={14} />
                  <span>Space: #{booking.spaceId || 'N/A'}</span>
                </div>
              </div>
              
              <div className="booking-item-footer">
                <div className="booking-amount">₹{booking.amount || 0}</div>
                <div className="booking-id">ID: {booking.bookingId || 'Unknown'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsOverview;