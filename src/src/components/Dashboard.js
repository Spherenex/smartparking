



// import React, { useState, useEffect, useCallback } from 'react';
// import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
// import { Search, MapPin, Star, Navigation, Clock, ArrowLeft } from 'lucide-react';
// import '../styles/Dashboard.css';
// import SlotDetailsPage from './SlotDetailsPage'; // Import the new component

// const containerStyle = {
//   width: '100%',
//   height: '400px',
//   marginBottom: '20px'
// };

// const ParkingDashboard = () => {
//   const [address, setAddress] = useState('');
//   const [currentAddress, setCurrentAddress] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [parkingLots, setParkingLots] = useState([]);
//   const [parkingDetails, setParkingDetails] = useState(null);
//   const [error, setError] = useState('');
//   const [parkingCache, setParkingCache] = useState({});
//   const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 }); // Default to Bangalore center
//   const [selectedMarker, setSelectedMarker] = useState(null);
//   const [directions, setDirections] = useState(null);
//   const [currentView, setCurrentView] = useState('dashboard'); // New state for view tracking
//   const [selectedLot, setSelectedLot] = useState(null); // Store selected lot for slot details
//   const API_KEY = 'AIzaSyA-jENxjHL6pKatFQ_xtPw0BI2yB8WQYgw';

//   // Pre-fetch parking data for popular Bangalore areas on component mount
//   useEffect(() => {
//     const popularAreas = [
//       { name: "Kengeri, Bengaluru", lat: 12.8996, lng: 77.4827 },
//       { name: "Jayanagar, Bengaluru", lat: 12.9304, lng: 77.5834 },
//       { name: "Koramangala, Bengaluru", lat: 12.9352, lng: 77.6245 },
//       { name: "BMS College of Engineering, Bengaluru", lat: 12.9416, lng: 77.5656 }
//     ];

//     popularAreas.forEach(area => {
//       fetchParkingData(area.lat, area.lng, area.name, true);
//     });
//   }, []);

//   const checkLocationPermission = async () => {
//     try {
//       const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
//       return permissionStatus.state;
//     } catch (error) {
//       console.error("Error checking location permission:", error);
//       return 'denied';
//     }
//   };

//   const getCurrentLocation = async () => {
//     setLoading(true);
//     setError('');

//     if (!window.location.protocol.includes('https') && window.location.hostname !== 'localhost') {
//       setLoading(false);
//       setError('Location access requires a secure context (HTTPS). Please ensure the site is served over HTTPS.');
//       return;
//     }

//     if (!navigator.geolocation) {
//       setLoading(false);
//       setError('Geolocation is not supported by your browser.');
//       return;
//     }

//     const permissionStatus = await checkLocationPermission();
//     if (permissionStatus === 'denied') {
//       setLoading(false);
//       setError('Location access is denied. Please enable it in your browser settings to use this feature.');
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const { latitude, longitude } = position.coords;
//         setMapCenter({ lat: latitude, lng: longitude });
//         fetchAddressFromCoords(latitude, longitude);
//         fetchNearbyParkingLots(latitude, longitude);
//       },
//       (error) => {
//         setLoading(false);
//         let errorMessage = 'Error getting your location. Please try again or enter location manually.';
//         if (error.code === error.PERMISSION_DENIED) {
//           errorMessage = 'Location access was denied. Please allow location access in your browser settings.';
//         } else if (error.code === error.POSITION_UNAVAILABLE) {
//           errorMessage = 'Location information is unavailable. Please ensure location services are enabled on your device.';
//         } else if (error.code === error.TIMEOUT) {
//           errorMessage = 'The request to get your location timed out. Please try again.';
//         }
//         setError(errorMessage);
//         console.error("Geolocation error:", error);
//       },
//       { timeout: 10000, maximumAge: 60000 }
//     );
//   };

//   const fetchAddressFromCoords = async (latitude, longitude) => {
//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
//       );

//       const data = await response.json();

//       if (data.status === 'OK' && data.results.length > 0) {
//         setCurrentAddress(data.results[0].formatted_address);
//       } else {
//         setError('Could not fetch address for this location.');
//       }

//       setLoading(false);
//     } catch (error) {
//       setLoading(false);
//       setError('Error fetching address information.');
//       console.error("Geocoding error:", error);
//     }
//   };

//   const fetchParkingData = async (latitude, longitude, locationName, isPreFetch = false) => {
//     try {
//       let displayName = locationName;
//       let city = "Bengaluru";
//       if (!isPreFetch && currentAddress) {
//         const addressParts = currentAddress.split(',');
//         displayName = addressParts[0].trim();
//         city = addressParts[addressParts.length - 3]?.trim() || "Bengaluru";
//       }

//       const isBangalore = displayName.toLowerCase().includes('bengaluru') || 
//                          displayName.toLowerCase().includes('bangalore') || 
//                          city.toLowerCase().includes('bengaluru') || 
//                          city.toLowerCase().includes('bangalore');

//       if (!isBangalore && !isPreFetch) {
//         setParkingLots([]);
//         setParkingDetails(null);
//         setError('Please search for a location within Bangalore.');
//         setLoading(false);
//         return;
//       }

//       const now = new Date();
//       const hours = now.getHours();
//       const minutes = now.getMinutes();
//       const timestamp = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${hours >= 12 ? 'pm' : 'am'}`;
//       const isPeakHour = hours >= 8 && hours <= 18;
//       const baseAvailability = isPeakHour ? 0.3 : 0.7;

//       const isParkingDetailsSearch = address.toLowerCase().includes('parking details') || 
//                                     address.toLowerCase().includes('parking information');

