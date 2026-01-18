import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import PaymentList from './pages/PaymentList';
import PaymentRequest from './pages/PaymentRequest';
import PaymentTest from './pages/PaymentTest';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route 
                path="/payments" 
                element={
                  <PrivateRoute>
                    <PaymentList />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/payments/request" 
                element={
                  <PrivateRoute>
                    <PaymentRequest />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/payments/test" 
                element={
                  <PrivateRoute>
                    <PaymentTest />
                  </PrivateRoute>
                } 
              />
              <Route path="/" element={<Navigate to="/payments" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

