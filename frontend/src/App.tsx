import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { useAuth } from './contexts/authContext';

function App() {
  const [message, setMessage] = useState('');
  const { currentUser, signedIn, loading, userType } = useAuth();

  const handleLogin = (type: string | undefined | null) => {
    console.log(type);
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
          <Route path="/login" element={signedIn ? (
            <Navigate to={`/${userType}`} replace />
          ) : (
              <Login onLogin={handleLogin} />
          )
        } />
          {userType === "student" && 
            <>
              <Route path="/student" element={
                <ProtectedRoute isAuthenticated={signedIn}>
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/student/:studentId/assignments/:classId" element={
                <ProtectedRoute isAuthenticated={signedIn}>
                  <AssignmentSelection />
                </ProtectedRoute>
              } />
              <Route path="/student/:studentId/assignment/:assignmentId" element={
                <ProtectedRoute isAuthenticated={signedIn}>
                  <AssignmentPage />
                </ProtectedRoute>
              } />
            </>
          }
        {userType === "teacher" && 
          <>
            <Route path="/teacher" element={
              <ProtectedRoute isAuthenticated={signedIn}>
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/teacher/classes/:classId" element={
              <ProtectedRoute isAuthenticated={signedIn}>
                <ClassPage />
              </ProtectedRoute>
            } />
          </>
        }
        </Routes>
      </div>
    </Router>
  );
}

export default App;
