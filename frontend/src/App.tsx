import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
=======
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
>>>>>>> 08ee20ab183d08007cb20a36c78d77aaa08d34af
import './App.css';
import Navbar from './Navbar';
import Hero from './Hero';
import Features from './Features';
import Footer from './Footer';
import Login from './Login';
import { SignInWithGoogle } from './firebaseConfig';
import SolutionOutput from './SolutionOutput';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/hello')
      .then(response => response.json())
<<<<<<< HEAD
      .then(data => setMessage(data.message))
      .catch(error => console.error('Error fetching message:', error));
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/test-cors')
      .then(response => {
        if (response.ok) {
          console.log("CORS is working!");
        } else {
          console.error("CORS test failed.");
        }
      })
      .catch(error => console.error("Error testing CORS:", error));
  }, []);

  return (
    <div className="App">
      <SignInWithGoogle />
      <p>{message}</p>
      <SolutionOutput />
    </div>
=======
      .then(data => setMessage(data.message));
    console.log(message);
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={
            <>
              <Hero />
              <Features />
              <Footer />
            </>
          } />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
>>>>>>> 08ee20ab183d08007cb20a36c78d77aaa08d34af
  );
}

export default App;