//       if (isParkingDetailsSearch && !isPreFetch) {
//         let parkingDetailsData = {};
//         if (displayName.toLowerCase().includes('bms college')) {
//           parkingDetailsData = {
//             overview: "BMS College of Engineering in Bangalore offers various parking options for its students and staff. They have a dedicated parking lot within the campus for vehicles, including two-wheelers, and a separate area for faculty and staff. Additionally, there are public parking areas around the college for those who need them.",
//             onCampus: "BMS College has a designated parking area for students and staff within the campus. It's equipped with separate zones for two-wheelers and vehicles.",
//             facultyStaff: "A specific area is reserved for faculty and staff parking, ensuring their needs are met efficiently.",
//             public: "There are public parking areas available around the college for those who prefer to park their vehicles outside the campus.",
//             nearbyFacilities: "The college is located near National College Metro Station, making it accessible by public transport, according to Shiksha."
//           };
//         } else {
//           parkingDetailsData = {
//             overview: `${displayName} in Bangalore offers various parking options for its visitors. They have a dedicated parking lot within the premises for vehicles, including two-wheelers, and a separate area for staff. Additionally, there are public parking areas around the location for those who need them.`,
//             onCampus: `${displayName} has a designated parking area for visitors within the premises. It's equipped with separate zones for two-wheelers and vehicles.`,
//             facultyStaff: "A specific area is reserved for staff parking, ensuring their needs are met efficiently.",
//             public: "There are public parking areas available around the location for those who prefer to park their vehicles outside the premises.",
//             nearbyFacilities: "The location is accessible by public transport, with nearby metro stations and bus stops."
//           };
//         }

//         setParkingDetails(parkingDetailsData);
//         setParkingLots([]);
//         setLoading(false);
//         return;
//       }

//       let realTimeParkingLots = [];

//       if (displayName.toLowerCase().includes('kengeri')) {
//         realTimeParkingLots = [
//           {
//             id: 1,
//             name: "Kengeri Parking",
//             location: "A' road, 1st Main Rd, next to Platform No. 4",
//             postalCode: "096208 85280",
//             openHours: "Open 24 hours",
//             reviewText: '"This parking space is excellent!"',
//             rating: 4.8,
//             reviewCount: 12,
//             description: "Parking lot for motorcycles",
//             position: { lat: 12.8996, lng: 77.4827 },
//             availableTimings: "6:00 AM - 10:00 PM"
//           },
//           {
//             id: 2,
//             name: "Kengeri Bus Terminal",
//             location: "Paid parking available in Bus terminal next to station",
//             openHours: "",
//             reviewText: '"Paid parking available in Bus terminal next to station."',
//             rating: 4.5,
//             reviewCount: 374,
//             description: "Subway station",
//             position: { lat: 12.8998, lng: 77.4825 },
//             availableTimings: "24 hours"
//           },
//           {
//             id: 3,
//             name: "Kengeri Metro Station",
//             location: "133/2B",
//             postalCode: "080 2296 9300",
//             openHours: "Open · Closes 11pm",
//             reviewText: '"Have easy access to the parking and bus stops."',
//             rating: 4.5,
//             reviewCount: 6,
//             description: "Metropolitan train company",
//             position: { lat: 12.8994, lng: 77.4829 },
//             availableTimings: "5:00 AM - 11:00 PM"
//           }
//         ];
//       } else if (displayName.toLowerCase().includes('jayanagar')) {
//         realTimeParkingLots = [
//           {
//             id: 1,
//             name: "Jayanagar 4th Block Parking",
//             location: "Near 4th Block Market, Jayanagar, Bengaluru",
//             postalCode: "560011",
//             openHours: "Open 24 hours",
//             reviewText: '"Perfect for market visitors!"',
//             rating: 4.6,
//             reviewCount: 28,
//             description: "Parking lot",
//             position: { lat: 12.9304, lng: 77.5834 },
//             availableTimings: "24 hours"
//           },
//           {
//             id: 2,
//             name: "Jayanagar Metro Parking",
//             location: "Rashtreeya Vidyalaya Road, Jayanagar, Bengaluru",
//             postalCode: "560069",
//             openHours: "Open · Closes 11pm",
//             reviewText: '"Convenient for metro users."',
//             rating: 4.3,
//             reviewCount: 152,
//             description: "Metropolitan parking",
//             position: { lat: 12.9306, lng: 77.5832 },
//             availableTimings: "5:30 AM - 11:00 PM"
//           },
//           {
//             id: 3,
//             name: "Jayanagar Complex Parking",
//             location: "Jayanagar Shopping Complex, Bengaluru",
//             postalCode: "560041",
//             openHours: "Open · Closes 10pm",
//             reviewText: '"Great for shoppers, but can get crowded."',
//             rating: 4.2,
//             reviewCount: 89,
//             description: "Parking garage",
//             position: { lat: 12.9302, lng: 77.5836 },
//             availableTimings: "9:00 AM - 10:00 PM"
//           }
//         ];
//       } else if (displayName.toLowerCase().includes('koramangala')) {
//         realTimeParkingLots = [
//           {
//             id: 1,
//             name: "Koramangala 5th Block Parking",
//             location: "5th Block, Koramangala, Bengaluru",
//             postalCode: "560095",
//             openHours: "Open 24 hours",
//             reviewText: '"Ideal for nightlife visitors!"',
//             rating: 4.7,
//             reviewCount: 45,
//             description: "Parking lot",
//             position: { lat: 12.9352, lng: 77.6245 },
//             availableTimings: "24 hours"
//           },
//           {
//             id: 2,
//             name: "Koramangala Tech Park Parking",
//             location: "Near Ecospace Tech Park, Koramangala, Bengaluru",
//             postalCode: "560103",
//             openHours: "Open · Closes 9pm",
//             reviewText: '"Good for office commuters."',
//             rating: 4.4,
//             reviewCount: 210,
//             description: "Parking garage",
//             position: { lat: 12.9354, lng: 77.6243 },
//             availableTimings: "7:00 AM - 9:00 PM"
//           },
//           {
//             id: 3,
//             name: "Koramangala Club Road Parking",
//             location: "Club Road, Koramangala, Bengaluru",
//             postalCode: "560047",
//             openHours: "Open · Closes 11pm",
//             reviewText: '"Spacious and secure parking."',
//             rating: 4.5,
//             reviewCount: 33,
//             description: "Parking lot",
//             position: { lat: 12.9350, lng: 77.6247 },
//             availableTimings: "8:00 AM - 11:00 PM"
//           }
//         ];
//       } else if (displayName.toLowerCase().includes('bms college')) {
//         // Updated BMS College parking locations to match the image provided
//         realTimeParkingLots = [
//           {
//             id: 1,
//             name: "BMSCE Basement Parking",
//             location: "Bull Temple Road, Basavanagudi, Bengaluru",
//             postalCode: "560019",
//             openHours: "Open 24 hours",
//             reviewText: '"Convenient for students and staff."',
//             rating: 4.5,
//             reviewCount: 50,
//             description: "Parking lot",
//             position: { lat: 12.9416, lng: 77.5656 },
//             availableTimings: "7:00 AM - 8:00 PM",
//             distance: "5.8 km",
//             code: "WHR8+933"
//           },
//           {
//             id: 2,
//             name: "BMS College of Law Parking",
//             location: "Bull Temple Road, Basavanagudi, Bengaluru",
//             postalCode: "560019",
//             openHours: "Open · Closes 8pm",
//             reviewText: '"Great parking facility for law students."',
//             rating: 4.4,
//             reviewCount: 35,
//             description: "Parking lot for motorcycles",
//             position: { lat: 12.9420, lng: 77.5652 },
//             availableTimings: "7:00 AM - 8:00 PM",
//             distance: "6.0 km",
//             code: "WHR8+V7J"
//           },
//           {
//             id: 3,
//             name: "National College Metro Parking",
//             location: "Near National College Metro Station, Bengaluru",
//             postalCode: "560004",
//             openHours: "Open · Closes 11pm",
//             reviewText: '"Great for public parking near BMS College."',
//             rating: 4.3,
//             reviewCount: 28,
//             description: "Public parking",
//             position: { lat: 12.9414, lng: 77.5658 },
//             availableTimings: "5:00 AM - 11:00 PM"
//           }
//         ];
//       } else {
//         realTimeParkingLots = [
//           {
//             id: 1,
//             name: `${displayName} Central Parking`,
//             location: `Main Road, ${displayName}, Bengaluru`,
//             postalCode: Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
//             openHours: "Open 24 hours",
//             reviewText: '"Convenient parking spot in the heart of the area!"',
//             rating: 4.7,
//             reviewCount: Math.floor(Math.random() * 50) + 10,
//             description: "Parking lot",
//             position: { lat: latitude + (Math.random() * 0.002 - 0.001), lng: longitude + (Math.random() * 0.002 - 0.001) },
//             availableTimings: "24 hours"
//           },
//           {
//             id: 2,
//             name: `${displayName} Transit Hub Parking`,
//             location: `Near Transit Station, ${displayName}, Bengaluru`,
//             postalCode: Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
//             openHours: `Open · Closes ${isPeakHour ? '11pm' : '9pm'}`,
//             reviewText: '"Great for commuters, close to public transport."',
//             rating: 4.4,
//             reviewCount: Math.floor(Math.random() * 400) + 100,
//             description: "Parking garage",
//             position: { lat: latitude + (Math.random() * 0.002 - 0.001), lng: longitude + (Math.random() * 0.002 - 0.001) },
//             availableTimings: isPeakHour ? "6:00 AM - 11:00 PM" : "6:00 AM - 9:00 PM"
//           },
//           {
//             id: 3,
//             name: `${displayName} Metro Parking`,
//             location: `Metro Station Road, ${displayName}, Bengaluru`,
//             postalCode: `080 ${Math.floor(Math.random() * 10000)} ${Math.floor(Math.random() * 10000)}`,
//             openHours: "Open · Closes 11pm",
//             reviewText: '"Easy access to metro and nearby amenities."',
//             rating: 4.5,
//             reviewCount: Math.floor(Math.random() * 20) + 5,
//             description: "Metropolitan parking",
//             position: { lat: latitude + (Math.random() * 0.002 - 0.001), lng: longitude + (Math.random() * 0.002 - 0.001) },
//             availableTimings: "5:30 AM - 11:00 PM"
//           }
//         ];
//       }

