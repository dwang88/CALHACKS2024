import React from 'react';
import { Link } from 'react-router-dom';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="container">
        <div className="text">
          <h1>AI for Students</h1>
          <h1>Insights for Educators</h1>
        </div>
        <div>
          <Link to="/login">
            <button className="btn-primary">Get Started →</button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
