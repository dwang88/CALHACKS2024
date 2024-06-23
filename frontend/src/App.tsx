import React, { useEffect, useState } from 'react';
import './App.css';
import { SignInWithGoogle } from './firebaseConfig';
import SolutionOutput from './SolutionOutput';

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/hello')
      .then(response => response.json())
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
  );
}

export default App;
