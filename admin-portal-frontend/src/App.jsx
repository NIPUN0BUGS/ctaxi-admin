import React, { useState } from 'react';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import DriverForm from './components/DriverForm';
import LoginForm from './pages/Login';
import AdminLayout from './common/AdminLayout';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginForm onLogin={(username, password) => handleLogin(username, password, setIsLoggedIn)} />} />
        <Route 
          path="/admin" 
          element={
            isLoggedIn ? (
              <AdminLayout>
                <DriverForm />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

// Create a separate LoginHandler component to manage navigation
const LoginHandler = ({ onLogin, setIsLoggedIn }) => {
  const navigate = useNavigate(); // Use useNavigate here

  const handleLogin = (username, password) => {
    console.log('Logging in with:', username, password);

    if (username === '123' && password === '123') {
      setIsLoggedIn(true); // Set logged-in state to true
      navigate('/admin'); // Navigate to admin
    } else {
      alert('Invalid credentials'); // Handle login failure
    }
  };

  return <LoginForm onLogin={handleLogin} />;
};

const AppWrapper = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<LoginHandler onLogin={(username, password) => handleLogin(username, password, setIsLoggedIn)} setIsLoggedIn={setIsLoggedIn} />} />
        <Route 
          path="/admin" 
          element={
            isLoggedIn ? (
              <AdminLayout>
                <DriverForm />
              </AdminLayout>
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default AppWrapper;
