import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider> {/* Wrap everything here */}
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-center" reverseOrder={false} />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<div className="text-center mt-10">Jobs Page (Coming Soon)</div>} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;