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
import TeacherDashboard from './TeacherDashboard';
import ProtectedRoute from './ProtectedRoute';
import AssignmentSelection from './AssignmentSelection';
import ClassPage from './pages/ClassPage';
import AssignmentPage from './pages/AssignmentPage';

function App() {
  const [message, setMessage] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
          <Route path="/teacher" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/assignments/:classId" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AssignmentSelection />
            </ProtectedRoute>
          } />
          <Route path="/classes/:classId" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ClassPage />
            </ProtectedRoute>
          } />
          <Route path="/assignment/:assignmentId" element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <AssignmentPage />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