//       realTimeParkingLots.forEach(lot => {
//         const availability = Math.random() < baseAvailability ? "Available" : "Limited Availability";
//         lot.realTimeStatus = `${availability} as of ${timestamp}`;
//       });

//       const cacheKey = displayName.toLowerCase();
//       setParkingCache(prev => ({
//         ...prev,
//         [cacheKey]: realTimeParkingLots
//       }));

//       if (!isPreFetch) {
//         setTimeout(() => {
//           setParkingLots(realTimeParkingLots);
//           setParkingDetails(null);
//           setMapCenter({ lat: latitude, lng: longitude });
//           setLoading(false);
//         }, 1000);
//       }

//     } catch (error) {
//       if (!isPreFetch) {
//         setLoading(false);
//         console.error("Error fetching parking lots:", error);
//       }
//     }
//   };

//   const fetchNearbyParkingLots = async (latitude, longitude) => {
//     const cacheKey = currentAddress.split(',')[0]?.trim().toLowerCase();
//     if (parkingCache[cacheKey]) {
//       setParkingLots(parkingCache[cacheKey]);
//       setParkingDetails(null);
//       setMapCenter({ lat: latitude, lng: longitude });
//       setLoading(false);
//       return;
//     }

//     await fetchParkingData(latitude, longitude);
//   };

//   const handleAddressSearch = async () => {
//     if (!address.trim()) return;

//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch(
//         `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
//       );

//       const data = await response.json();

//       if (data.status === 'OK' && data.results.length > 0) {
//         const { lat, lng } = data.results[0].geometry.location;
//         setCurrentAddress(data.results[0].formatted_address);

//         const cacheKey = data.results[0].formatted_address.split(',')[0]?.trim().toLowerCase();
//         if (parkingCache[cacheKey]) {
//           const isParkingDetailsSearch = address.toLowerCase().includes('parking details') || 
//                                         address.toLowerCase().includes('parking information');
//           if (isParkingDetailsSearch) {
//             await fetchParkingData(lat, lng, data.results[0].formatted_address.split(',')[0]?.trim());
//           } else {
//             setParkingLots(parkingCache[cacheKey]);
//             setParkingDetails(null);
//             setMapCenter({ lat: lat, lng: lng });
//             setLoading(false);
//           }
//         } else {
//           await fetchParkingData(lat, lng, data.results[0].formatted_address.split(',')[0]?.trim());
//         }
//       } else {
//         setError('Could not find this location. Please try a different address.');
//         setLoading(false);
//       }
//     } catch (error) {
//       setLoading(false);
//       setError('Error searching for this address.');
//       console.error("Address search error:", error);
//     }
//   };

