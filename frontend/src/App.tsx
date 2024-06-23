import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import Footer from './Footer';
import Login from './Login';
import SolutionOutput from './SolutionOutput';
import StudentDashboard from './StudentDashboard';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    fetch('/api/hello')
      .then(response => response.json())
      .then(data => setMessage(data.message));
    console.log(message);
  }, [message]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Features />
              <SolutionOutput />
              <Footer />
            </>
          } />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/student" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <StudentDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
