import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthContainer = () => {
  const [currentPage, setCurrentPage] = useState('login'); // 'login' or 'register'
  
  const handleSwitch = () => {
    setCurrentPage(currentPage === 'login' ? 'register' : 'login');
  };
  
  return (
    <div>
      {currentPage === 'login' ? (
        <Login onSwitch={handleSwitch} />
      ) : (
        <Register onSwitch={handleSwitch} />
      )}
    </div>
  );
};

export default AuthContainer;