//   // Function to get directions
//   const getDirections = (destinationLot) => {
//     if (!currentAddress) {
//       setError('Please set your current location first to get directions.');
//       return;
//     }
    
//     setLoading(true);
//     setError('');
    
//     // Clear any existing directions
//     setDirections(null);
    
//     // Create DirectionsService instance
//     const directionsService = new window.google.maps.DirectionsService();
    
//     // Create request for directions
//     directionsService.route(
//       {
//         origin: mapCenter,
//         destination: destinationLot.position,
//         travelMode: window.google.maps.TravelMode.DRIVING,
//       },
//       (result, status) => {
//         setLoading(false);
        
//         if (status === window.google.maps.DirectionsStatus.OK) {
//           setDirections(result);
//           setSelectedMarker(null); // Close any open info windows
//         } else {
//           setError('Could not calculate directions. Please try again.');
//           console.error(`Directions request failed: ${status}`);
//         }
//       }
//     );
//   };

//   // Function to navigate to slot details page
//   const viewSlotDetails = (lot) => {
//     setSelectedLot(lot);
//     setCurrentView('slotDetails');
//   };

//   // Function to return to dashboard from slot details
//   const returnToDashboard = () => {
//     setCurrentView('dashboard');
//     setSelectedLot(null);
//   };

//   const renderRating = (rating) => {
//     const stars = [];
//     const fullStars = Math.floor(rating);
//     const hasHalfStar = rating % 1 !== 0;

//     for (let i = 0; i < fullStars; i++) {
//       stars.push(<Star key={`full-${i}`} className="star star-filled" size={16} />);
//     }

//     if (hasHalfStar) {
//       stars.push(
//         <div key="half" className="star-half">
//           <Star className="star" size={16} />
//           <Star className="star star-half-filled" size={16} style={{ clipPath: 'inset(0 50% 0 0)' }} />
//         </div>
//       );
//     }

//     const emptyStars = 5 - stars.length;
//     for (let i = 0; i < emptyStars; i++) {
//       stars.push(<Star key={`empty-${i}`} className="star" size={16} />);
//     }

//     return <div className="star-rating">{stars}</div>;
//   };

//   const onLoad = useCallback((map) => {
//     const bounds = new window.google.maps.LatLngBounds();
//     parkingLots.forEach(lot => {
//       if (lot.position) {
//         bounds.extend(lot.position);
//       }
//     });
//     if (parkingLots.length > 0) {
//       map.fitBounds(bounds);
//     }
//   }, [parkingLots]);

//   // Function to clear directions and return to normal view
//   const clearDirections = () => {
//     setDirections(null);
//   };

//   // Render the appropriate view based on currentView state
//   if (currentView === 'slotDetails') {
//     return (
//       <SlotDetailsPage 
//         lot={selectedLot} 
//         onReturn={returnToDashboard} 
//       />
//     );
//   }

//   return (
//     <div className="parking-dashboard">
//       <div className="dashboard-header">
//         <h1>Parking System</h1>
//       </div>

//       <div className="search-section">
//         <div className="search-input-container">
//           <input
//             type="text"
//             value={address}
//             onChange={(e) => setAddress(e.target.value)}
//             placeholder="Enter location in Bangalore to find parking"
//             className="search-input"
//           />
//           <button 
//             onClick={handleAddressSearch}
//             className="search-button"
//             disabled={loading}
//           >
//             <Search size={20} />
//           </button>
//         </div>

//         <button
//           onClick={getCurrentLocation}
//           className="location-button"
//           disabled={loading}
//         >
//           <Navigation size={18} />
//           Use Current Location
//         </button>
//       </div>

//       {currentAddress && (
//         <div className="current-location">
//           <h2>
//             <MapPin size={20} />
//             Current Location
//           </h2>
//           <p>{currentAddress}</p>
//         </div>
//       )}

//       {error && (
//         <div className="error-message">
//           {error}
//         </div>
//       )}

//       {loading && (
//         <div className="loading-container">
//           <div className="loading-spinner"></div>
//         </div>
//       )}

//       {(parkingLots.length > 0 || parkingDetails || directions) && (
//         <LoadScript googleMapsApiKey={API_KEY}>
//           <GoogleMap
//             mapContainerStyle={containerStyle}
//             center={mapCenter}
//             zoom={15}
//             onLoad={onLoad}
//           >
//             {!directions && parkingLots.map(lot => (
//               lot.position && (
//                 <Marker
//                   key={lot.id}
//                   position={lot.position}
//                   onClick={() => setSelectedMarker(lot)}
//                 />
//               )
//             ))}
            
//             {selectedMarker && !directions && (
//               <InfoWindow
//                 position={selectedMarker.position}
//                 onCloseClick={() => setSelectedMarker(null)}
//               >
//                 <div>
//                   <h3>{selectedMarker.name}</h3>
//                   <p>{selectedMarker.location}</p>
//                   <p>{selectedMarker.realTimeStatus}</p>
//                 </div>
//               </InfoWindow>
//             )}
            
//             {directions && (
//               <DirectionsRenderer
//                 directions={directions}
//                 options={{
//                   polylineOptions: {
//                     strokeColor: '#4285F4',
//                     strokeWeight: 5,
//                   },
//                 }}
//               />
//             )}
//           </GoogleMap>
//         </LoadScript>
//       )}

//       {directions && (
//         <div className="directions-controls">
//           <button 
//             onClick={clearDirections}
//             className="back-button"
//           >
//             Back to Parking Lots
//           </button>
//         </div>
//       )}

//       {parkingDetails && !directions && (
//         <div className="parking-details-section">
//           <h2>Parking Details</h2>
//           <div className="parking-details-content">
//             <h3>Overview</h3>
//             <p>{parkingDetails.overview}</p>
//             <h3>Detailed Parking Information:</h3>
//             <h4>On-Campus Parking:</h4>
//             <p>{parkingDetails.onCampus}</p>
//             <h4>Faculty/Staff Parking:</h4>
//             <p>{parkingDetails.facultyStaff}</p>
//             <h4>Public Parking:</h4>
//             <p>{parkingDetails.public}</p>
//             <h4>Nearby Facilities:</h4>
//             <p>{parkingDetails.nearbyFacilities}</p>
//           </div>
//         </div>
//       )}

