import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to the Student Portal</h1>
      <p>Select your dashboard to get started.</p>
      <Link to="/dashboard" className="button">
        Go to Dashboard
      </Link>
    </div>
  );
};

export default Home;
