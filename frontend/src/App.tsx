import React, { useEffect, useState } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {

  const [message,setMessage] = useState('');

  useEffect(() => {
    fetch('/api/hello').
    then(response => response.json()).
    then(data => setMessage(data.message));
    console.log(message)
  }, [])

  return (
    <div className="App">
      <p>{message}</p>
    </div>
  );
}

export default App;