//       {parkingLots.length > 0 && !parkingDetails && !directions && (
//         <div className="parking-lots-section">
//           {parkingLots.map((lot) => (
//             <div key={lot.id} className="parking-lot-card">
//               <div className="lot-header">
//                 <h3 className="lot-name">{lot.name}</h3>
//                 <div className="lot-rating">
//                   {renderRating(lot.rating)}
//                   <span className="rating-value">{lot.rating}</span>
//                   <span className="review-count">({lot.reviewCount})</span>
//                   <span className="lot-description">· {lot.description}</span>
//                 </div>

//                 <div className="lot-address">
//                   <p className="lot-location">{lot.location}</p>
//                   {lot.postalCode && <p className="lot-postal-code">{lot.postalCode}</p>}
//                   {lot.distance && <p className="lot-distance">{lot.distance} · {lot.code}</p>}
//                 </div>

//                 {lot.openHours && <p className="open-hours">{lot.openHours}</p>}
//                 {lot.realTimeStatus && <p className="real-time-status">{lot.realTimeStatus}</p>}

//                 {lot.reviewText && (
//                   <div className="review-text">
//                     <div className="reviewer-icon">
//                       <span>🧑</span>
//                     </div>
//                     <p>{lot.reviewText}</p>
//                   </div>
//                 )}
//               </div>

//               <div className="lot-action-buttons">
                
