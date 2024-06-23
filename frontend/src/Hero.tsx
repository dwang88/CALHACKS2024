import React from 'react';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero">
      <div className="container">
        <h1>Welcome to Our Service</h1>
        <p>Experience the best service ever.</p>
        <button className="btn-primary">Get Started</button>
      </div>
    </section>
  );
}

export default Hero;
