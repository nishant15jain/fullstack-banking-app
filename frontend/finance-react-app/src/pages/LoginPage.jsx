import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  const location = useLocation();
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if there's a success message from registration
    if (location.state?.message) {
      setMessage(location.state.message);
      // Clear the message after 5 seconds
      setTimeout(() => setMessage(''), 5000);
    }
  }, [location.state]);

  return (
    <div>
      {message && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#d4edda',
          color: '#155724',
          padding: '12px 16px',
          borderRadius: '6px',
          border: '1px solid #c3e6cb',
          zIndex: 1000,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          {message}
        </div>
      )}
      <LoginForm />
    </div>
  );
};

export default LoginPage;