//                 <button 
//                   className="view-slots-btn"
//                   onClick={() => viewSlotDetails(lot)}
//                 >
//                   <Clock size={16} />
//                   View Slots
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {(parkingLots.length > 0 || parkingDetails) && !directions && (
//         <div className="more-places">
//           {/* <button>MORE PLACES</button> */}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ParkingDashboard;



import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { Search, MapPin, Star, Navigation, Clock, ArrowLeft } from 'lucide-react';
import '../styles/Dashboard.css';
import SlotDetailsPage from './SlotDetailsPage'; // Import the new component

const containerStyle = {
  width: '100%',
  height: '400px',
  marginBottom: '20px'
};

const ParkingDashboard = () => {
  const [address, setAddress] = useState('');
  const [currentAddress, setCurrentAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [parkingLots, setParkingLots] = useState([]);
  const [parkingDetails, setParkingDetails] = useState(null);
  const [error, setError] = useState('');
  const [parkingCache, setParkingCache] = useState({});
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 }); // Default to Bangalore center
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [directions, setDirections] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // New state for view tracking
  const [selectedLot, setSelectedLot] = useState(null); // Store selected lot for slot details
  const API_KEY = 'AIzaSyA-jENxjHL6pKatFQ_xtPw0BI2yB8WQYgw';

  // Pre-fetch parking data for popular Bangalore areas on component mount
  useEffect(() => {
    const popularAreas = [
      { name: "Kengeri, Bengaluru", lat: 12.8996, lng: 77.4827 },
      { name: "Jayanagar, Bengaluru", lat: 12.9304, lng: 77.5834 },
      { name: "Koramangala, Bengaluru", lat: 12.9352, lng: 77.6245 },
      { name: "BMS College of Engineering, Bengaluru", lat: 12.9416, lng: 77.5656 }
    ];

    popularAreas.forEach(area => {
      fetchParkingData(area.lat, area.lng, area.name, true);
    });
  }, []);

  const checkLocationPermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
      return permissionStatus.state;
    } catch (error) {
      console.error("Error checking location permission:", error);
      return 'denied';
    }
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    setError('');

    if (!window.location.protocol.includes('https') && window.location.hostname !== 'localhost') {
      setLoading(false);
      setError('Location access requires a secure context (HTTPS). Please ensure the site is served over HTTPS.');
      return;
    }

    if (!navigator.geolocation) {
      setLoading(false);
      setError('Geolocation is not supported by your browser.');
      return;
    }

    const permissionStatus = await checkLocationPermission();
    if (permissionStatus === 'denied') {
      setLoading(false);
      setError('Location access is denied. Please enable it in your browser settings to use this feature.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setMapCenter({ lat: latitude, lng: longitude });
        fetchAddressFromCoords(latitude, longitude);
        fetchNearbyParkingLots(latitude, longitude);
      },
      (error) => {
        setLoading(false);
        let errorMessage = 'Error getting your location. Please try again or enter location manually.';
        if (error.code === error.PERMISSION_DENIED) {
          errorMessage = 'Location access was denied. Please allow location access in your browser settings.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMessage = 'Location information is unavailable. Please ensure location services are enabled on your device.';
        } else if (error.code === error.TIMEOUT) {
          errorMessage = 'The request to get your location timed out. Please try again.';
        }
        setError(errorMessage);
        console.error("Geolocation error:", error);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  };

  const fetchAddressFromCoords = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${API_KEY}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        setCurrentAddress(data.results[0].formatted_address);
      } else {
        setError('Could not fetch address for this location.');
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError('Error fetching address information.');
      console.error("Geocoding error:", error);
    }
  };

  const fetchParkingData = async (latitude, longitude, locationName, isPreFetch = false) => {
    try {
      let displayName = locationName;
      let city = "Bengaluru";
      if (!isPreFetch && currentAddress) {
        const addressParts = currentAddress.split(',');
        displayName = addressParts[0].trim();
        city = addressParts[addressParts.length - 3]?.trim() || "Bengaluru";
      }

      const isBangalore = displayName.toLowerCase().includes('bengaluru') || 
                         displayName.toLowerCase().includes('bangalore') || 
                         city.toLowerCase().includes('bengaluru') || 
                         city.toLowerCase().includes('bangalore');

      if (!isBangalore && !isPreFetch) {
        setParkingLots([]);
        setParkingDetails(null);
        setError('Please search for a location within Bangalore.');
        setLoading(false);
        return;
      }

      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const timestamp = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${hours >= 12 ? 'pm' : 'am'}`;
      const isPeakHour = hours >= 8 && hours <= 18;
      const baseAvailability = isPeakHour ? 0.3 : 0.7;

      const isParkingDetailsSearch = address.toLowerCase().includes('parking details') || 
                                    address.toLowerCase().includes('parking information');

      if (isParkingDetailsSearch && !isPreFetch) {
        let parkingDetailsData = {};
        if (displayName.toLowerCase().includes('bms college')) {
          parkingDetailsData = {
            overview: "BMS College of Engineering in Bangalore offers various parking options for its students and staff. They have a dedicated parking lot within the campus for vehicles, including two-wheelers, and a separate area for faculty and staff. Additionally, there are public parking areas around the college for those who need them.",
            onCampus: "BMS College has a designated parking area for students and staff within the campus. It's equipped with separate zones for two-wheelers and vehicles.",
            facultyStaff: "A specific area is reserved for faculty and staff parking, ensuring their needs are met efficiently.",
            public: "There are public parking areas available around the college for those who prefer to park their vehicles outside the campus.",
            nearbyFacilities: "The college is located near National College Metro Station, making it accessible by public transport, according to Shiksha."
          };
        } else {
          parkingDetailsData = {
            overview: `${displayName} in Bangalore offers various parking options for its visitors. They have a dedicated parking lot within the premises for vehicles, including two-wheelers, and a separate area for staff. Additionally, there are public parking areas around the location for those who need them.`,
            onCampus: `${displayName} has a designated parking area for visitors within the premises. It's equipped with separate zones for two-wheelers and vehicles.`,
            facultyStaff: "A specific area is reserved for staff parking, ensuring their needs are met efficiently.",
            public: "There are public parking areas available around the location for those who prefer to park their vehicles outside the premises.",
            nearbyFacilities: "The location is accessible by public transport, with nearby metro stations and bus stops."
          };
        }

        setParkingDetails(parkingDetailsData);
        setParkingLots([]);
        setLoading(false);
        return;
      }

      let realTimeParkingLots = [];

      if (displayName.toLowerCase().includes('kengeri')) {
        realTimeParkingLots = [
          {
            id: 1,
            name: "Kengeri Parking",
            location: "A' road, 1st Main Rd, next to Platform No. 4",
            postalCode: "096208 85280",
            openHours: "Open 24 hours",
            reviewText: '"This parking space is excellent!"',
            rating: 4.8,
            reviewCount: 12,
            description: "Parking lot for motorcycles",
            position: { lat: 12.8996, lng: 77.4827 },
            availableTimings: "6:00 AM - 10:00 PM"
          },
          {
            id: 2,
            name: "Kengeri Bus Terminal",
            location: "Paid parking available in Bus terminal next to station",
            openHours: "",
            reviewText: '"Paid parking available in Bus terminal next to station."',
            rating: 4.5,
            reviewCount: 374,
            description: "Subway station",
            position: { lat: 12.8998, lng: 77.4825 },
            availableTimings: "24 hours"
          },
          {
            id: 3,
            name: "Kengeri Metro Station",
            location: "133/2B",
            postalCode: "080 2296 9300",
            openHours: "Open · Closes 11pm",
            reviewText: '"Have easy access to the parking and bus stops."',
            rating: 4.5,
            reviewCount: 6,
            description: "Metropolitan train company",
            position: { lat: 12.8994, lng: 77.4829 },
            availableTimings: "5:00 AM - 11:00 PM"
          }
        ];
      } else if (displayName.toLowerCase().includes('jayanagar')) {
        realTimeParkingLots = [
          {
            id: 1,
            name: "Jayanagar 4th Block Parking",
            location: "Near 4th Block Market, Jayanagar, Bengaluru",
            postalCode: "560011",
            openHours: "Open 24 hours",
            reviewText: '"Perfect for market visitors!"',
            rating: 4.6,
            reviewCount: 28,
            description: "Parking lot",
            position: { lat: 12.9304, lng: 77.5834 },
            availableTimings: "24 hours"
          },
          {
            id: 2,
            name: "Jayanagar Metro Parking",
            location: "Rashtreeya Vidyalaya Road, Jayanagar, Bengaluru",
            postalCode: "560069",
            openHours: "Open · Closes 11pm",
            reviewText: '"Convenient for metro users."',
            rating: 4.3,
            reviewCount: 152,
            description: "Metropolitan parking",
            position: { lat: 12.9306, lng: 77.5832 },
            availableTimings: "5:30 AM - 11:00 PM"
          },
          {
            id: 3,
            name: "Jayanagar Complex Parking",
            location: "Jayanagar Shopping Complex, Bengaluru",
            postalCode: "560041",
            openHours: "Open · Closes 10pm",
            reviewText: '"Great for shoppers, but can get crowded."',
            rating: 4.2,
            reviewCount: 89,
            description: "Parking garage",
            position: { lat: 12.9302, lng: 77.5836 },
            availableTimings: "9:00 AM - 10:00 PM"
          }
        ];
      } else if (displayName.toLowerCase().includes('koramangala')) {
        realTimeParkingLots = [
          {
            id: 1,
            name: "Koramangala 5th Block Parking",
            location: "5th Block, Koramangala, Bengaluru",
            postalCode: "560095",
            openHours: "Open 24 hours",
            reviewText: '"Ideal for nightlife visitors!"',
            rating: 4.7,
            reviewCount: 45,
            description: "Parking lot",
            position: { lat: 12.9352, lng: 77.6245 },
            availableTimings: "24 hours"
          },
          {
            id: 2,
            name: "Koramangala Tech Park Parking",
            location: "Near Ecospace Tech Park, Koramangala, Bengaluru",
            postalCode: "560103",
            openHours: "Open · Closes 9pm",
            reviewText: '"Good for office commuters."',
            rating: 4.4,
            reviewCount: 210,
            description: "Parking garage",
            position: { lat: 12.9354, lng: 77.6243 },
            availableTimings: "7:00 AM - 9:00 PM"
          },
          {
            id: 3,
            name: "Koramangala Club Road Parking",
            location: "Club Road, Koramangala, Bengaluru",
            postalCode: "560047",
            openHours: "Open · Closes 11pm",
            reviewText: '"Spacious and secure parking."',
            rating: 4.5,
            reviewCount: 33,
            description: "Parking lot",
            position: { lat: 12.9350, lng: 77.6247 },
            availableTimings: "8:00 AM - 11:00 PM"
          }
        ];
      } else if (displayName.toLowerCase().includes('bms college')) {
        // Updated BMS College parking locations to match the image provided
        realTimeParkingLots = [
          {
            id: 1,
            name: "BMSCE Basement Parking",
            location: "Bull Temple Road, Basavanagudi, Bengaluru",
            postalCode: "560019",
            openHours: "Open 24 hours",
            reviewText: '"Convenient for students and staff."',
            rating: 4.5,
            reviewCount: 50,
            description: "Parking lot",
            position: { lat: 12.9416, lng: 77.5656 },
            availableTimings: "7:00 AM - 8:00 PM",
            distance: "5.8 km",
            code: "WHR8+933"
          },
          {
            id: 2,
            name: "BMS College of Law Parking",
            location: "Bull Temple Road, Basavanagudi, Bengaluru",
            postalCode: "560019",
            openHours: "Open · Closes 8pm",
            reviewText: '"Great parking facility for law students."',
            rating: 4.4,
            reviewCount: 35,
            description: "Parking lot for motorcycles",
            position: { lat: 12.9420, lng: 77.5652 },
            availableTimings: "7:00 AM - 8:00 PM",
            distance: "6.0 km",
            code: "WHR8+V7J"
          },
          {
            id: 3,
            name: "National College Metro Parking",
            location: "Near National College Metro Station, Bengaluru",
            postalCode: "560004",
            openHours: "Open · Closes 11pm",
            reviewText: '"Great for public parking near BMS College."',
            rating: 4.3,
            reviewCount: 28,
            description: "Public parking",
            position: { lat: 12.9414, lng: 77.5658 },
            availableTimings: "5:00 AM - 11:00 PM"
          }
        ];
      } else {
        realTimeParkingLots = [
          {
            id: 1,
            name: `${displayName} Central Parking`,
            location: `Main Road, ${displayName}, Bengaluru`,
            postalCode: Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
            openHours: "Open 24 hours",
            reviewText: '"Convenient parking spot in the heart of the area!"',
            rating: 4.7,
            reviewCount: Math.floor(Math.random() * 50) + 10,
            description: "Parking lot",
            position: { lat: latitude + (Math.random() * 0.002 - 0.001), lng: longitude + (Math.random() * 0.002 - 0.001) },
            availableTimings: "24 hours"
          },
          {
            id: 2,
            name: `${displayName} Transit Hub Parking`,
            location: `Near Transit Station, ${displayName}, Bengaluru`,
            postalCode: Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
            openHours: `Open · Closes ${isPeakHour ? '11pm' : '9pm'}`,
            reviewText: '"Great for commuters, close to public transport."',
            rating: 4.4,
            reviewCount: Math.floor(Math.random() * 400) + 100,
            description: "Parking garage",
            position: { lat: latitude + (Math.random() * 0.002 - 0.001), lng: longitude + (Math.random() * 0.002 - 0.001) },
            availableTimings: isPeakHour ? "6:00 AM - 11:00 PM" : "6:00 AM - 9:00 PM"
          },
          {
            id: 3,
            name: `${displayName} Metro Parking`,
            location: `Metro Station Road, ${displayName}, Bengaluru`,
            postalCode: `080 ${Math.floor(Math.random() * 10000)} ${Math.floor(Math.random() * 10000)}`,
            openHours: "Open · Closes 11pm",
            reviewText: '"Easy access to metro and nearby amenities."',
            rating: 4.5,
            reviewCount: Math.floor(Math.random() * 20) + 5,
            description: "Metropolitan parking",
            position: { lat: latitude + (Math.random() * 0.002 - 0.001), lng: longitude + (Math.random() * 0.002 - 0.001) },
            availableTimings: "5:30 AM - 11:00 PM"
          }
        ];
      }

      realTimeParkingLots.forEach(lot => {
        const availability = Math.random() < baseAvailability ? "Available" : "Limited Availability";
        lot.realTimeStatus = `${availability} as of ${timestamp}`;
      });

      const cacheKey = displayName.toLowerCase();
      setParkingCache(prev => ({
        ...prev,
        [cacheKey]: realTimeParkingLots
      }));

      if (!isPreFetch) {
        setTimeout(() => {
          setParkingLots(realTimeParkingLots);
          setParkingDetails(null);
          setMapCenter({ lat: latitude, lng: longitude });
          setLoading(false);
        }, 1000);
      }

    } catch (error) {
      if (!isPreFetch) {
        setLoading(false);
        console.error("Error fetching parking lots:", error);
      }
    }
  };

  const fetchNearbyParkingLots = async (latitude, longitude) => {
    const cacheKey = currentAddress.split(',')[0]?.trim().toLowerCase();
    if (parkingCache[cacheKey]) {
      setParkingLots(parkingCache[cacheKey]);
      setParkingDetails(null);
      setMapCenter({ lat: latitude, lng: longitude });
      setLoading(false);
      return;
    }

    await fetchParkingData(latitude, longitude);
  };

  const handleAddressSearch = async () => {
    if (!address.trim()) return;

    setLoading(true);
    setError('');

    // Special case for "bms college" - bypass the geocoding API
    if (address.toLowerCase().includes('bms college')) {
      // Use hardcoded coordinates for BMS College
      const lat = 12.9416;
      const lng = 77.5656;
      setCurrentAddress("BMS College of Engineering, Bull Temple Rd, Bengaluru, Karnataka 560019");
      setMapCenter({ lat, lng });
      
      // Directly use the hardcoded data for BMS college
      await fetchParkingData(lat, lng, "BMS College of Engineering");
      return;
    }

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setCurrentAddress(data.results[0].formatted_address);

        const cacheKey = data.results[0].formatted_address.split(',')[0]?.trim().toLowerCase();
        if (parkingCache[cacheKey]) {
          const isParkingDetailsSearch = address.toLowerCase().includes('parking details') || 
                                        address.toLowerCase().includes('parking information');
          if (isParkingDetailsSearch) {
            await fetchParkingData(lat, lng, data.results[0].formatted_address.split(',')[0]?.trim());
          } else {
            setParkingLots(parkingCache[cacheKey]);
            setParkingDetails(null);
            setMapCenter({ lat: lat, lng: lng });
            setLoading(false);
          }
        } else {
          await fetchParkingData(lat, lng, data.results[0].formatted_address.split(',')[0]?.trim());
        }
      } else {
        setError('Could not find this location. Please try a different address.');
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      setError('Error searching for this address.');
      console.error("Address search error:", error);
    }
  };

  // Function to get directions
  const getDirections = (destinationLot) => {
    if (!currentAddress) {
      setError('Please set your current location first to get directions.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    // Clear any existing directions
    setDirections(null);
    
    // Create DirectionsService instance
    const directionsService = new window.google.maps.DirectionsService();
    
    // Create request for directions
    directionsService.route(
      {
        origin: mapCenter,
        destination: destinationLot.position,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        setLoading(false);
        
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          setSelectedMarker(null); // Close any open info windows
        } else {
          setError('Could not calculate directions. Please try again.');
          console.error(`Directions request failed: ${status}`);
        }
      }
    );
  };

  // Function to navigate to slot details page
  const viewSlotDetails = (lot) => {
    setSelectedLot(lot);
    setCurrentView('slotDetails');
  };

  // Function to return to dashboard from slot details
  const returnToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedLot(null);
  };

  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="star star-filled" size={16} />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="star-half">
          <Star className="star" size={16} />
          <Star className="star star-half-filled" size={16} style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </div>
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="star" size={16} />);
    }

    return <div className="star-rating">{stars}</div>;
  };

  const onLoad = useCallback((map) => {
    const bounds = new window.google.maps.LatLngBounds();
    parkingLots.forEach(lot => {
      if (lot.position) {
        bounds.extend(lot.position);
      }
    });
    if (parkingLots.length > 0) {
      map.fitBounds(bounds);
    }
  }, [parkingLots]);

  // Function to clear directions and return to normal view
  const clearDirections = () => {
    setDirections(null);
  };

  // Render the appropriate view based on currentView state
  if (currentView === 'slotDetails') {
    return (
      <SlotDetailsPage 
        lot={selectedLot} 
        onReturn={returnToDashboard} 
      />
    );
  }

  return (
    <div className="parking-dashboard">
      <div className="dashboard-header">
        <h1>Parking System</h1>
      </div>

      <div className="search-section">
        <div className="search-input-container">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter location in Bangalore to find parking"
            className="search-input"
          />
          <button 
            onClick={handleAddressSearch}
            className="search-button"
            disabled={loading}
          >
            <Search size={20} />
          </button>
        </div>

        <button
          onClick={getCurrentLocation}
          className="location-button"
          disabled={loading}
        >
          <Navigation size={18} />
          Use Current Location
        </button>
      </div>

      {currentAddress && (
        <div className="current-location">
          <h2>
            <MapPin size={20} />
            Location
          </h2>
          <p>{currentAddress}</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      )}

      {(parkingLots.length > 0 || parkingDetails || directions) && (
        <LoadScript googleMapsApiKey={API_KEY}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={15}
            onLoad={onLoad}
          >
            {!directions && parkingLots.map(lot => (
              lot.position && (
                <Marker
                  key={lot.id}
                  position={lot.position}
                  onClick={() => setSelectedMarker(lot)}
                />
              )
            ))}
            
            {selectedMarker && !directions && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div>
                  <h3>{selectedMarker.name}</h3>
                  <p>{selectedMarker.location}</p>
                  <p>{selectedMarker.realTimeStatus}</p>
                </div>
              </InfoWindow>
            )}
            
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  polylineOptions: {
                    strokeColor: '#4285F4',
                    strokeWeight: 5,
                  },
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      )}

      {directions && (
        <div className="directions-controls">
          <button 
            onClick={clearDirections}
            className="back-button"
          >
            Back to Parking Lots
          </button>
        </div>
      )}

      {parkingDetails && !directions && (
        <div className="parking-details-section">
          <h2>Parking Details</h2>
          <div className="parking-details-content">
            <h3>Overview</h3>
            <p>{parkingDetails.overview}</p>
            <h3>Detailed Parking Information:</h3>
            <h4>On-Campus Parking:</h4>
            <p>{parkingDetails.onCampus}</p>
            <h4>Faculty/Staff Parking:</h4>
            <p>{parkingDetails.facultyStaff}</p>
            <h4>Public Parking:</h4>
            <p>{parkingDetails.public}</p>
            <h4>Nearby Facilities:</h4>
            <p>{parkingDetails.nearbyFacilities}</p>
          </div>
        </div>
      )}

      {parkingLots.length > 0 && !parkingDetails && !directions && (
        <div className="parking-lots-section">
          {parkingLots.map((lot) => (
            <div key={lot.id} className="parking-lot-card">
              <div className="lot-header">
                <h3 className="lot-name">{lot.name}</h3>
                <div className="lot-rating">
                  {renderRating(lot.rating)}
                  <span className="rating-value">{lot.rating}</span>
                  <span className="review-count">({lot.reviewCount})</span>
                  <span className="lot-description">· {lot.description}</span>
                </div>

                <div className="lot-address">
                  <p className="lot-location">{lot.location}</p>
                  {lot.postalCode && <p className="lot-postal-code">{lot.postalCode}</p>}
                  {lot.distance && <p className="lot-distance">{lot.distance} · {lot.code}</p>}
                </div>

                {lot.openHours && <p className="open-hours">{lot.openHours}</p>}
                {lot.realTimeStatus && <p className="real-time-status">{lot.realTimeStatus}</p>}

                {lot.reviewText && (
                  <div className="review-text">
                    <div className="reviewer-icon">
                      <span>🧑</span>
                    </div>
                    <p>{lot.reviewText}</p>
                  </div>
                )}
              </div>

              <div className="lot-action-buttons">
                <button 
                  className="view-slots-btn"
                  onClick={() => viewSlotDetails(lot)}
                >
                  <Clock size={16} />
                  View Slots
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(parkingLots.length > 0 || parkingDetails) && !directions && (
        <div className="more-places">
          {/* <button>MORE PLACES</button> */}
        </div>
      )}
    </div>
  );
};

export default ParkingDashboard;